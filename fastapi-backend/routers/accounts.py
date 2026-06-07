# routers/accounts.py - Balance enquiry and statement reports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.get("/summary", response_model=dict)
def get_accounts_summary(db: Session = Depends(get_db)):
    """Fetches core accounting ledgers and client portfolios."""
    # Simulation returns seed demo accounts
    return {
        "customer": {
            "id": "c-demo-2222",
            "first_name": "Surya",
            "last_name": "Kandipalli",
            "pan": "ABCPK1234R",
            "kyc_status": "Approved"
        },
        "accounts": [
            {
                "id": "a-demo-3333",
                "account_number": "20448194059",
                "account_type": "Savings",
                "balance": 425750.50,
                "branch": "Hyderabad Corporate Branch",
                "ifsc": "NEXB0004921"
            },
            {
                "id": "a-demo-fd",
                "account_number": "50148292812",
                "account_type": "Fixed Deposit",
                "balance": 1500000.00,
                "branch": "Hyderabad Corporate Branch",
                "ifsc": "NEXB0004921"
            }
        ]
    }

@router.get("/statement/{account_id}", response_model=dict)
def get_statement(account_id: str, db: Session = Depends(get_db)):
    """Retrieves transactional historical lists of a given account."""
    return {
        "account_number": "20448194059",
        "account_type": "Savings",
        "balance": 425750.50,
        "transactions": [
            {
                "id": "tx-1",
                "type": "Deposit",
                "description": "Salary Credit - Google India",
                "amount": 250000.00,
                "balance_after": 425750.50,
                "status": "Completed",
                "created_at": "2026-06-05T12:00:00Z"
            }
        ]
    }
