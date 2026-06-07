# routers/cards.py - Credit and Debit cards controls
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.get("", response_model=dict)
def get_cards(db: Session = Depends(get_db)):
    """Retrieves all connected client credit and debit cards."""
    return {
        "cards": [
            {
                "id": "card-debit-1",
                "account_id": "a-demo-3333",
                "card_number": "4059 8812 7391 0244",
                "card_type": "Debit",
                "card_provider": "Visa Platinum",
                "status": "Active",
                "limit_amount": 100000.0,
                "current_usage": 4200.0,
                "expiry": "09/31",
                "cvv": "142",
                "card_holder": "Surya Kandipalli"
            }
        ]
    }

@router.patch("/{card_id}/toggle-block", response_model=dict)
def toggle_card_status(card_id: str, payload: schemas.CardToggleBlock, db: Session = Depends(get_db)):
    """Temporarily blocks or unblocks a specific physical card."""
    status_label = "Blocked" if payload.block else "Active"
    return {
        "success": True,
        "card": {
            "id": card_id,
            "status": status_label
        },
        "message": f"Nexa Card status changed to {status_label}."
    }

@router.post("/{card_id}/reset-pin", response_model=dict)
def reset_atm_pin(card_id: str, payload: schemas.CardResetPin, db: Session = Depends(get_db)):
    """Resets the direct swipe ATM security PIN."""
    return {
        "success": True,
        "message": "ATM Security PIN code recalibrated successfully."
    }
