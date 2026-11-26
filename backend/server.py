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
    profile_type: str = "individual"  # Voallen lists individual non-medical caregivers
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

    summary = (f"Caregiver: {agency['name']}\nService: {booking_data.service_type}\n"
               f"Date: {booking_data.date} at {booking_data.time_slot}\nPatient: {booking_data.patient_name}")
    queue_email(background, user.get('email'), "Your Voallen consultation request was sent",
                f"Hi {user.get('name', '')},\n\nWe sent your consultation request. "
                f"The caregiver will confirm or decline it soon.\n\n{summary}\n\nThe Voallen team")
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

    agency_name = agency['name'] if agency else "your caregiver"
    when = f"{booking['date']} at {booking['time_slot']}"
    if is_owner_agency:
        client = await db.users.find_one({"id": booking['user_id']}, {"_id": 0})
        messages = {
            "confirmed": f"Good news: {agency_name} confirmed your consultation on {when}.",
            "declined": f"{agency_name} can't take your consultation on {when}. You can book another caregiver on Voallen.",
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
    agency_name = agency['name'] if agency else "your caregiver"
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
# Sample caregiver profiles for Philadelphia. Voallen lists individual, non-medical caregivers
# (companions), not home health companies. These are fictional people with illustrated initial
# avatars; real caregivers replace them by signing up and being approved.
SAMPLE_CAREGIVERS = [
    {
        "name": "Maria G.",
        "neighborhood": "Fishtown",
        "bio": "Warm, chatty companion who loves cooking and a good story.",
        "description": "I've spent eight years keeping older neighbors company, first with my own grandmother and then with families across Philadelphia. I'm happy to cook a favorite meal together, pick up groceries, or just sit and talk over coffee. I take my time, I listen, and I always leave a little note so the family knows how the visit went.",
        "experience_years": 8,
        "certifications": ["Background checked", "CPR & First Aid", "Speaks Spanish"],
        "specialties": ["Companionship", "Meal Prep", "Errands & Shopping"],
        "price_per_hour": 18, "rating": 4.9, "review_count": 42, "families_served": 31,
        "avatar": "maria-g",
    },
    {
        "name": "Denise W.",
        "neighborhood": "West Philadelphia",
        "bio": "Patient, calm companion with years of memory care experience.",
        "description": "For twelve years I've kept company with people living with memory loss. I know how much a familiar routine, a favorite song or an old photo album can mean. I keep visits calm and gentle, and I'm always happy to talk with families about what's working.",
        "experience_years": 12,
        "certifications": ["Background checked", "CPR & First Aid", "Dementia care training"],
        "specialties": ["Memory Care Companionship", "Companionship", "Hobbies & Outings"],
        "price_per_hour": 20, "rating": 4.9, "review_count": 37, "families_served": 26,
        "avatar": "denise-w",
    },
    {
        "name": "James O.",
        "neighborhood": "South Philadelphia",
        "bio": "Reliable driver and friendly company for errands and appointments.",
        "description": "I help seniors get where they need to go: doctor's appointments, the bank, the barber, or a lunch out. I wait with them, help carry the bags, and make sure everyone gets home safe. Five years in, I still look forward to every ride and every conversation.",
        "experience_years": 5,
        "certifications": ["Background checked", "CPR & First Aid", "Valid driver's license"],
        "specialties": ["Transportation & Appointments", "Errands & Shopping", "Companionship"],
        "price_per_hour": 17, "rating": 4.8, "review_count": 28, "families_served": 19,
        "avatar": "james-o",
    },
    {
        "name": "Grace L.",
        "neighborhood": "Chinatown",
        "bio": "Gentle companion who helps around the house and keeps things tidy.",
        "description": "I enjoy making a home feel calm and comfortable. On visits I'll tidy up, do a load of laundry, prepare a simple meal and sit down for tea and conversation. I speak Cantonese and Mandarin, and many of my families like to chat in their first language.",
        "experience_years": 6,
        "certifications": ["Background checked", "CPR & First Aid", "Speaks Cantonese and Mandarin"],
        "specialties": ["Companionship", "Light Housekeeping", "Meal Prep"],
        "price_per_hour": 18, "rating": 4.8, "review_count": 31, "families_served": 22,
        "avatar": "grace-l",
    },
    {
        "name": "Angela R.",
        "neighborhood": "Northern Liberties",
        "bio": "Overnight and respite companion so family caregivers can rest.",
        "description": "Family caregivers need a break too. I offer evening and overnight companionship so you can sleep, travel or simply take a day off, knowing someone kind is there. I keep a steady, quiet presence and send a morning update.",
        "experience_years": 9,
        "certifications": ["Background checked", "CPR & First Aid"],
        "specialties": ["Overnight Companionship", "Respite for Families", "Companionship"],
        "price_per_hour": 19, "rating": 4.7, "review_count": 22, "families_served": 17,
        "avatar": "angela-r",
    },
    {
        "name": "Tomás H.",
        "neighborhood": "Germantown",
        "bio": "Upbeat companion for walks, games, music and tech help.",
        "description": "I'm a music lover and a patient teacher. I'll go for a walk in the park, play cards or chess, put on old records, or help set up video calls with the grandkids. I speak Spanish and English and I'm always up for a good laugh.",
        "experience_years": 3,
        "certifications": ["Background checked", "CPR & First Aid", "Speaks Spanish"],
        "specialties": ["Hobbies & Outings", "Video Calls & Tech Help", "Companionship"],
        "price_per_hour": 16, "rating": 4.8, "review_count": 19, "families_served": 14,
        "avatar": "tomas-h",
    },
    {
        "name": "Patricia M.",
        "neighborhood": "Roxborough",
        "bio": "Experienced, dependable companion for everyday help at home.",
        "description": "After fifteen years of helping families, I know the little things matter: fresh sheets, a stocked fridge, the mail sorted and a friendly face at the door. I'm organized, punctual and always happy to sit down for a chat once the chores are done.",
        "experience_years": 15,
        "certifications": ["Background checked", "CPR & First Aid"],
        "specialties": ["Light Housekeeping", "Meal Prep", "Errands & Shopping"],
        "price_per_hour": 17, "rating": 4.6, "review_count": 26, "families_served": 34,
        "avatar": "patricia-m",
    },
]

SAMPLE_REVIEW_TEMPLATES = [
    {"user_name": "Sarah M.", "rating": 5, "comment": "{first} has been wonderful with my mother. She looks forward to every visit and always has a story to tell us afterwards.", "relationship": "Daughter"},
    {"user_name": "Michael T.", "rating": 5, "comment": "Punctual, kind and easy to talk to. The notes after each visit give us real peace of mind.", "relationship": "Son"},
    {"user_name": "Jennifer K.", "rating": 4, "comment": "Great communication and flexible with scheduling. {first} feels like part of the family now.", "relationship": "Daughter"},
    {"user_name": "Robert & Linda P.", "rating": 5, "comment": "We met a few companions before choosing {first}. Best decision we made. Mom is so much brighter.", "relationship": "Family"},
    {"user_name": "David W.", "rating": 5, "comment": "Thanks to {first}, I can finally get some rest knowing my wife has good company.", "relationship": "Spouse"},
    {"user_name": "Patricia H.", "rating": 4, "comment": "Very thoughtful. When Dad's routine changed, {first} adjusted without any fuss.", "relationship": "Daughter"},
    {"user_name": "James L.", "rating": 5, "comment": "Patient and gentle. {first} really understands how to make Grandpa comfortable.", "relationship": "Grandson"},
    {"user_name": "Elizabeth R.", "rating": 5, "comment": "Caring, reliable and fun. Everything you'd hope for in a companion.", "relationship": "Granddaughter"},
]

def sample_caregiver_doc(c: dict) -> dict:
    import random
    first = c["name"].split()[0]
    reviews = []
    for t in random.sample(SAMPLE_REVIEW_TEMPLATES, random.randint(4, 6)):
        reviews.append({**t, "comment": t["comment"].format(first=first), "id": str(uuid.uuid4()),
                        "care_type": c["specialties"][0],
                        "date": f"202{random.randint(5, 6)}-{random.randint(1, 10):02d}-{random.randint(1, 28):02d}"})
    return {
        "id": str(uuid.uuid4()),
        "name": c["name"],
        "bio": c["bio"],
        "description": c["description"],
        "location": f'{c["neighborhood"]}, Philadelphia, PA',
        "city": "Philadelphia, PA",
        "experience_years": c["experience_years"],
        "certifications": c["certifications"],
        "specialties": c["specialties"],
        "price_per_hour": c["price_per_hour"],
        "rating": c["rating"],
        "review_count": c["review_count"],
        "image_url": f'/voallen/caregivers/{c["avatar"]}.svg',
        "gallery_images": [],
        "is_verified": True,
        "is_new": False,
        "profile_type": "individual",
        "total_caregivers": 1,
        "years_in_business": c["experience_years"],
        "families_served": c["families_served"],
        "reviews": reviews,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

async def seed_agencies():
    # Add any sample caregiver that isn't there yet (matched by name, never one a real user owns)
    added = 0
    for c in SAMPLE_CAREGIVERS:
        if await db.agencies.find_one({"name": c["name"], "city": "Philadelphia, PA", "user_id": {"$exists": False}}):
            continue
        await db.agencies.insert_one(sample_caregiver_doc(c))
        added += 1
    if not added:
        return {"message": "Data already seeded", "count": await db.agencies.count_documents({})}
    return {"message": "Data seeded successfully", "count": added}

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
    # The old Philadelphia sample companies, replaced by individual caregiver profiles
    "Philadelphia, PA": [
        "Caring Hearts Home Care", "Gentle Touch Nursing", "Philadelphia Senior Services",
        "HomeWell Care Services", "Nurturing Angels Care", "Liberty Home Health", "Keystone Care Partners",
    ],
}

async def remove_retired_sample_agencies():
    removed = 0
    for city, names in RETIRED_SAMPLE_AGENCIES.items():
        # Seeded agencies have no owner account; agencies created by real users always do
        query = {"city": city, "name": {"$in": names}, "user_id": {"$exists": False}}
        async for agency in db.agencies.find(query, {"_id": 0, "id": 1}):
            if await db.bookings.find_one({"agency_id": agency["id"]}):
                # Keep the record so past bookings still resolve, but take it off the site
                await db.agencies.update_one({"id": agency["id"]}, {"$set": {"status": "unavailable"}})
            else:
                await db.agencies.delete_one({"id": agency["id"]})
                removed += 1
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
