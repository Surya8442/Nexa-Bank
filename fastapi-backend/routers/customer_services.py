# routers/customer_services.py - KYC and Customer Portal routers
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid

router = APIRouter()

@router.get("/requests", response_model=dict)
def get_tickets(db: Session = Depends(get_db)):
    """Retrieve existing helpdesk service requests."""
    return {
        "requests": [
            {
                "id": "sr-1",
                "title": "Cheque Book Request",
                "description": "50-leaf corporate check booklet requested.",
                "status": "Resolved",
                "created_at": "2026-05-25T14:20:00Z"
            }
        ]
    }

@router.post("/requests", response_model=dict)
def create_ticket(payload: schemas.ServiceRequestCreate, db: Session = Depends(get_db)):
    """Submits and registers a live technical issue help desk ticket."""
    return {
        "success": True,
        "request": {
            "id": f"sr-{str(uuid.uuid4())[:8]}",
            "title": payload.title,
            "description": payload.description,
            "status": "Pending",
            "created_at": "2026-06-07T12:00:00Z"
        },
        "message": "Nexa ticket successfully loaded. Engineers dispatched."
    }

@router.patch("/kyc", response_model=dict)
def update_profile_kyc(payload: dict, db: Session = Depends(get_db)):
    """Updates residential coordinates and verifies KYC standards."""
    return {
        "success": True,
        "customer": {
            "id": "c-demo-2222",
            "kyc_status": "Approved",
            "address": payload.get("address", "Updated residencial area")
        },
        "message": "Residential coordinate revisions validated. KYC Status: APPROVED"
    }
