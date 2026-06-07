# models.py - SQLAlchemy Relational Mappings
import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, Date, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    pin = Column(String, nullable=False) # MPIN
    status = Column(String, default="active") # active, suspended, pending_otp
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    pan = Column(String, unique=True, nullable=False)
    aadhaar = Column(String, unique=True, nullable=False)
    dob = Column(Date, nullable=False)
    address = Column(String, nullable=False)
    kyc_status = Column(String, default="Approved") # Approved, Pending, Rejected

    user = relationship("User", back_populates="customer")
    accounts = relationship("Account", back_populates="customer")
    beneficiaries = relationship("Beneficiary", back_populates="customer")
    loans = relationship("Loan", back_populates="customer")
    investments = relationship("Investment", back_populates="customer")
    service_requests = relationship("ServiceRequest", back_pop_pop_back_ref=None, back_populates="customer" if hasattr(Base, "service_requests") else None)


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    account_number = Column(String, unique=True, index=True, nullable=False)
    account_type = Column(String, nullable=False) # Savings, Current, Fixed Deposit
    balance = Column(Float, default=0.0)
    branch = Column(String, nullable=False)
    ifsc = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")
    cards = relationship("Card", back_populates="account")
    upi_accounts = relationship("UPIAccount", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    type = Column(String, nullable=False) # Deposit, Withdrawal, Transfer, UPI, Bill, Loan EMI
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    status = Column(String, default="Completed") # Completed, Pending, Failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    beneficiary_name = Column(String, nullable=False)
    beneficiary_account = Column(String, nullable=False)
    ifsc = Column(String, nullable=False)
    status = Column(String, default="Approved") # Approved, Pending

    customer = relationship("Customer", back_populates="beneficiaries")


class Card(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    card_number = Column(String, unique=True, index=True, nullable=False)
    card_type = Column(String, nullable=False) # Debit, Credit
    card_provider = Column(String, nullable=False) # Visa Platinum, Mastercard, RuPay
    status = Column(String, default="Active") # Active, Blocked, Suspended
    limit_amount = Column(Float, nullable=False)
    current_usage = Column(Float, default=0.0)
    expiry = Column(String, nullable=False)
    cvv = Column(String, nullable=False)
    pin = Column(String, nullable=False) # 4-digit ATM PIN

    account = relationship("Account", back_populates="cards")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    loan_type = Column(String, nullable=False) # Home, Personal, Auto
    principal = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    remaining_balance = Column(Float, nullable=False)
    emi = Column(Float, nullable=False)
    status = Column(String, default="Active") # Active, Pending, Closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="loans")
    payments = relationship("LoanPayment", back_populates="loan")


class LoanPayment(Base):
    __tablename__ = "loan_payments"

    id = Column(String, primary_key=True, index=True)
    loan_id = Column(String, ForeignKey("loans.id"), nullable=False)
    amount_paid = Column(Float, nullable=False)
    paid_at = Column(DateTime, default=datetime.datetime.utcnow)

    loan = relationship("Loan", back_populates="payments")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    type = Column(String, nullable=False) # Mutual Fund, NPS, Digital Gold, Fixed Deposit
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    initial_amount = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    status = Column(String, default="Active") # Active, Redeemed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="investments")


class UPIAccount(Base):
    __tablename__ = "upi_accounts"

    id = Column(String, primary_key=True, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    upi_id = Column(String, unique=True, index=True, nullable=False)
    pin = Column(String, nullable=False) # 6-digit UPI security pin
    status = Column(String, default="Active") # Active, Disabled

    account = relationship("Account", back_populates="upi_accounts")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="Pending") # Pending, In_Progress, Resolved, Closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
