from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal, Optional
import uuid
import secrets
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone
import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = 'HS256'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# JWT secret: must come from the environment. If it is missing (local dev),
# use a random per-process secret so no known default can ever sign tokens.
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    JWT_SECRET = secrets.token_urlsafe(48)
    logger.warning("JWT_SECRET is not set; using a random secret. Logins will reset when the server restarts.")

# Emails listed here get the admin role when they sign up (comma separated).
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()}

BOOKING_STATUSES = ["pending", "confirmed", "declined", "completed", "cancelled"]

# ===== MODELS =====
class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    name: str
    role: str = "client"  # client, agency or admin
    phone: Optional[str] = None

class UserCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    name: str
    # Only these roles can be chosen at signup. Admins come from ADMIN_EMAILS.
    role: Literal["client", "agency"] = "client"
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AgencyReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: str
    rating: int
    comment: str
    date: str
    care_type: str  # e.g., "Elderly Care", "Post-Surgery"
    relationship: str  # e.g., "Daughter", "Son", "Spouse"

class AgencyBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    bio: str
    description: str = ""  # Longer description for detail page
    location: str
    city: str
    experience_years: int
    certifications: List[str] = []
    specialties: List[str] = []
    price_per_hour: float
    rating: float = 4.5
    review_count: int = 0
    image_url: str  # Main/primary image
    gallery_images: List[str] = []  # Multiple images: office, caregivers, care scenes
    is_verified: bool = False
    is_new: bool = False
    total_caregivers: int = 10
    years_in_business: int = 5
    families_served: int = 100
    reviews: List[dict] = []  # Embedded reviews from families

class Agency(AgencyBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    agency_id: str
    service_type: str
    date: str
    time_slot: str
    notes: Optional[str] = None
    patient_name: str
    patient_age: Optional[int] = None
    care_needs: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    agency_id: str
    service_type: str
    date: str
    time_slot: str
    notes: Optional[str] = None
    patient_name: str
    patient_age: Optional[int] = None
    care_needs: Optional[str] = None
    status: str = "pending"  # pending, confirmed, completed, cancelled
    total_price: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)

class BookingStatusUpdate(BaseModel):
    status: Literal["confirmed", "declined", "completed", "cancelled"]

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# ===== AUTH HELPERS =====
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ===== EMAIL =====
def _send_email_sync(to: str, subject: str, body: str):
    host = os.environ.get('SMTP_HOST')
    if not host:
        logger.info("Email (SMTP not configured) to=%s subject=%s\n%s", to, subject, body)
        return
    msg = EmailMessage()
    msg['From'] = os.environ.get('EMAIL_FROM', 'Voallen <no-reply@voallen.com>')
    msg['To'] = to
    msg['Subject'] = subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(host, int(os.environ.get('SMTP_PORT', '587')), timeout=15) as smtp:
            if os.environ.get('SMTP_USE_TLS', 'true').lower() != 'false':
                smtp.starttls()
            user = os.environ.get('SMTP_USER')
            if user:
                smtp.login(user, os.environ.get('SMTP_PASSWORD', ''))
            smtp.send_message(msg)
    except Exception:
        logger.exception("Failed to send email to %s", to)

def queue_email(background: BackgroundTasks, to: Optional[str], subject: str, body: str):
    if to:
        background.add_task(_send_email_sync, to, subject, body)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def is_admin(user: dict) -> bool:
    """Admins are users with the admin role, or whose email is listed in ADMIN_EMAILS.
    The email check means an existing agency or client account can also be an admin."""
    return user.get('role') == 'admin' or (user.get('email') or '').strip().lower() in ADMIN_EMAILS

def public_user(user: dict) -> dict:
    data = {k: v for k, v in user.items() if k not in ('password', '_id')}
    data['is_admin'] = is_admin(user)
    return data

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None

# Agency listing status. Sample agencies have no status field and count as available.
AGENCY_STATUSES = ["pending_approval", "available", "unavailable"]
HIDDEN_AGENCY_STATUSES = ["pending_approval", "unavailable"]

def agency_is_public(agency: dict) -> bool:
    return agency.get('status', 'available') not in HIDDEN_AGENCY_STATUSES

def history_entry(status: str, user: dict, actor_role: str, note: Optional[str] = None) -> dict:
    return {
        "status": status,
        "by_id": user.get('id'),
        "by_name": user.get('name'),
        "by_role": actor_role,  # client, agency or admin
        "note": note,
        "at": datetime.now(timezone.utc).isoformat(),
    }

# ===== ROUTES =====
@api_router.get("/")
async def root():
    return {"message": "Voallen - In-Home Care Marketplace API"}

# Auth Routes
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        # Admin access comes from ADMIN_EMAILS (see is_admin), so admins keep their own client/agency role
        "role": user_data.role,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = public_user(user_doc)
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    user_response = public_user(user)
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return public_user(user)

# Agency Routes
@api_router.get("/agencies")
async def get_agencies(city: Optional[str] = None, specialty: Optional[str] = None):
    # Only approved, available agencies are listed
    query = {"status": {"$nin": HIDDEN_AGENCY_STATUSES}}
    if city:
        query["city"] = city
    if specialty:
        query["specialties"] = {"$in": [specialty]}
    
    agencies = await db.agencies.find(query, {"_id": 0}).to_list(100)
    return agencies

@api_router.get("/agencies/{agency_id}")
async def get_agency(agency_id: str, viewer: Optional[dict] = Depends(optional_user)):
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    # Hidden agencies are only visible to their owner and admins
    if not agency_is_public(agency) and not (viewer and (is_admin(viewer) or viewer['id'] == agency.get('user_id'))):
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Reviews are embedded in the agency document
    return agency

@api_router.post("/agencies")
async def create_agency(agency_data: AgencyBase, user: dict = Depends(get_current_user)):
    if user.get('role') != 'agency':
        raise HTTPException(status_code=403, detail="Only agency accounts can create profiles")
    
    if await db.agencies.find_one({"user_id": user['id']}):
        raise HTTPException(status_code=400, detail="You already have an agency profile")

    agency_id = str(uuid.uuid4())
    data = agency_data.model_dump()
    # Ratings, reviews and verification are earned, not self-reported
    data.update({"rating": 0, "review_count": 0, "reviews": [], "is_verified": False, "is_new": True,
                 "status": "pending_approval"})  # hidden until an admin approves it
    agency_doc = {
        "id": agency_id,
        "user_id": user['id'],
        **data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.agencies.insert_one(agency_doc)
    return {k: v for k, v in agency_doc.items() if k != '_id'}

@api_router.get("/agency/me")
async def get_my_agency(user: dict = Depends(get_current_user)):
    if user.get('role') != 'agency':
        raise HTTPException(status_code=403, detail="Agency account required")
    agency = await db.agencies.find_one({"user_id": user['id']}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="No agency profile yet")
    return agency

@api_router.get("/agency/bookings")
async def get_agency_bookings(user: dict = Depends(get_current_user)):
    if user.get('role') != 'agency':
        raise HTTPException(status_code=403, detail="Agency account required")
    agency = await db.agencies.find_one({"user_id": user['id']}, {"_id": 0})
    if not agency:
        return []
    bookings = await db.bookings.find({"agency_id": agency['id']}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for booking in bookings:
        client = await db.users.find_one({"id": booking.get('user_id')}, {"_id": 0, "password": 0})
        if client:
            booking['client'] = {"name": client.get('name'), "email": client.get('email'), "phone": client.get('phone')}
    return bookings

# Booking Routes
@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, background: BackgroundTasks, user: dict = Depends(get_current_user)):
    agency = await db.agencies.find_one({"id": booking_data.agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    if not agency_is_public(agency):
        raise HTTPException(status_code=400, detail="This agency isn't taking bookings right now")
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id,
        "user_id": user['id'],
        "agency_id": booking_data.agency_id,
        "service_type": booking_data.service_type,
        "date": booking_data.date,
        "time_slot": booking_data.time_slot,
        "notes": booking_data.notes,
        "patient_name": booking_data.patient_name,
        "patient_age": booking_data.patient_age,
        "care_needs": booking_data.care_needs,
        "total_price": agency.get('price_per_hour', 50),
        "status": "pending",
        "history": [history_entry("pending", user, "client")],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking_doc)

    summary = (f"Agency: {agency['name']}\nService: {booking_data.service_type}\n"
               f"Date: {booking_data.date} at {booking_data.time_slot}\nPatient: {booking_data.patient_name}")
    queue_email(background, user.get('email'), "Your Voallen consultation request was sent",
                f"Hi {user.get('name', '')},\n\nWe sent your consultation request. "
                f"The agency will confirm or decline it soon.\n\n{summary}\n\nThe Voallen team")
    if agency.get('user_id'):
        owner = await db.users.find_one({"id": agency['user_id']}, {"_id": 0})
        if owner:
            queue_email(background, owner.get('email'), "New consultation request on Voallen",
                        f"You have a new consultation request from {user.get('name', 'a client')}.\n\n{summary}\n\n"
                        f"Log in to your Voallen dashboard to accept or decline it.")
    # Return without _id
    return {k: v for k, v in booking_doc.items() if k != '_id'}

@api_router.get("/bookings")
async def get_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    
    # Enrich with agency info
    for booking in bookings:
        agency = await db.agencies.find_one({"id": booking.get('agency_id')}, {"_id": 0})
        if agency:
            booking['agency'] = agency
    
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id, "user_id": user['id']}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# Which status changes each side may make, keyed by current status
AGENCY_TRANSITIONS = {"pending": {"confirmed", "declined"}, "confirmed": {"completed", "declined"}}
CLIENT_TRANSITIONS = {"pending": {"cancelled"}, "confirmed": {"cancelled"}}

@api_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, update: BookingStatusUpdate, background: BackgroundTasks,
                                user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    agency = await db.agencies.find_one({"id": booking['agency_id']}, {"_id": 0})

    is_owner_agency = user.get('role') == 'agency' and agency and agency.get('user_id') == user['id']
    is_client = booking['user_id'] == user['id']
    if is_owner_agency:
        allowed = AGENCY_TRANSITIONS.get(booking['status'], set())
    elif is_client:
        allowed = CLIENT_TRANSITIONS.get(booking['status'], set())
    else:
        raise HTTPException(status_code=403, detail="Not allowed to change this booking")
    if update.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Cannot change a {booking['status']} booking to {update.status}")

    entry = history_entry(update.status, user, "agency" if is_owner_agency else "client")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": update.status, "updated_at": entry['at']},
                                                      "$push": {"history": entry}})
    booking.update({"status": update.status, "updated_at": entry['at']})
    booking.setdefault("history", []).append(entry)

    agency_name = agency['name'] if agency else "the agency"
    when = f"{booking['date']} at {booking['time_slot']}"
    if is_owner_agency:
        client = await db.users.find_one({"id": booking['user_id']}, {"_id": 0})
        messages = {
            "confirmed": f"Good news: {agency_name} confirmed your consultation on {when}.",
            "declined": f"{agency_name} can't take your consultation on {when}. You can book another agency on Voallen.",
            "completed": f"Your visit with {agency_name} is marked complete. You can now leave a review from your dashboard.",
        }
        if client:
            queue_email(background, client.get('email'), f"Your Voallen booking is {update.status}",
                        f"Hi {client.get('name', '')},\n\n{messages[update.status]}\n\nThe Voallen team")
    elif agency and agency.get('user_id'):
        owner = await db.users.find_one({"id": agency['user_id']}, {"_id": 0})
        if owner:
            queue_email(background, owner.get('email'), "A Voallen booking was cancelled",
                        f"{user.get('name', 'A client')} cancelled their consultation on {when}.")
    return booking

# Review Routes
@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": review_data.booking_id, "user_id": user['id']}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get('status') != 'completed':
        raise HTTPException(status_code=400, detail="You can review an agency after your visit is completed")
    if booking.get('review_id'):
        raise HTTPException(status_code=400, detail="You already reviewed this visit")
    agency = await db.agencies.find_one({"id": booking['agency_id']}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    review_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user['id'],
        "user_name": user.get('name', 'Anonymous'),
        "rating": review_data.rating,
        "comment": review_data.comment,
        "care_type": booking.get('service_type', ''),
        "relationship": "Verified client",
        "booking_id": booking['id'],
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    # Blend the new rating into the existing average instead of replacing it
    count = int(agency.get('review_count') or 0)
    rating = float(agency.get('rating') or 0)
    new_count = count + 1
    new_rating = round((rating * count + review_data.rating) / new_count, 1)
    await db.agencies.update_one(
        {"id": agency['id']},
        {"$push": {"reviews": {"$each": [review_doc], "$position": 0}},
         "$set": {"rating": new_rating, "review_count": new_count}}
    )
    await db.bookings.update_one({"id": booking['id']}, {"$set": {"review_id": review_doc['id']}})
    return review_doc

@api_router.get("/reviews/{agency_id}")
async def get_reviews(agency_id: str):
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0, "reviews": 1})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    return agency.get('reviews', [])

# Contact Routes
@api_router.post("/contact")
async def submit_contact(contact_data: ContactCreate):
    contact_id = str(uuid.uuid4())
    contact_doc = {
        "id": contact_id,
        **contact_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(contact_doc)
    return {"message": "Thank you for your message. We will get back to you soon!"}

@api_router.get("/contact/messages")
async def get_contact_messages(user: dict = Depends(require_admin)):
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

# ===== ADMIN =====
class AgencyAdminUpdate(BaseModel):
    is_verified: Optional[bool] = None
    status: Optional[Literal["available", "unavailable"]] = None

class AdminBookingStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "declined", "completed", "cancelled"]
    note: Optional[str] = Field(default=None, max_length=500)

@api_router.get("/admin/overview")
async def admin_overview(user: dict = Depends(require_admin)):
    return {
        "agencies": await db.agencies.count_documents({}),
        "awaiting_approval": await db.agencies.count_documents({"status": "pending_approval"}),
        "unverified_agencies": await db.agencies.count_documents({"is_verified": {"$ne": True}}),
        "clients": await db.users.count_documents({"role": "client"}),
        "agency_accounts": await db.users.count_documents({"role": "agency"}),
        "bookings": await db.bookings.count_documents({}),
        "pending_bookings": await db.bookings.count_documents({"status": "pending"}),
        "messages": await db.contact_messages.count_documents({}),
    }

@api_router.get("/admin/agencies")
async def admin_agencies(user: dict = Depends(require_admin)):
    agencies = await db.agencies.find({}, {"_id": 0, "reviews": 0, "gallery_images": 0}).to_list(1000)
    owners = {u['id']: u for u in await db.users.find({"role": "agency"}, {"_id": 0, "password": 0}).to_list(5000)}
    counts = {}
    for b in await db.bookings.find({}, {"_id": 0, "agency_id": 1}).to_list(10000):
        counts[b['agency_id']] = counts.get(b['agency_id'], 0) + 1
    for a in agencies:
        owner = owners.get(a.get('user_id'))
        a['owner'] = {"name": owner.get('name'), "email": owner.get('email')} if owner else None
        a['booking_count'] = counts.get(a['id'], 0)
    # Newest self-registered agencies first, sample agencies after
    for a in agencies:
        a.setdefault('status', 'available')
    agencies.sort(key=lambda a: str(a.get('created_at', '')), reverse=True)
    agencies.sort(key=lambda a: a.get('user_id') is None)
    # Agencies waiting for approval go to the top
    agencies.sort(key=lambda a: a['status'] != 'pending_approval')
    return agencies

@api_router.patch("/admin/agencies/{agency_id}")
async def admin_update_agency(agency_id: str, update: AgencyAdminUpdate, background: BackgroundTasks,
                              user: dict = Depends(require_admin)):
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="Nothing to update")
    before = await db.agencies.find_one({"id": agency_id}, {"_id": 0, "reviews": 0})
    if not before:
        raise HTTPException(status_code=404, detail="Agency not found")
    await db.agencies.update_one({"id": agency_id}, {"$set": changes})
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0, "reviews": 0})
    agency.setdefault('status', 'available')

    old_status = before.get('status', 'available')
    if 'status' in changes and changes['status'] != old_status and agency.get('user_id'):
        owner = await db.users.find_one({"id": agency['user_id']}, {"_id": 0})
        if owner:
            if old_status == 'pending_approval' and changes['status'] == 'available':
                msg = f"{agency['name']} is approved and now listed on Voallen. Families can find and book you."
            elif changes['status'] == 'available':
                msg = f"{agency['name']} is listed on Voallen again and can receive bookings."
            else:
                msg = f"{agency['name']} has been set to unavailable on Voallen and is hidden from families for now."
            queue_email(background, owner.get('email'), "Your Voallen listing was updated", msg)
    return agency

@api_router.get("/admin/agencies/{agency_id}")
async def admin_agency_detail(agency_id: str, user: dict = Depends(require_admin)):
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    agency.setdefault('status', 'available')
    owner = await db.users.find_one({"id": agency.get('user_id')}, {"_id": 0, "password": 0}) if agency.get('user_id') else None
    agency['owner'] = {"name": owner.get('name'), "email": owner.get('email'), "phone": owner.get('phone')} if owner else None
    bookings = await db.bookings.find({"agency_id": agency_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    users = {u['id']: u for u in await db.users.find({"id": {"$in": list({b['user_id'] for b in bookings})}},
                                                       {"_id": 0, "id": 1, "name": 1, "email": 1, "phone": 1}).to_list(5000)}
    counts = {}
    for b in bookings:
        c = users.get(b['user_id'])
        b['client'] = {"name": c.get('name'), "email": c.get('email'), "phone": c.get('phone')} if c else None
        counts[b['status']] = counts.get(b['status'], 0) + 1
    agency['bookings'] = bookings
    agency['booking_counts'] = counts
    return agency

@api_router.patch("/admin/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: str, update: AdminBookingStatusUpdate, background: BackgroundTasks,
                                      user: dict = Depends(require_admin)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if update.status == booking['status']:
        raise HTTPException(status_code=400, detail=f"Booking is already {update.status}")
    entry = history_entry(update.status, user, "admin", update.note)
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": update.status, "updated_at": entry['at']},
                                                      "$push": {"history": entry}})
    booking.update({"status": update.status, "updated_at": entry['at']})
    booking.setdefault("history", []).append(entry)

    agency = await db.agencies.find_one({"id": booking['agency_id']}, {"_id": 0})
    agency_name = agency['name'] if agency else "the agency"
    body = (f"Voallen updated your booking with {agency_name} on {booking['date']} at {booking['time_slot']} "
            f"to: {update.status}." + (f"\n\nNote: {update.note}" if update.note else ""))
    client = await db.users.find_one({"id": booking['user_id']}, {"_id": 0})
    if client:
        queue_email(background, client.get('email'), f"Your Voallen booking is {update.status}", body)
    if agency and agency.get('user_id'):
        owner = await db.users.find_one({"id": agency['user_id']}, {"_id": 0})
        if owner:
            queue_email(background, owner.get('email'), f"Voallen changed a booking to {update.status}", body)
    return booking

@api_router.get("/admin/bookings")
async def admin_bookings(user: dict = Depends(require_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    agencies = {a['id']: a['name'] for a in await db.agencies.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(5000)}
    users = {u['id']: u for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1, "email": 1}).to_list(10000)}
    for b in bookings:
        b['agency_name'] = agencies.get(b['agency_id'])
        client = users.get(b['user_id'])
        b['client'] = {"name": client.get('name'), "email": client.get('email')} if client else None
    return bookings

@api_router.get("/admin/users")
async def admin_users(user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(5000)
    return [public_user(u) for u in users]

# Seed data - sample agencies, loaded at startup when the database is empty
async def seed_agencies():
    # Check if already seeded
    existing = await db.agencies.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded", "count": existing}
    
    # Helper function to generate reviews for agencies
    def generate_reviews(agency_specialties):
        review_templates = [
            {"user_name": "Sarah M.", "rating": 5, "comment": "The caregivers from this agency have been absolutely wonderful with my mother. They treat her with dignity and respect, and she looks forward to their visits.", "relationship": "Daughter", "care_type": "Elderly Care"},
            {"user_name": "Michael T.", "rating": 5, "comment": "After my father's hip surgery, their team was there every step of the way. Professional, punctual, and genuinely caring.", "relationship": "Son", "care_type": "Post-Surgery"},
            {"user_name": "Jennifer K.", "rating": 4, "comment": "Great communication and flexible scheduling. The caregiver assigned to us became like family.", "relationship": "Daughter", "care_type": "Companionship"},
            {"user_name": "Robert & Linda P.", "rating": 5, "comment": "We interviewed several agencies before choosing this one. Best decision we made. Mom is thriving!", "relationship": "Family", "care_type": "Elderly Care"},
            {"user_name": "David W.", "rating": 5, "comment": "The overnight care for my wife has been exceptional. I can finally get some rest knowing she's in good hands.", "relationship": "Spouse", "care_type": "24-Hour Care"},
            {"user_name": "Patricia H.", "rating": 4, "comment": "Very responsive to our changing needs. When Dad's condition changed, they adjusted the care plan immediately.", "relationship": "Daughter", "care_type": "Chronic Conditions"},
            {"user_name": "James L.", "rating": 5, "comment": "The dementia care specialists here truly understand the challenges. They've made such a difference for our family.", "relationship": "Son", "care_type": "Dementia Care"},
            {"user_name": "Elizabeth R.", "rating": 5, "comment": "Compassionate, skilled, and reliable. Everything you want in a home care agency.", "relationship": "Granddaughter", "care_type": "Elderly Care"},
        ]
        import random
        num_reviews = random.randint(4, 6)
        selected = random.sample(review_templates, num_reviews)
        for i, review in enumerate(selected):
            review["id"] = str(uuid.uuid4())
            review["date"] = f"202{random.randint(3,4)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        return selected
    
    agencies_data = [
        # Philadelphia, PA - 7 agencies
        {
            "id": str(uuid.uuid4()),
            "name": "Caring Hearts Home Care",
            "bio": "Award-winning in-home care agency serving Philadelphia families since 2009.",
            "description": "Caring Hearts Home Care has been a trusted partner for Philadelphia families for over 15 years. Our team of certified caregivers provides personalized, compassionate care that allows your loved ones to maintain their independence and dignity in the comfort of their own home. We specialize in elderly care, post-surgery recovery, and chronic condition management. Every caregiver undergoes rigorous background checks, ongoing training, and is matched carefully to each client's unique needs and personality.",
            "location": "1234 Market Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 15,
            "certifications": ["State Licensed", "Medicare Certified", "ACHC Accredited", "BBB A+ Rating"],
            "specialties": ["Elderly Care", "Post-Surgery Recovery", "Chronic Conditions", "Companionship"],
            "price_per_hour": 16,
            "rating": 4.9,
            "review_count": 124,
            "image_url": "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 45,
            "years_in_business": 15,
            "families_served": 1200,
            "reviews": generate_reviews(["Elderly Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gentle Touch Nursing",
            "bio": "Specialized pediatric and family care services with registered nurses.",
            "description": "Gentle Touch Nursing brings hospital-quality care into your home. Our team includes registered nurses and certified nursing assistants dedicated to providing the highest standard of care for children and adults alike. We understand that having a healthcare professional in your home requires trust, which is why we take extra care in selecting and training our staff. From infant care to special needs support, our nurses are equipped to handle complex medical situations with grace and expertise.",
            "location": "567 Walnut Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 12,
            "certifications": ["Pediatric Certified", "State Licensed", "CPR Certified", "First Aid Certified"],
            "specialties": ["Pediatric Care", "Infant Care", "Special Needs", "Medical Support"],
            "price_per_hour": 18,
            "rating": 4.8,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 32,
            "years_in_business": 12,
            "families_served": 850,
            "reviews": generate_reviews(["Pediatric Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Philadelphia Senior Services",
            "bio": "Dedicated to enhancing quality of life for seniors with specialized dementia care.",
            "description": "Philadelphia Senior Services has been the city's premier provider of senior care for two decades. Our specialized programs for dementia and Alzheimer's care set us apart, with caregivers trained in the latest therapeutic approaches. We believe in treating the whole person—mind, body, and spirit—which is why our care plans include not just physical assistance, but also social engagement, mental stimulation, and emotional support. Our compassionate team becomes an extension of your family.",
            "location": "890 Chestnut Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 20,
            "certifications": ["Alzheimer's Certified", "State Licensed", "Bonded & Insured", "Dementia Care Specialist"],
            "specialties": ["Dementia Care", "Alzheimer's", "Companionship", "Memory Care"],
            "price_per_hour": 15,
            "rating": 4.7,
            "review_count": 156,
            "image_url": "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 58,
            "years_in_business": 20,
            "families_served": 2100,
            "reviews": generate_reviews(["Dementia Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "HomeWell Care Services",
            "bio": "Comprehensive home healthcare including skilled nursing and physical therapy.",
            "description": "HomeWell Care Services provides a complete spectrum of in-home healthcare services throughout greater Philadelphia. Our skilled nursing team can handle everything from medication management to wound care, while our physical and occupational therapists help clients regain mobility and independence. We coordinate closely with physicians and hospitals to ensure seamless transitions from facility to home care, making recovery smoother and more comfortable for everyone involved.",
            "location": "123 Broad Street, Philadelphia, PA 19102",
            "city": "Philadelphia, PA",
            "experience_years": 8,
            "certifications": ["Medicare Certified", "State Licensed", "Joint Commission Accredited"],
            "specialties": ["Skilled Nursing", "Physical Therapy", "Personal Care", "Medication Management"],
            "price_per_hour": 17,
            "rating": 4.6,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/5206919/pexels-photo-5206919.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 28,
            "years_in_business": 8,
            "families_served": 520,
            "reviews": generate_reviews(["Skilled Nursing"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nurturing Angels Care",
            "bio": "Round-the-clock care specialists for overnight and 24-hour support.",
            "description": "Nurturing Angels Care specializes in providing continuous, round-the-clock care for those who need constant supervision and support. Whether you need overnight care so family caregivers can rest, or full 24-hour care for complex medical situations, our angels are there. We understand the stress that comes with caring for a loved one with high needs, and we're committed to providing peace of mind along with exceptional care. Our team works in shifts to ensure fresh, attentive caregivers at all times.",
            "location": "456 Pine Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 10,
            "certifications": ["24/7 Care Certified", "State Licensed", "Background Checked", "Hospice Trained"],
            "specialties": ["24-Hour Care", "Overnight Care", "Hospice Support", "Respite Care"],
            "price_per_hour": 15,
            "rating": 4.8,
            "review_count": 98,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551622/pexels-photo-7551622.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 52,
            "years_in_business": 10,
            "families_served": 780,
            "reviews": generate_reviews(["24-Hour Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Liberty Home Health",
            "bio": "Wound care specialists and post-operative care experts.",
            "description": "Liberty Home Health brings clinical expertise to your doorstep. Our team of wound care certified nurses and post-operative care specialists helps patients recover from surgeries, manage complex wounds, and handle IV therapy in the comfort of home. We work directly with surgeons and physicians to follow care protocols precisely, reducing the risk of complications and hospital readmissions. Our goal is to get you back to your normal life as quickly and safely as possible.",
            "location": "789 Spruce Street, Philadelphia, PA 19107",
            "city": "Philadelphia, PA",
            "experience_years": 14,
            "certifications": ["Wound Care Certified", "State Licensed", "OASIS Certified", "IV Therapy Trained"],
            "specialties": ["Wound Care", "Post-Op Care", "IV Therapy", "Surgical Recovery"],
            "price_per_hour": 18,
            "rating": 4.9,
            "review_count": 112,
            "image_url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/5207100/pexels-photo-5207100.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460153/pexels-photo-8460153.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/8460072/pexels-photo-8460072.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": True,
            "is_new": False,
            "total_caregivers": 35,
            "years_in_business": 14,
            "families_served": 920,
            "reviews": generate_reviews(["Post-Op Care"])
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Keystone Care Partners",
            "bio": "Mental health and behavioral support specialists.",
            "description": "Keystone Care Partners provides compassionate care for individuals with psychiatric conditions and developmental disabilities. Our specially trained caregivers understand the unique challenges of mental health care and are skilled in de-escalation techniques, medication reminders, and therapeutic engagement. We believe everyone deserves to live with dignity in their own community, and we're dedicated to making that possible through personalized, supportive care that respects each individual's journey.",
            "location": "321 Race Street, Philadelphia, PA 19106",
            "city": "Philadelphia, PA",
            "experience_years": 6,
            "certifications": ["Mental Health Certified", "State Licensed", "Behavioral Specialist", "Crisis Intervention Trained"],
            "specialties": ["Mental Health", "Behavioral Support", "Developmental Care", "Autism Support"],
            "price_per_hour": 17,
            "rating": 4.5,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1543333995-a78aea2eee50?w=600&h=450&fit=crop&q=80",
            "gallery_images": [
                "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
                "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=600"
            ],
            "is_verified": False,
            "is_new": True,
            "total_caregivers": 18,
            "years_in_business": 6,
            "families_served": 210,
            "reviews": generate_reviews(["Mental Health"])
        },
    ]
    
    for agency in agencies_data:
        agency["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.agencies.insert_many(agencies_data)
    return {"message": "Data seeded successfully", "count": len(agencies_data)}

@api_router.post("/seed")
async def seed_data(user: dict = Depends(require_admin)):
    return await seed_agencies()

@api_router.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}

# Include the router in the main app
app.include_router(api_router)

# Serve the built React app from the same service when it's present (production).
# FRONTEND_BUILD_DIR defaults to ../frontend/build next to this file.
FRONTEND_BUILD_DIR = Path(os.environ.get('FRONTEND_BUILD_DIR', ROOT_DIR.parent / 'frontend' / 'build')).resolve()
if (FRONTEND_BUILD_DIR / 'index.html').is_file():
    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="Not found")
        candidate = (FRONTEND_BUILD_DIR / full_path).resolve()
        if full_path and candidate.is_file() and candidate.is_relative_to(FRONTEND_BUILD_DIR):
            return FileResponse(candidate)
        # Client-side routes (/agencies, /dashboard, ...) all load the app shell
        return FileResponse(FRONTEND_BUILD_DIR / 'index.html')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample agencies that were seeded in earlier versions for Washington D.C., Pittsburgh and Newark.
# Voallen now only lists Philadelphia, so these are removed from existing databases on startup.
# Only these exact sample agencies (matched by name and city) are removed; agencies that signed up are kept.
RETIRED_SAMPLE_AGENCIES = {
    "Washington, D.C.": [
        "Capitol Care Services", "District Home Care", "Georgetown Care Specialists",
        "National Health Companions", "Potomac Pediatric Care", "DC Senior Living Support",
    ],
    "Pittsburgh, PA": [
        "Steel City Home Care", "Three Rivers Care Solutions", "UPMC Home Health Partners",
        "Allegheny Senior Care", "Squirrel Hill Home Helpers",
    ],
    "Newark, NJ": [
        "Garden State Home Care", "Newark Community Care", "Essex County Care Services",
        "Brick City Caregivers",
    ],
}

async def remove_retired_sample_agencies():
    removed = 0
    for city, names in RETIRED_SAMPLE_AGENCIES.items():
        # Seeded agencies have no owner account; agencies created by real users always do
        result = await db.agencies.delete_many({"city": city, "name": {"$in": names}, "user_id": {"$exists": False}})
        removed += result.deleted_count
    return removed

@app.on_event("startup")
async def seed_on_startup():
    removed = await remove_retired_sample_agencies()
    if removed:
        logger.info("Removed %d retired sample agencies", removed)
    if os.environ.get('SEED_SAMPLE_DATA', 'true').lower() != 'false':
        result = await seed_agencies()
        logger.info("Sample data: %s", result['message'])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
