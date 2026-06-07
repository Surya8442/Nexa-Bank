/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// NexaBank High-Fidelity InMemory/Local Database Management Systems
import { randomUUID } from "node:crypto";

export interface User {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  pin: string; // 6-digit MPIN
  status: "active" | "suspended" | "pending_otp";
  otp?: string;
  otp_expiry?: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  pan: string;
  aadhaar: string;
  dob: string;
  address: string;
  kyc_status: "Approved" | "Pending" | "Rejected";
}

export interface Account {
  id: string;
  customer_id: string;
  account_number: string;
  account_type: "Savings" | "Current" | "Fixed Deposit";
  balance: number;
  branch: string;
  ifsc: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: "Deposit" | "Withdrawal" | "Transfer" | "UPI" | "Bill Payment" | "Loan EMI";
  description: string;
  amount: number;
  balance_after: number;
  status: "Completed" | "Pending" | "Failed";
  created_at: string;
}

export interface Beneficiary {
  id: string;
  customer_id: string;
  beneficiary_name: string;
  beneficiary_account: string;
  ifsc: string;
  status: "Approved" | "Pending";
}

export interface Card {
  id: string;
  account_id: string;
  card_number: string;
  card_type: "Debit" | "Credit";
  card_provider: "Visa Platinum" | "Mastercard Signature" | "RuPay Select";
  status: "Active" | "Blocked" | "Suspended";
  limit_amount: number;
  current_usage: number;
  expiry: string;
  cvv: string;
  pin: string; // 4-digit PIN
  card_holder?: string;
}

export interface Loan {
  id: string;
  customer_id: string;
  loan_type: string;
  principal: number;
  rate: number; // monthly or annual %
  tenure_months: number;
  remaining_balance: number;
  emi: number;
  status: "Active" | "Pending" | "Closed" | "Rejected";
  created_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount_paid: number;
  paid_at: string;
}

export interface Investment {
  id: string;
  customer_id: string;
  type: "Mutual Fund" | "NPS" | "Digital Gold" | "Fixed Deposit";
  name: string;
  provider: string;
  initial_amount: number;
  current_value: number;
  status: "Active" | "Redeemed";
  created_at: string;
}

export interface UPIAccount {
  id: string;
  account_id: string;
  upi_id: string;
  pin: string; // 6-digit UPI PIN
  status: "Active" | "Disabled";
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  created_at: string;
}

class Database {
  users: User[] = [];
  customers: Customer[] = [];
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  beneficiaries: Beneficiary[] = [];
  cards: Card[] = [];
  loans: Loan[] = [];
  loanPayments: LoanPayment[] = [];
  investments: Investment[] = [];
  upiAccounts: UPIAccount[] = [];
  notifications: Notification[] = [];
  serviceRequests: ServiceRequest[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Preload Demo User (matching user's email or general custom access)
    // Email: demo@nexabank.com or user's email
    // Password: Password@123 (hashed mock)
    // Pin: 112233
    const userId1 = "u-demo-1111";
    const custId1 = "c-demo-2222";
    const accId1 = "a-demo-3333";

    const demoUser: User = {
      id: userId1,
      email: "demo@nexabank.com",
      phone: "+91 98765 43210",
      password_hash: "$2a$10$DEMOPASSWORDHASHED1234567890", // For simulation, password is "Demo@123"
      pin: "112233",
      status: "active",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const demoCustomer: Customer = {
      id: custId1,
      user_id: userId1,
      first_name: "Surya",
      last_name: "Kandipalli",
      pan: "ABCPK1234R",
      aadhaar: "5544 1122 3344",
      dob: "1994-08-15",
      address: "12, Royal Enclave, Gachibowli, Hyderabad, Telangana - 500032",
      kyc_status: "Approved",
    };

    const demoAccount: Account = {
      id: accId1,
      customer_id: custId1,
      account_number: "20448194059",
      account_type: "Savings",
      balance: 425750.50,
      branch: "Hyderabad Corporate Branch",
      ifsc: "NEXB0004921",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Add secondary savings fd
    const fdAccount: Account = {
      id: "a-demo-fd",
      customer_id: custId1,
      account_number: "50148292812",
      account_type: "Fixed Deposit",
      balance: 1500000.00,
      branch: "Hyderabad Corporate Branch",
      ifsc: "NEXB0004921",
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Add Transactions
    const txs: Transaction[] = [
      {
        id: randomUUID(),
        account_id: accId1,
        type: "Deposit",
        description: "Salary Credit - Google India",
        amount: 250000.00,
        balance_after: 425750.50,
        status: "Completed",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        account_id: accId1,
        type: "UPI",
        description: "UPI to coffeehouse@paytm",
        amount: 120.00,
        balance_after: 175750.50,
        status: "Completed",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        account_id: accId1,
        type: "Transfer",
        description: "NEFT to Amit Kumar",
        amount: 14500.00,
        balance_after: 175870.50,
        status: "Completed",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        account_id: accId1,
        type: "Bill Payment",
        description: "Biller Payment - Airtel Postpaid Mobile",
        amount: 1199.00,
        balance_after: 190370.50,
        status: "Completed",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: randomUUID(),
        account_id: accId1,
        type: "Loan EMI",
        description: "Nexa Home Loan EMI Auto-debit",
        amount: 22400.00,
        balance_after: 191569.50,
        status: "Completed",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Seed Beneficiaries
    const bens: Beneficiary[] = [
      {
        id: "b-1",
        customer_id: custId1,
        beneficiary_name: "Amit Kumar",
        beneficiary_account: "30514802821",
        ifsc: "SBIN0001021",
        status: "Approved",
      },
      {
        id: "b-2",
        customer_id: custId1,
        beneficiary_name: "Priyanka S",
        beneficiary_account: "40921820194",
        ifsc: "ICIC0000114",
        status: "Approved",
      },
    ];

    // Cards
    const cards: Card[] = [
      {
        id: "card-debit-1",
        account_id: accId1,
        card_number: "4059 8812 7391 0244",
        card_type: "Debit",
        card_provider: "Visa Platinum",
        status: "Active",
        limit_amount: 100000,
        current_usage: 4200,
        expiry: "09/31",
        cvv: "142",
        pin: "2580",
        card_holder: "Surya Kandipalli",
      },
      {
        id: "card-credit-1",
        account_id: accId1,
        card_number: "5241 2911 3824 8112",
        card_type: "Credit",
        card_provider: "Mastercard Signature",
        status: "Active",
        limit_amount: 300000,
        current_usage: 18450.70,
        expiry: "12/29",
        cvv: "882",
        pin: "4321",
        card_holder: "Surya Kandipalli",
      },
    ];

    // UPI Linked Account
    const upiAcc: UPIAccount = {
      id: "upi-demo-1",
      account_id: accId1,
      upi_id: "suryak@nexapay",
      pin: "121212",
      status: "Active",
    };

    // Active Loans
    const loans: Loan[] = [
      {
        id: "loan-demo-1",
        customer_id: custId1,
        loan_type: "Home Loan Premium",
        principal: 2500000,
        rate: 8.45,
        tenure_months: 240,
        remaining_balance: 2150000,
        emi: 22400,
        status: "Active",
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "loan-demo-2",
        customer_id: custId1,
        loan_type: "Personal Loan Instant",
        principal: 300000,
        rate: 11.5,
        tenure_months: 36,
        remaining_balance: 0,
        emi: 9890,
        status: "Closed",
        created_at: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Investments
    const investments: Investment[] = [
      {
        id: "inv-1",
        customer_id: custId1,
        type: "Mutual Fund",
        name: "SBI Bluechip Direct Growth Fund",
        provider: "SBI Mutual Fund",
        initial_amount: 250000,
        current_value: 382450,
        status: "Active",
        created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "inv-2",
        customer_id: custId1,
        type: "Mutual Fund",
        name: "Nexa Infrastructure Focus Fund",
        provider: "Nexa Mutual Fund",
        initial_amount: 150000,
        current_value: 198200,
        status: "Active",
        created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "inv-3",
        customer_id: custId1,
        type: "Digital Gold",
        name: "24K 99.9% Digital Gold",
        provider: "MMTC-PAMP",
        initial_amount: 50000,
        current_value: 62400,
        status: "Active",
        created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Notifications
    const notifications: Notification[] = [
      {
        id: "n-1",
        user_id: userId1,
        title: "Salary Credited",
        message: "Dear Customer, salary of ₹2,50,000 has been credited to your account 20448194059 on 05-06-2026.",
        read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "n-2",
        user_id: userId1,
        title: "Security Alert: MPIN Setup Successful",
        message: "Your new NexaBank 6-digit MPIN has been configured successfully.",
        read: true,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Service Requests
    const serviceRequests: ServiceRequest[] = [
      {
        id: "sr-1",
        customer_id: custId1,
        title: "Cheque Book Request",
        description: "Need secondary 50-leaf cheque book for corporate savings.",
        status: "Resolved",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sr-2",
        customer_id: custId1,
        title: "Re-KYC Document Verification",
        description: "Submitting latest passport size card and residential lease agreement for address updates.",
        status: "In_Progress",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Store in internal state Arrays
    this.users.push(demoUser);
    this.customers.push(demoCustomer);
    this.accounts.push(demoAccount, fdAccount);
    this.transactions.push(...txs);
    this.beneficiaries.push(...bens);
    this.cards.push(...cards);
    this.upiAccounts.push(upiAcc);
    this.loans.push(...loans);
    this.investments.push(...investments);
    this.notifications.push(...notifications);
    this.serviceRequests.push(...serviceRequests);
  }

  // DB Handlers
  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findCustomerByUserId(userId: string): Customer | undefined {
    return this.customers.find((c) => c.user_id === userId);
  }

  getAccountsByCustomerId(customerId: string): Account[] {
    return this.accounts.filter((a) => a.customer_id === customerId);
  }

  getTransactionsByAccountId(accountId: string): Transaction[] {
    return this.transactions
      .filter((t) => t.account_id === accountId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getCardsByAccountId(accountId: string): Card[] {
    return this.cards.filter((c) => c.account_id === accountId);
  }

  getLoansByCustomerId(customerId: string): Loan[] {
    return this.loans.filter((l) => l.customer_id === customerId);
  }

  getInvestmentsByCustomerId(customerId: string): Investment[] {
    return this.investments.filter((i) => i.customer_id === customerId);
  }

  getUPIAccountsByAccountId(accountId: string): UPIAccount[] {
    return this.upiAccounts.filter((u) => u.account_id === accountId);
  }

  getServiceRequestsByCustomerId(customerId: string): ServiceRequest[] {
    return this.serviceRequests.filter((s) => s.customer_id === customerId);
  }

  getNotificationsByUserId(userId: string): Notification[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }
}

export const db = new Database();
