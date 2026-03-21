from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Email Generation Models
class EmailGenerationRequest(BaseModel):
    sender_name: str
    sender_role: str
    sender_offer: str
    recipient_name: str
    recipient_role_company: str
    recipient_context: str
    writing_style: str
    writing_sample: Optional[str] = None

class EmailGenerationResponse(BaseModel):
    subject_line: str
    email_body: str
    follow_up: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/generate-email", response_model=EmailGenerationResponse)
async def generate_email(request: EmailGenerationRequest):
    try:
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Build the prompt
        writing_sample_text = f"\n\nWriting Sample (mimic this tone and style):\n{request.writing_sample}" if request.writing_sample else ""
        
        system_message = """You are a cold email expert. Generate hyper-personalized cold emails that:
- Are under 120 words total
- Have a hyper-personalized opener
- Lead with the recipient's pain point
- Include one soft CTA
- Avoid buzzwords and corporate jargon
- Match the specified tone and writing style exactly

Generate exactly three items:
1. Subject Line (5-8 words max, intriguing but professional)
2. Email Body (under 120 words, personalized opener, address pain, soft CTA)
3. Follow-up (under 100 words, reference previous email, add value)

Format your response EXACTLY as:
SUBJECT: [subject line here]

BODY:
[email body here]

FOLLOW_UP:
[follow-up here]"""

        user_prompt = f"""Generate a cold email with the following details:

SENDER:
- Name: {request.sender_name}
- Role: {request.sender_role}
- Offer: {request.sender_offer}

RECIPIENT:
- Name: {request.recipient_name}
- Role/Company: {request.recipient_role_company}
- Context/Pain Points: {request.recipient_context}

WRITING STYLE: {request.writing_style}{writing_sample_text}

Generate a subject line, email body, and follow-up email following all the rules."""

        # Initialize chat with Gemini
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")

        # Send message
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse response
        response_text = response.strip()
        
        # Extract subject, body, and follow-up
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
            # Fallback parsing
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
        
        # Ensure we have all parts
        if not subject_line or not email_body or not follow_up:
            raise HTTPException(status_code=500, detail="Failed to parse email generation response")
        
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