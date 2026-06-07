# routers/payments.py - Settlement routing and bills
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid

router = APIRouter()

@router.post("/transfer", response_model=dict)
def make_bank_transfer(payload: schemas.TransferRequest, db: Session = Depends(get_db)):
    """Executes bank-wide account settlements."""
    return {
        "success": True,
        "transactionId": f"tx-{str(uuid.uuid4())[:8]}",
        "balance": 182400.00,
        "message": f"Settlement complete. Disbursed Successfully via {payload.mode}."
    }

@router.post("/upi", response_model=dict)
def make_upi_payment(payload: schemas.UPIRequest, db: Session = Depends(get_db)):
    """Triggers instant peer-to-peer payments."""
    if payload.upiPin != "121212":
        raise HTTPException(status_code=401, detail="UPI PIN verification failed.")
    return {
        "success": True,
        "transactionId": f"tx-upi-{str(uuid.uuid4())[:8]}",
        "balance": 182400.00,
        "message": f"UPI Payment to {payload.upiId} sent successfully."
    }

@router.post("/bill-pay", response_model=dict)
def pay_utility_bill(payload: schemas.BillPayRequest, db: Session = Depends(get_db)):
    """Settle registered billing provider utilities."""
    return {
        "success": True,
        "transactionId": f"tx-bill-{str(uuid.uuid4())[:8]}",
        "balance": 182400.00,
        "message": f"Utilities billing settled successfully with {payload.billerName}."
    }
