/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  kyc_status: "Approved" | "Pending" | "Rejected";
}

export interface BankAccount {
  id: string;
  account_number: string;
  account_type: "Savings" | "Current" | "Fixed Deposit";
  balance: number;
  branch: string;
  ifsc: string;
}

export interface BankTransaction {
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
  beneficiary_name: string;
  beneficiary_account: string;
  ifsc: string;
  status: string;
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
  card_holder?: string;
}

export interface Loan {
  id: string;
  loan_type: string;
  principal: number;
  rate: number;
  tenure_months: number;
  remaining_balance: number;
  emi: number;
  status: "Active" | "Pending" | "Closed" | "Rejected";
  created_at: string;
}

export interface Investment {
  id: string;
  type: "Mutual Fund" | "NPS" | "Digital Gold" | "Fixed Deposit";
  name: string;
  provider: string;
  initial_amount: number;
  current_value: number;
  status: "Active" | "Redeemed";
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  created_at: string;
}

export interface NexaNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
