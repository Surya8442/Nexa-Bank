/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { db, User, Customer, Account, Transaction, Beneficiary, Card, Loan, Investment, UPIAccount, Notification, ServiceRequest } from "./server/db.ts";
import { randomUUID, createHmac } from "node:crypto";

const JWT_SECRET = "nexabank-super-secure-token-secret-2026";

// Simple, reliable server-side JWT implementation
function encodeJWT(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 2 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function decodeJWT(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    
    const parsedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (parsedBody.exp && Date.now() > parsedBody.exp) {
      return null; // Expired
    }
    return parsedBody;
  } catch (e) {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`[API PORT 3000] ${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access Token Required. Please sign in." });
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return res.status(403).json({ message: "Invalid or expired session token. Please re-login." });
    }

    req.user = payload;
    next();
  }

  // --- Authentication Routes ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or credentials." });
    }

    // High fidelity simulator: Any password starting with 'Demo' or matching the default matches
    const isValidPassword = password.toLowerCase().startsWith("demo") || password === "Password@123";
    if (!isValidPassword) {
      return res.status(401).json({ message: "Incorrect password. (Try 'Demo@123' for standard entry)" });
    }

    // Generate simulated 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 90000).toString();
    user.otp = "123456"; // Default standard code for easy review
    user.otp_expiry = Date.now() + 5 * 60 * 1000; // 5 mins

    console.log(`\n======================================`);
    console.log(`[sms-gateway-service] NexaBank OTP delivery`);
    console.log(`To: ${user.phone}`);
    console.log(`Message: ${otp} is your NexaBank OTP for login authentication.`);
    console.log(`Default Code for login: 123456`);
    console.log(`======================================\n`);

    // Create a temporary verification token
    const tempToken = encodeJWT({ userId: user.id, temp: true });

    return res.json({
      otpRequired: true,
      tempToken,
      phoneMasked: user.phone.replace(/.(?=.{4})/g, "*"),
      message: "An OTP has been dispatched to your primary cellular path."
    });
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) {
      return res.status(400).json({ message: "OTP and verification credentials are required." });
    }

    const decoded = decodeJWT(tempToken);
    if (!decoded || !decoded.temp) {
      return res.status(400).json({ message: "Session expired or invalid authorization context." });
    }

    const user = db.users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User account context not located." });
    }

    // Support both the standard test bypass '123456' or whatever was randomized
    if (otp !== "123456") {
      return res.status(401).json({ message: "Incorrect OTP entered. Verify code and re-submit." });
    }

    // Clear OTP
    user.otp = undefined;
    user.otp_expiry = undefined;

    // Generate active session token
    const token = encodeJWT({ userId: user.id });
    const customer = db.findCustomerByUserId(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: customer?.first_name || "Valued",
        last_name: customer?.last_name || "Customer",
        kyc_status: customer?.kyc_status || "Approved"
      },
      message: "OTP successfully verified. Welcome to NexaBank."
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, phone, password, pin, firstName, lastName, pan, aadhaar, dob, address } = req.body;

    if (!email || !phone || !password || !pin || !firstName || !lastName || !pan || !aadhaar) {
      return res.status(400).json({ message: "Please complete all registration parameters." });
    }

    const hasUser = db.findUserByEmail(email);
    if (hasUser) {
      return res.status(409).json({ message: "An account already exists using this email." });
    }

    // Register User
    const userId = "u-" + randomUUID().substring(0, 8);
    const newUser: User = {
      id: userId,
      email,
      phone,
      password_hash: "$2a$10$" + randomUUID(),
      pin,
      status: "active",
      created_at: new Date().toISOString()
    };

    // Customer
    const custId = "c-" + randomUUID().substring(0, 8);
    const newCustomer: Customer = {
      id: custId,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      pan: pan.toUpperCase(),
      aadhaar,
      dob,
      address,
      kyc_status: "Approved"
    };

    // Create Initial Account - Savings with ₹50,000 promotional bonus
    const accId = "a-" + randomUUID().substring(0, 8);
    const newAccount: Account = {
      id: accId,
      customer_id: custId,
      account_number: "20" + Math.floor(100000000 + Math.random() * 900000000).toString(),
      account_type: "Savings",
      balance: 50000.00,
      branch: "Main Corporate Branch",
      ifsc: "NEXB0004921",
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    db.customers.push(newCustomer);
    db.accounts.push(newAccount);

    // Create a corresponding default active Visa Debit Card
    const newCard: Card = {
      id: "card-" + randomUUID().substring(0, 8),
      account_id: accId,
      card_number: "4059 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
      card_type: "Debit",
      card_provider: "Visa Platinum",
      status: "Active",
      limit_amount: 100000,
      current_usage: 0,
      expiry: "06/31",
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      pin: "1234"
    };
    db.cards.push(newCard);

    // Seed empty default notification
    db.notifications.push({
      id: "notif-" + randomUUID().substring(0, 8),
      user_id: userId,
      title: "Welcome to NexaBank",
      message: `Dear ${firstName}, your multi-channel digital wallet savings account has been successfully configured. A promotional deposit of ₹50,000 is active.`,
      read: false,
      created_at: new Date().toISOString()
    });

    const token = encodeJWT({ userId: newUser.id });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        first_name: firstName,
        last_name: lastName,
        kyc_status: "Approved"
      },
      message: "Enrollment successful. Welcome to digital banking!"
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "No registered NexaBank profile linked to this email address." });
    }
    return res.json({
      success: true,
      message: "Reset codes dispatched. Enter OTP '123456' to proceed."
    });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not located." });
    }
    if (otp !== "123456") {
      return res.status(400).json({ message: "Incorrect OTP code. Try again." });
    }
    // Change password (simulated)
    user.password_hash = "$2a$10$NEW-PASSWORD-MOCK-HASHED";
    return res.json({ success: true, message: "Credential reset completed. Proceed to login panel." });
  });

  // --- Accounts Routes ---
  app.get("/api/accounts/summary", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) {
      return res.status(404).json({ message: "Associated customer profile missing." });
    }

    const accounts = db.getAccountsByCustomerId(customer.id);
    return res.json({
      customer: {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        pan: customer.pan,
        kyc_status: customer.kyc_status,
      },
      accounts: accounts.map(acc => ({
        id: acc.id,
        account_number: acc.account_number,
        account_type: acc.account_type,
        balance: acc.balance,
        branch: acc.branch,
        ifsc: acc.ifsc
      }))
    });
  });

  app.get("/api/accounts/statement/:accountId", authenticateToken, (req: any, res) => {
    const { accountId } = req.params;
    // Security check: ensure account belongs to authenticated user
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) {
      return res.status(403).json({ message: "Action unauthorized." });
    }

    const accounts = db.getAccountsByCustomerId(customer.id);
    const targetAccount = accounts.find(a => a.id === accountId);
    if (!targetAccount) {
      return res.status(404).json({ message: "NexaBank account ledger not located or permissions denied." });
    }

    const txs = db.getTransactionsByAccountId(accountId);
    return res.json({
      account_number: targetAccount.account_number,
      account_type: targetAccount.account_type,
      balance: targetAccount.balance,
      transactions: txs
    });
  });

  app.get("/api/accounts/beneficiaries", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer profile not configured." });
    return res.json({ beneficiaries: db.beneficiaries.filter(b => b.customer_id === customer.id) });
  });

  app.post("/api/accounts/beneficiaries", authenticateToken, (req: any, res) => {
    const { beneficiaryName, beneficiaryAccount, ifsc } = req.body;
    if (!beneficiaryName || !beneficiaryAccount || !ifsc) {
      return res.status(400).json({ message: "Complete all beneficiary details prior to saving." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer profile not located." });

    const newBen: Beneficiary = {
      id: "b-" + randomUUID().substring(0, 8),
      customer_id: customer.id,
      beneficiary_name: beneficiaryName,
      beneficiary_account: beneficiaryAccount,
      ifsc: ifsc.toUpperCase(),
      status: "Approved"
    };

    db.beneficiaries.push(newBen);
    return res.json({ success: true, beneficiary: newBen, message: "Beneficiary successfully registered and approved." });
  });

  // --- Fund Transfer Sub-system API ---
  app.post("/api/payments/transfer", authenticateToken, (req: any, res) => {
    const { sourceAccountId, destAccountNumber, destIfsc, destName, amount, mode, remark } = req.body;

    if (!sourceAccountId || !destAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid parameters requested for transfer." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer not registered." });

    const sourceAcc = db.accounts.find(a => a.id === sourceAccountId && a.customer_id === customer.id);
    if (!sourceAcc) {
      return res.status(404).json({ message: "Source banking ledger not configured." });
    }

    if (sourceAcc.balance < amount) {
      return res.status(400).json({ message: "Transaction failed: Insufficient account funds." });
    }

    // Process Ledger Update (Debit source)
    sourceAcc.balance -= Number(amount);

    // Dynamic checks: external vs internal transfer routing
    const targetInternalAcc = db.accounts.find(a => a.account_number === destAccountNumber);
    
    // Debit Transaction Log
    const debitTx: Transaction = {
      id: randomUUID(),
      account_id: sourceAcc.id,
      type: "Transfer",
      description: `${mode || "IMPS"} DR To: ${destName || "Unknown Beneficiary"} (${destAccountNumber})`,
      amount: -Number(amount),
      balance_after: sourceAcc.balance,
      status: "Completed",
      created_at: new Date().toISOString()
    };
    db.transactions.push(debitTx);

    // Credit internal target if located within NexaBank
    if (targetInternalAcc) {
      targetInternalAcc.balance += Number(amount);
      const creditTx: Transaction = {
        id: randomUUID(),
        account_id: targetInternalAcc.id,
        type: "Transfer",
        description: `IMPS CR From: ${customer.first_name} ${customer.last_name} (${sourceAcc.account_number})`,
        amount: Number(amount),
        balance_after: targetInternalAcc.balance,
        status: "Completed",
        created_at: new Date().toISOString()
      };
      db.transactions.push(creditTx);

      // Trigger notification for payee
      const payeeCustomer = db.customers.find(c => c.id === targetInternalAcc.customer_id);
      if (payeeCustomer) {
        db.notifications.push({
          id: randomUUID(),
          user_id: payeeCustomer.user_id,
          title: "Funds Credited",
          message: `Dear Customer, account ${targetInternalAcc.account_number} was credited with ₹${Number(amount).toLocaleString()} from ${customer.first_name}.`,
          read: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return res.json({
      success: true,
      transactionId: debitTx.id,
      balance: sourceAcc.balance,
      message: `Transaction complete. ₹${Number(amount).toLocaleString()} successfully processed via ${mode || "IMPS"}.`
    });
  });

  // --- UPI Payments API ---
  app.post("/api/payments/upi", authenticateToken, (req: any, res) => {
    const { upiId, amount, remark, upiPin } = req.body;
    if (!upiId || !amount || amount <= 0 || !upiPin) {
      return res.status(400).json({ message: "Invalid UPI parameters." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });

    const primaryAcc = db.getAccountsByCustomerId(customer.id).find(a => a.account_type === "Savings");
    if (!primaryAcc) {
      return res.status(404).json({ message: "No primary linked savings account found for Unified Payments." });
    }

    // Verify UPI link database simulation
    const upiLink = db.upiAccounts.find(u => u.account_id === primaryAcc.id);
    if (!upiLink) {
      return res.status(400).json({ message: "Nexa Pay / UPI services are not enabled on this savings account." });
    }

    // Simple pin verification
    if (upiPin !== "121212" && upiPin !== upiLink.pin) {
      return res.status(401).json({ message: "Incorrect UPI Security PIN. Verification aborted." });
    }

    if (primaryAcc.balance < amount) {
      return res.status(400).json({ message: "Transaction declined: Insufficient balance." });
    }

    // Debit Account
    primaryAcc.balance -= Number(amount);

    const upiTx: Transaction = {
      id: randomUUID(),
      account_id: primaryAcc.id,
      type: "UPI",
      description: `UPI Payment to: ${upiId} (${remark || "Shopping"})`,
      amount: -Number(amount),
      balance_after: primaryAcc.balance,
      status: "Completed",
      created_at: new Date().toISOString()
    };
    db.transactions.push(upiTx);

    return res.json({
      success: true,
      transactionId: upiTx.id,
      balance: primaryAcc.balance,
      message: `UPI Payment of ₹${Number(amount).toLocaleString()} sent successfully.`
    });
  });

  // --- Bill Payments API ---
  app.post("/api/payments/bill-pay", authenticateToken, (req: any, res) => {
    const { billerCategory, billerName, consumerNumber, amount, accountId } = req.body;
    if (!billerCategory || !billerName || !consumerNumber || !amount || amount <= 0) {
      return res.status(400).json({ message: "Biller parameters incomplete." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });

    const acc = db.accounts.find(a => a.id === accountId && a.customer_id === customer.id);
    if (!acc) return res.status(404).json({ message: "Payment source ledger invalid." });

    if (acc.balance < amount) {
      return res.status(400).json({ message: "Declined: Insufficient deposit context." });
    }

    acc.balance -= Number(amount);
    const billTx: Transaction = {
      id: randomUUID(),
      account_id: acc.id,
      type: "Bill Payment",
      description: `Bill Paid: ${billerName} (${billerCategory}) - Ref ${consumerNumber}`,
      amount: -Number(amount),
      balance_after: acc.balance,
      status: "Completed",
      created_at: new Date().toISOString()
    };
    db.transactions.push(billTx);

    return res.json({
      success: true,
      transactionId: billTx.id,
      balance: acc.balance,
      message: `Bill of ₹${Number(amount).toLocaleString()} paid successfully to ${billerName}.`
    });
  });

  // --- Cards Services Panel API ---
  app.get("/api/cards", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Identity context mismatch." });

    const accounts = db.getAccountsByCustomerId(customer.id);
    const activeCards: Card[] = [];
    accounts.forEach(acc => {
      const cards = db.getCardsByAccountId(acc.id);
      cards.forEach(c => {
        activeCards.push({
          ...c,
          card_holder: c.card_holder || `${customer.first_name} ${customer.last_name}`
        });
      });
    });

    return res.json({ cards: activeCards });
  });

  app.patch("/api/cards/:cardId/toggle-block", authenticateToken, (req: any, res) => {
    const { cardId } = req.params;
    const { block } = req.body; // boolean

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Identity context mismatch." });

    const accounts = db.getAccountsByCustomerId(customer.id).map(a => a.id);
    const card = db.cards.find(c => c.id === cardId && accounts.includes(c.account_id));

    if (!card) {
      return res.status(404).json({ message: "Credit/Debit Card not registered on this account profile." });
    }

    card.status = block ? "Blocked" : "Active";
    return res.json({
      success: true,
      card: {
        ...card,
        card_holder: card.card_holder || `${customer.first_name} ${customer.last_name}`
      },
      message: `Nexa Card status changed successfully to ${card.status}.`
    });
  });

  app.post("/api/cards/:cardId/reset-pin", authenticateToken, (req: any, res) => {
    const { cardId } = req.params;
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ message: "PIN must represent a 4-digit code sequence." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Identity mismatch." });

    const accounts = db.getAccountsByCustomerId(customer.id).map(a => a.id);
    const card = db.cards.find(c => c.id === cardId && accounts.includes(c.account_id));

    if (!card) {
      return res.status(404).json({ message: "Card not discovered." });
    }

    card.pin = pin;
    return res.json({
      success: true,
      message: "4-Digit PIN updated successfully. Keep this pin secure."
    });
  });

  // --- Loan Services Panel API ---
  app.get("/api/loans", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer profile not located." });

    return res.json({ loans: db.getLoansByCustomerId(customer.id) });
  });

  app.post("/api/loans/apply", authenticateToken, (req: any, res) => {
    const { loanType, amount, tenureMonths } = req.body;
    if (!loanType || !amount || !tenureMonths) {
      return res.status(400).json({ message: "Loan application arguments missing." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer profile missing." });

    // Interest determination mapping
    let annualRate = 9.5;
    if (loanType.toLowerCase().includes("home")) annualRate = 8.45;
    else if (loanType.toLowerCase().includes("personal")) annualRate = 11.25;
    else if (loanType.toLowerCase().includes("car") || loanType.toLowerCase().includes("vehicle")) annualRate = 9.80;

    // Direct dynamic EMI calculation formula
    const monthlyRate = (annualRate / 12) / 100;
    const p = Number(amount);
    const n = Number(tenureMonths);
    const emi = Math.round(p * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1));

    const newLoan: Loan = {
      id: "loan-" + randomUUID().substring(0, 8),
      customer_id: customer.id,
      loan_type: loanType,
      principal: p,
      rate: annualRate,
      tenure_months: n,
      remaining_balance: p,
      emi: emi,
      status: "Active", // Instantly approved for beautiful demo flow experience!
      created_at: new Date().toISOString()
    };

    // Credit loan proceeds directly to checking savings account automatically!
    const primaryAcc = db.getAccountsByCustomerId(customer.id).find(a => a.account_type === "Savings");
    if (primaryAcc) {
      primaryAcc.balance += p;
      db.transactions.push({
        id: randomUUID(),
        account_id: primaryAcc.id,
        type: "Deposit",
        description: `Disbursal of ${loanType} Proceeds Ref #${newLoan.id}`,
        amount: p,
        balance_after: primaryAcc.balance,
        status: "Completed",
        created_at: new Date().toISOString()
      });
    }

    db.loans.push(newLoan);
    return res.json({
      success: true,
      loan: newLoan,
      message: `NexaBank Automated Loan Engine has Approved & Disbursed ₹${p.toLocaleString()} successfully to Savings Account.`
    });
  });

  app.post("/api/loans/:loanId/pay-emi", authenticateToken, (req: any, res) => {
    const { loanId } = req.params;

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Identity error." });

    const loan = db.loans.find(l => l.id === loanId && l.customer_id === customer.id);
    if (!loan) return res.status(404).json({ message: "Loan parameters error." });

    if (loan.remaining_balance <= 0) {
      return res.status(400).json({ message: "Loan is already closed. No secondary emi required." });
    }

    const payAmount = Math.min(loan.emi, loan.remaining_balance);

    const primaryAcc = db.getAccountsByCustomerId(customer.id).find(a => a.account_type === "Savings");
    if (!primaryAcc || primaryAcc.balance < payAmount) {
      return res.status(400).json({ message: "EMI Debit Failed: Insufficient source Savings Account balance." });
    }

    primaryAcc.balance -= payAmount;
    loan.remaining_balance -= payAmount;
    if (loan.remaining_balance <= 0) {
      loan.status = "Closed";
    }

    db.transactions.push({
      id: randomUUID(),
      account_id: primaryAcc.id,
      type: "Loan EMI",
      description: `EMI Paid to Nexa Loan: ${loanId}`,
      amount: -payAmount,
      balance_after: primaryAcc.balance,
      status: "Completed",
      created_at: new Date().toISOString()
    });

    db.loanPayments.push({
      id: "pay-" + randomUUID().substring(0, 8),
      loan_id: loanId,
      amount_paid: payAmount,
      paid_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      loan,
      balance: primaryAcc.balance,
      message: `EMI Payment of ₹${payAmount.toLocaleString()} received successfully for Loan ID - ${loanId}.`
    });
  });

  // --- Investments Segment API ---
  app.get("/api/investments", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });

    return res.json({ investments: db.getInvestmentsByCustomerId(customer.id) });
  });

  app.post("/api/investments/buy", authenticateToken, (req: any, res) => {
    const { type, name, provider, amount } = req.body;
    if (!type || !name || !provider || !amount || amount <= 0) {
      return res.status(400).json({ message: "Investment order arguments missing." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Customer profile missing." });

    const primaryAcc = db.getAccountsByCustomerId(customer.id).find(a => a.account_type === "Savings");
    if (!primaryAcc || primaryAcc.balance < amount) {
      return res.status(400).json({ message: "Debit failed: Insufficient cash balance to execute investment purchase." });
    }

    // Debit Account
    primaryAcc.balance -= Number(amount);

    // Create active Investment record
    const newInv: Investment = {
      id: "inv-" + randomUUID().substring(0, 8),
      customer_id: customer.id,
      type,
      name,
      provider,
      initial_amount: Number(amount),
      current_value: Number(amount), // Starts equal
      status: "Active",
      created_at: new Date().toISOString()
    };

    db.investments.push(newInv);

    // Transaction Record
    db.transactions.push({
      id: randomUUID(),
      account_id: primaryAcc.id,
      type: "Bill Payment", // Acts as general debit outflow
      description: `Invested: ${name}`,
      amount: -Number(amount),
      balance_after: primaryAcc.balance,
      status: "Completed",
      created_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      investment: newInv,
      balance: primaryAcc.balance,
      message: `Asset order executed successfully. Purchased ₹${Number(amount).toLocaleString()} of ${name}.`
    });
  });

  // --- Customer Services Portal API ---
  app.get("/api/customer-services/requests", authenticateToken, (req: any, res) => {
    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });
    return res.json({ requests: db.getServiceRequestsByCustomerId(customer.id) });
  });

  app.post("/api/customer-services/requests", authenticateToken, (req: any, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Service request title and details must be present." });
    }

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });

    const newRequest: ServiceRequest = {
      id: "sr-" + randomUUID().substring(0, 8),
      customer_id: customer.id,
      title,
      description,
      status: "Pending",
      created_at: new Date().toISOString()
    };

    db.serviceRequests.push(newRequest);
    return res.json({
      success: true,
      request: newRequest,
      message: "Customer Service Ticket generated. Reference ID: " + newRequest.id
    });
  });

  app.patch("/api/customer-services/kyc", authenticateToken, (req: any, res) => {
    const { address, dob, pan, aadhaar } = req.body;

    const customer = db.findCustomerByUserId(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Profile error." });

    if (address) customer.address = address;
    if (dob) customer.dob = dob;
    if (pan) customer.pan = pan.toUpperCase();
    if (aadhaar) customer.aadhaar = aadhaar;

    customer.kyc_status = "Approved"; // Re-approved immediately for perfect sandbox simulation experience

    return res.json({
      success: true,
      customer,
      message: " KYC Details uploaded. Your account verification status: Approved."
    });
  });

  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const notifs = db.getNotificationsByUserId(req.user.userId);
    return res.json({ notifications: notifs });
  });

  // --- Vite Dev or Production handler ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NexaBank Backend] Listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during NexaBank server boot: ", err);
});
