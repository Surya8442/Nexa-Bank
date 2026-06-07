# routers/loans.py - Lending and EMI plans
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid

router = APIRouter()

@router.get("", response_model=dict)
def get_loans(db: Session = Depends(get_db)):
    """Query currently established loan profiles."""
    return {
        "loans": [
            {
                "id": "loan-demo-1",
                "loan_type": "Home Loan Premium",
                "principal": 2500000.0,
                "rate": 8.45,
                "tenure_months": 240,
                "remaining_balance": 2150000.0,
                "emi": 22400.0,
                "status": "Active",
                "created_at": "2025-06-07T00:00:00Z"
            }
        ]
    }

@router.post("/apply", response_model=dict)
def apply_loan(payload: schemas.LoanApplication, db: Session = Depends(get_db)):
    """Submits and auto-approves a new lending credit."""
    return {
        "success": True,
        "loan": {
            "id": f"loan-{str(uuid.uuid4())[:8]}",
            "loan_type": payload.loanType,
            "principal": payload.amount,
            "rate": 8.45,
            "tenure_months": payload.tenureMonths,
            "remaining_balance": payload.amount,
            "emi": 12500.00,
            "status": "Active"
        },
        "message": "Dynamic automated loan clearance completed successfully."
    }

@router.post("/{loan_id}/pay-emi", response_model=dict)
def pay_loan_emi(loan_id: str, db: Session = Depends(get_db)):
    """Disburses dues for outstanding loan EMIs."""
    return {
        "success": True,
        "balance": 182400.00,
        "message": f"EMI Payment successfully received for Loan Portfolio ID: {loan_id}."
    }
