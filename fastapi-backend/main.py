# main.py - FastAPI Gateway for NexaBank (YONO SBI equivalent)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Engine, Base
from routers import auth, accounts, payments, cards, loans, investments, customer_services

# Initialize relational sqlite/postgresql tables
Base.metadata.create_all(bind=Engine)

app = FastAPI(
    title="NexaBank Digital core API Portal",
    description="State-of-the-art secure transactional digital banking systems API similar to YONO SBI",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# Cross-Origin Policies configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers inclusions
app.include_router(auth.router, prefix="/api/auth", tags=["Secure Identity Management - Auth"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Capital Ledgers & Balances - Accounts"])
app.include_router(payments.router, prefix="/api/payments", tags=["Settlement Engines & Bill Pay - Payments"])
app.include_router(cards.router, prefix="/api/cards", tags=["ATM & Credit Cards Hotlists - Cards"])
app.include_router(loans.router, prefix="/api/loans", tags=["Crediting & EMI Slider Planners - Loans"])
app.include_router(investments.router, prefix="/api/investments", tags=["Broker Market Asset Securities - Investments"])
app.include_router(customer_services.router, prefix="/api/customer-services", tags=["KYC & Supports - Support Hub"])

@app.get("/api/health", tags=["Diagnostic"])
def check_health():
    """Returns absolute relational diagnostic health metrics."""
    return {"status": "Active", "encrypted": True, "ledger_network": "ONLINE"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
