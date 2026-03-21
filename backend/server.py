from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
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

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


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
    created_at: str

# Email Generation Models
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


# Auth Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
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


# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name
        }
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# Email Generation Route (Protected)
@api_router.post("/generate-email", response_model=EmailGenerationResponse)
async def generate_email(request: EmailGenerationRequest, current_user: User = Depends(get_current_user)):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Improved writing style handling
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
        
        # Parse response
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
        raise HTTPException(status_code=500, detail=f"Failed to generate email: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()