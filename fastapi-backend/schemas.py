# schemas.py - Pydantic Validation Models
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    phone: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    pin: str = Field(..., min_length=6, max_length=6)
    firstName: str
    lastName: str
    pan: str = Field(..., min_length=10, max_length=10)
    aadhaar: str
    dob: date
    address: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    tempToken: str
    otp: str

class UserOut(UserBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AccountResponse(BaseModel):
    id: str
    account_number: str
    account_type: str
    balance: float
    branch: str
    ifsc: str

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: str
    type: str
    description: str
    amount: float
    balance_after: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    sourceAccountId: str
    destAccountNumber: str
    destIfsc: str
    destName: str
    amount: float = Field(..., gt=0)
    mode: Optional[str] = "IMPS"
    remark: Optional[str] = ""

class UPIRequest(BaseModel):
    upiId: str
    amount: float = Field(..., gt=0)
    upiPin: str = Field(..., min_length=6, max_length=6)
    remark: Optional[str] = ""

class BillPayRequest(BaseModel):
    billerCategory: str
    billerName: str
    consumerNumber: str
    amount: float = Field(..., gt=0)
    accountId: str

class CardResponse(BaseModel):
    id: str
    card_number: str
    card_type: str
    card_provider: str
    status: str
    limit_amount: float
    current_usage: float
    expiry: str
    cvv: str

    class Config:
        from_attributes = True

class CardToggleBlock(BaseModel):
    block: bool

class CardResetPin(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4)

class LoanApplication(BaseModel):
    loanType: str
    amount: float = Field(..., gt=0)
    tenureMonths: int = Field(..., gt=0)

class LoanResponse(BaseModel):
    id: str
    loan_type: str
    principal: float
    rate: float
    tenure_months: int
    remaining_balance: float
    emi: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ServiceRequestCreate(BaseModel):
    title: str
    description: str

class ServiceRequestResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
