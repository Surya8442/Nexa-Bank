# routers/investments.py - Investment broker logs
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid

router = APIRouter()

@router.get("", response_model=dict)
def get_investments(db: Session = Depends(get_db)):
    """Yield all subscribed mutual funds, bonds, gold, and NPS records."""
    return {
        "investments": [
            {
                "id": "inv-1",
                "type": "Mutual Fund",
                "name": "SBI Bluechip Direct-Growth Fund",
                "provider": "SBI Mutual Fund",
                "initial_amount": 250000.0,
                "current_value": 382450.0,
                "status": "Active"
            }
        ]
    }

@router.post("/buy", response_model=dict)
def buy_investment(payload: dict, db: Session = Depends(get_db)):
    """Executes purchase asset subscription agreements."""
    return {
        "success": True,
        "investment": {
            "id": f"inv-{str(uuid.uuid4())[:8]}",
            "type": payload.get("type", "Mutual Fund"),
            "name": payload.get("name"),
            "provider": payload.get("provider", "SBIMutual"),
            "initial_amount": payload.get("amount", 5000.0),
            "current_value": payload.get("amount", 5050.0),
            "status": "Active"
        },
        "balance": 182400.00,
        "message": f"Securities purchase of {payload.get('name')} successfully completed."
    }
