# routers/auth.py - Auth router for Python FastAPI
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid

router = APIRouter()

@router.post("/login", status_code=200)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    """User authenticate endpoint."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Authentication failed: invalid credentials.")
    
    # Pre-authenticated simulated secure OTP
    return {
        "otpRequired": True,
        "tempToken": f"temp-jwt-{uuid.uuid4()}",
        "phoneMasked": user.phone[:3] + "******" + user.phone[-2:],
        "message": "OTP Dispatched to registered cellular line."
    }

@router.post("/verify-otp", status_code=200)
def verify_otp(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    """OTP Secure entry verifies session and releases active access token."""
    if payload.otp != "123456":
        raise HTTPException(status_code=401, detail="Verification failed: incorrect or stale OTP.")
    
    # Issue mock JWT token
    return {
        "token": "bearer-secure-mock-jwt-token-2026",
        "user": {
            "id": "u-demo-1111",
            "email": "demo@nexabank.com",
            "phone": "+91 98765 43210",
            "first_name": "Surya",
            "last_name": "Kandipalli",
            "kyc_status": "Approved"
        },
        "message": "Authentication complete."
    }

@router.post("/register", status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """Enrolls new digital customer profile and promotional cash benefits."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account is already linked to this email address.")
    
    user_id = f"u-{str(uuid.uuid4())[:8]}"
    new_user = models.User(
        id=user_id,
        email=payload.email,
        phone=payload.phone,
        password_hash="pbkdf2_sha256_mock_hash",
        pin=payload.pin,
        status="active"
    )
    
    customer_id = f"c-{str(uuid.uuid4())[:8]}"
    new_cust = models.Customer(
        id=customer_id,
        user_id=user_id,
        first_name=payload.firstName,
        last_name=payload.lastName,
        pan=payload.pan.upper(),
        aadhaar=payload.aadhaar,
        dob=payload.dob,
        address=payload.address,
        kyc_status="Approved"
    )

    db.add(new_user)
    db.add(new_cust)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "token": "bearer-secure-mock-jwt-token-2026",
        "user": {
            "id": user_id,
            "email": payload.email,
            "phone": payload.phone,
            "first_name": payload.firstName,
            "last_name": payload.lastName,
            "kyc_status": "Approved"
        },
        "message": "Profile configured successfully."
    }
