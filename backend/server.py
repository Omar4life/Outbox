from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from passlib.context import CryptContext
from jose import JWTError, jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Stripe
stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Subscription tiers
SUBSCRIPTION_LIMITS = {
    "free": {"daily_emails": 5, "writing_samples": 3, "reply_handler": False},
    "pro": {"daily_emails": 999999, "writing_samples": 999999, "reply_handler": True}
}

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    subscription_tier: str = "free"
    subscription_status: Optional[str] = "active"
    created_at: str

# Email Models
class EmailGenerationRequest(BaseModel):
    sender_name: str
    sender_role: str
    sender_offer: str
    recipient_name: str
    recipient_role_company: str
    recipient_context: str
    writing_style: Optional[str] = None
    writing_sample: Optional[str] = None

class EmailGenerationResponse(BaseModel):
    subject_line: str
    email_body: str
    follow_up: str

class ReplyHandlerRequest(BaseModel):
    original_email: str
    recipient_reply: str
    context: Optional[str] = None

class ReplyHandlerResponse(BaseModel):
    suggested_response: str

class UsageStats(BaseModel):
    daily_emails_used: int
    daily_emails_limit: int
    writing_samples_used: int
    writing_samples_limit: int
    reply_handler_access: bool
    subscription_tier: str

class CheckoutRequest(BaseModel):
    plan: str
    billing: str
    origin_url: str

# Auth Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return User(**user)

async def check_usage_limit(user_id: str, limit_type: str):
    today = datetime.now(timezone.utc).date().isoformat()
    usage = await db.usage.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    tier = user.get("subscription_tier", "free")
    limits = SUBSCRIPTION_LIMITS[tier]
    
    if not usage:
        usage = {"user_id": user_id, "date": today, "emails_generated": 0, "samples_used": 0}
        await db.usage.insert_one(usage)
    
    if limit_type == "email":
        if usage.get("emails_generated", 0) >= limits["daily_emails"]:
            return False
    elif limit_type == "sample":
        if usage.get("samples_used", 0) >= limits["writing_samples"]:
            return False
    
    return True

async def increment_usage(user_id: str, limit_type: str):
    today = datetime.now(timezone.utc).date().isoformat()
    field = "emails_generated" if limit_type == "email" else "samples_used"
    await db.usage.update_one(
        {"user_id": user_id, "date": today},
        {"$inc": {field: 1}},
        upsert=True
    )

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "subscription_tier": "free",
        "subscription_status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "subscription_tier": "free"
        }
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "subscription_tier": user.get("subscription_tier", "free")
        }
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/usage", response_model=UsageStats)
async def get_usage(current_user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    usage = await db.usage.find_one({"user_id": current_user.id, "date": today}, {"_id": 0})
    
    tier = current_user.subscription_tier
    limits = SUBSCRIPTION_LIMITS.get(tier, SUBSCRIPTION_LIMITS["free"])
    
    return UsageStats(
        daily_emails_used=usage.get("emails_generated", 0) if usage else 0,
        daily_emails_limit=limits["daily_emails"],
        writing_samples_used=usage.get("samples_used", 0) if usage else 0,
        writing_samples_limit=limits["writing_samples"],
        reply_handler_access=limits["reply_handler"],
        subscription_tier=tier
    )

# Email Generation
@api_router.post("/generate-email", response_model=EmailGenerationResponse)
async def generate_email(request: EmailGenerationRequest, current_user: User = Depends(get_current_user)):
    try:
        # Check usage limit
        if not await check_usage_limit(current_user.id, "email"):
            raise HTTPException(status_code=429, detail="Daily email limit reached. Upgrade to Pro for unlimited access.")
        
        if request.writing_sample:
            if not await check_usage_limit(current_user.id, "sample"):
                raise HTTPException(status_code=429, detail="Writing sample limit reached. Upgrade to Pro for unlimited access.")
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        if not request.writing_style and not request.writing_sample:
            default_style = "conversational and authentic, like a real person reaching out"
        else:
            default_style = request.writing_style or "conversational and professional"
        
        writing_sample_text = f"\n\nWriting Sample (match this exact tone, vocabulary, and sentence structure):\n{request.writing_sample}" if request.writing_sample else ""
        
        system_message = """You are an expert cold email writer. Your emails sound human and authentic, never corporate or sales-y.

CRITICAL RULES:
1. NEVER use em dashes (—). Use regular dashes (-) or commas instead.
2. AVOID corporate jargon: hectic, bandwidth, synergy, leverage, touch base, circle back, deep dive, low-hanging fruit, game-changer, disruptive
3. Write like a real person texting a colleague, not a marketing team
4. Keep it under 120 words total
5. Start with something specific about them (not generic praise)
6. Lead with their pain point, not your product
7. One simple question as CTA, not "let's schedule a call"
8. Use simple words. If a 12-year-old wouldn't understand it, don't use it.
9. Short sentences. Vary length. Breathe.
10. If writing style is provided, match it EXACTLY - same vocabulary level, sentence patterns, tone

Generate exactly three items formatted as:
SUBJECT: [subject line here]

BODY:
[email body here]

FOLLOW_UP:
[follow-up here]"""

        user_prompt = f"""Create a cold email:

SENDER:
- Name: {request.sender_name}
- Role: {request.sender_role}
- What they offer: {request.sender_offer}

RECIPIENT:
- Name: {request.recipient_name}
- Role/Company: {request.recipient_role_company}
- Context: {request.recipient_context}

WRITING STYLE: {default_style}{writing_sample_text}

Remember: No em dashes. No jargon. Sound human."""

        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")

        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        response_text = response.strip()
        
        subject_line = ""
        email_body = ""
        follow_up = ""
        
        if "SUBJECT:" in response_text and "BODY:" in response_text and "FOLLOW_UP:" in response_text:
            parts = response_text.split("SUBJECT:")[1].split("BODY:")
            subject_line = parts[0].strip()
            
            body_parts = parts[1].split("FOLLOW_UP:")
            email_body = body_parts[0].strip()
            follow_up = body_parts[1].strip()
        else:
            lines = response_text.split('\n')
            current_section = None
            temp_body = []
            temp_follow = []
            
            for line in lines:
                if line.startswith('SUBJECT:'):
                    subject_line = line.replace('SUBJECT:', '').strip()
                    current_section = 'subject'
                elif line.startswith('BODY:'):
                    current_section = 'body'
                elif line.startswith('FOLLOW_UP:'):
                    current_section = 'follow_up'
                elif current_section == 'body' and line.strip():
                    temp_body.append(line.strip())
                elif current_section == 'follow_up' and line.strip():
                    temp_follow.append(line.strip())
            
            if temp_body:
                email_body = '\n'.join(temp_body)
            if temp_follow:
                follow_up = '\n'.join(temp_follow)
        
        if not subject_line or not email_body or not follow_up:
            raise HTTPException(status_code=500, detail="Failed to parse email generation response")
        
        # Increment usage
        await increment_usage(current_user.id, "email")
        if request.writing_sample:
            await increment_usage(current_user.id, "sample")
        
        # Save to history
        history_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "subject_line": subject_line,
            "email_body": email_body,
            "follow_up": follow_up,
            "sender_name": request.sender_name,
            "recipient_name": request.recipient_name,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.email_history.insert_one(history_doc)
        
        return EmailGenerationResponse(
            subject_line=subject_line,
            email_body=email_body,
            follow_up=follow_up
        )
    
    except Exception as e:
        logger.error(f"Error generating email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Reply Handler (Pro only)
@api_router.post("/reply-handler", response_model=ReplyHandlerResponse)
async def handle_reply(request: ReplyHandlerRequest, current_user: User = Depends(get_current_user)):
    try:
        # Check Pro access
        if current_user.subscription_tier != "pro":
            raise HTTPException(status_code=403, detail="Reply Handler is a Pro feature. Upgrade to access.")
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        system_message = """You are an expert email response writer. Generate professional, thoughtful responses to emails.

RULES:
1. Match the tone of the original conversation
2. Be concise and direct
3. Address all points raised in the reply
4. No jargon or buzzwords
5. Sound human and authentic
6. Keep under 150 words
7. No em dashes

Return only the suggested response text, no preamble."""

        context_text = f"\n\nAdditional context: {request.context}" if request.context else ""
        
        user_prompt = f"""Original email I sent:
{request.original_email}

Their reply:
{request.recipient_reply}{context_text}

Generate a perfect response."""

        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")

        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        return ReplyHandlerResponse(suggested_response=response.strip())
    
    except Exception as e:
        logger.error(f"Error handling reply: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Stripe Checkout
@api_router.post("/checkout/session")
async def create_checkout_session(checkout_req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    try:
        # Define pricing
        PRICES = {
            "pro_monthly": 7.00,
            "pro_annual": 60.00  # $5/month * 12
        }
        
        if checkout_req.plan != "pro":
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        price_key = f"pro_{checkout_req.billing}"
        if price_key not in PRICES:
            raise HTTPException(status_code=400, detail="Invalid billing cycle")
        
        amount = PRICES[price_key]
        
        # Create webhook and checkout
        webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        success_url = f"{checkout_req.origin_url}/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
        cancel_url = f"{checkout_req.origin_url}/pricing"
        
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": current_user.id,
                "plan": checkout_req.plan,
                "billing": checkout_req.billing
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create transaction record
        transaction_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": current_user.id,
            "amount": amount,
            "currency": "usd",
            "plan": checkout_req.plan,
            "billing": checkout_req.billing,
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(transaction_doc)
        
        return {"url": session.url, "session_id": session.session_id}
    
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, current_user: User = Depends(get_current_user)):
    try:
        webhook_url = "placeholder"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction if paid
        if status.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            
            if transaction and transaction.get("payment_status") != "paid":
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                # Upgrade user to Pro
                await db.users.update_one(
                    {"id": transaction["user_id"]},
                    {"$set": {"subscription_tier": "pro", "subscription_status": "active"}}
                )
        
        return status
    
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        webhook_url = "placeholder"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            metadata = webhook_response.metadata
            user_id = metadata.get("user_id")
            
            if user_id:
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"subscription_tier": "pro", "subscription_status": "active"}}
                )
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()