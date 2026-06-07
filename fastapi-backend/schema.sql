-- NexaBank Relational PostgreSQL Database Schema Definitions
-- Matches YONO SBI banking specifications. Fully indexed and structured.

-- 1. Create Core Users Authentication Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL, -- MPIN for fast device bypass
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, pending_otp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Create Customers Profile Metadata Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pan VARCHAR(10) UNIQUE NOT NULL,
    aadhaar VARCHAR(14) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'Approved', -- Approved, Pending, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Accounts Ledger Book Table
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    account_number VARCHAR(30) UNIQUE NOT NULL,
    account_type VARCHAR(30) NOT NULL, -- Savings, Current, Fixed Deposit
    balance DOUBLE PRECISION DEFAULT 0.0,
    branch VARCHAR(150) NOT NULL,
    ifsc VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_number ON accounts(account_number);

-- 4. Create Ledger Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- Deposit, Withdrawal, Transfer, UPI, Bill, Loan EMI
    description VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    balance_after DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'Completed', -- Completed, Pending, Failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_account ON transactions(account_id);

-- 5. Create Beneficiaries Registries Table
CREATE TABLE IF NOT EXISTS beneficiaries (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    beneficiary_name VARCHAR(150) NOT NULL,
    beneficiary_account VARCHAR(50) NOT NULL,
    ifsc VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Approved', -- Approved, Pending
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Cards Hotlist Table
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    card_number VARCHAR(30) UNIQUE NOT NULL,
    card_type VARCHAR(20) NOT NULL, -- Debit, Credit
    card_provider VARCHAR(55) NOT NULL, -- Visa Platinum, Mastercard, RuPay
    status VARCHAR(20) DEFAULT 'Active', -- Active, Blocked, Suspended
    limit_amount DOUBLE PRECISION NOT NULL,
    current_usage DOUBLE PRECISION DEFAULT 0.0,
    expiry VARCHAR(10) NOT NULL,
    cvv VARCHAR(5) NOT NULL,
    pin VARCHAR(4) NOT NULL, -- ATM Numeric security code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Lending Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_type VARCHAR(50) NOT NULL, -- Home, Personal, Auto
    principal DOUBLE PRECISION NOT NULL,
    rate DOUBLE PRECISION NOT NULL, -- Annual percentage interest rate
    tenure_months INTEGER NOT NULL,
    remaining_balance DOUBLE PRECISION NOT NULL,
    emi DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Closed, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create EMI Loan Payments Table
CREATE TABLE IF NOT EXISTS loan_payments (
    id VARCHAR(50) PRIMARY KEY,
    loan_id VARCHAR(50) NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount_paid DOUBLE PRECISION NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Mutual Funds Investments Securities Table
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- Mutual Fund, NPS, Digital Gold, Fixed Deposit
    name VARCHAR(150) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    initial_amount DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Redeemed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create Unified Payments UPI Links Table
CREATE TABLE IF NOT EXISTS upi_accounts (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    upi_id VARCHAR(100) UNIQUE NOT NULL,
    pin VARCHAR(6) NOT NULL, -- 6-Digit Security PIN
    status VARCHAR(25) DEFAULT 'Active', -- Active, Disabled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create Multi-Channel Push Notifications alerts Logs
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Create Helpdesk Support Service Tickets Request Table
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending', -- Pending, In_Progress, Resolved, Closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Create Secure Audit Logs Trails Table for banking regulatory audits
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
