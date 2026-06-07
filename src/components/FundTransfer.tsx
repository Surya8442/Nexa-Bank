/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Landmark, ArrowRightLeft, Send, Sparkles, Plus, CheckCircle, ShieldAlert, Loader2, Phone, Zap, Network, Globe } from "lucide-react";
import { BankAccount, Beneficiary } from "../types";

export default function FundTransfer() {
  const [activeSubTab, setActiveSubTab] = useState<"imps" | "upi" | "bills">("imps");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedSourceAcc, setSelectedSourceAcc] = useState<BankAccount | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  
  // States - Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Bank Transfer Fields
  const [destAccountNumber, setDestAccountNumber] = useState("");
  const [destName, setDestName] = useState("");
  const [destIfsc, setDestIfsc] = useState("");
  const [amount, setAmount] = useState("");
  const [transferMode, setTransferMode] = useState<"IMPS" | "NEFT" | "RTGS">("IMPS");
  const [remark, setRemark] = useState("");

  // Beneficiary Fields
  const [showAddBen, setShowAddBen] = useState(false);
  const [newBenName, setNewBenName] = useState("");
  const [newBenAccount, setNewBenAccount] = useState("");
  const [newBenIfsc, setNewBenIfsc] = useState("");

  // UPI Fields
  const [upiId, setUpiId] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [upiRemark, setUpiRemark] = useState("");

  // Bills Fields
  const [billerCategory, setBillerCategory] = useState("Electricity");
  const [billerName, setBillerName] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [billAmount, setBillAmount] = useState("");

  const billers: Record<string, string[]> = {
    Electricity: ["State Power Distribution Co.", "Adani Electricity", "Tata Power Limited"],
    Broadband: ["Airtel Fiber", "JioFiber Broadband", "ACT Fibernet Broadband"],
    Mobile: ["Airtel Postpaid Special", "Jio Infinite Tele", "Vodafone Vi Cellular"],
    Water: ["Municipal Corporation Water Hub", "Delhi Jal Board", "HMWSSB India"]
  };

  const getTransferData = async () => {
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/accounts/summary", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) setSelectedSourceAcc(data.accounts[0]);
      }

      // Fetch Beneficiary list
      const benRes = await fetch("/api/accounts/beneficiaries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const benData = await benRes.json();
      if (benRes.ok) {
        setBeneficiaries(benData.beneficiaries);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getTransferData();
  }, []);

  const handleCreateBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/accounts/beneficiaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          beneficiaryName: newBenName,
          beneficiaryAccount: newBenAccount,
          ifsc: newBenIfsc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setBeneficiaries(prev => [...prev, data.beneficiary]);
      setShowAddBen(false);
      setNewBenName("");
      setNewBenAccount("");
      setNewBenIfsc("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectBeneficiary = (ben: Beneficiary) => {
    setDestName(ben.beneficiary_name);
    setDestAccountNumber(ben.beneficiary_account);
    setDestIfsc(ben.ifsc);
  };

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceAcc) {
      setError("Please select a valid fund source ledger.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/payments/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          sourceAccountId: selectedSourceAcc.id,
          destAccountNumber,
          destIfsc,
          destName,
          amount: Number(amount),
          mode: transferMode,
          remark
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setAmount("");
      setRemark("");
      // Update local balances
      getTransferData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/payments/upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          upiId,
          amount: Number(upiAmount),
          upiPin,
          remark: upiRemark
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setUpiId("");
      setUpiAmount("");
      setUpiPin("");
      setUpiRemark("");
      getTransferData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBillPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceAcc) {
      setError("Please establish a valid account ledger first");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/payments/bill-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          billerCategory,
          billerName,
          consumerNumber,
          amount: Number(billAmount),
          accountId: selectedSourceAcc.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setConsumerNumber("");
      setBillAmount("");
      getTransferData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="nexa-transfer-panel">
      {/* Top action layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200/85 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Transfer Funds & Buy Bills</h1>
          <p className="text-xs text-slate-500">Transfer instant liquidity inside or outside Nexa networks safely.</p>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
          <button
            onClick={() => { setActiveSubTab("imps"); setError(null); setSuccess(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all ${
              activeSubTab === "imps" ? "bg-white text-blue-600 shadow-xs border border-slate-100" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank Transfer</span>
          </button>
          <button
            onClick={() => { setActiveSubTab("upi"); setError(null); setSuccess(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all ${
              activeSubTab === "upi" ? "bg-white text-purple-600 shadow-xs border border-slate-100" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NexaPay UPI</span>
          </button>
          <button
            onClick={() => { setActiveSubTab("bills"); setError(null); setSuccess(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all ${
              activeSubTab === "bills" ? "bg-white text-orange-650 shadow-xs border border-slate-100" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Utilities & Bills</span>
          </button>
        </div>
      </div>

      {/* Primary Verification alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs shadow-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
          <span>{success}</span>
        </div>
      )}

      {/* --- CONTENT BLOCK --- */}
      {activeSubTab === "imps" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="imps-subportal">
          {/* Main transfer form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-6 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400 animate-pulse" />
              Direct Account Settlement Form
            </h3>

            <form onSubmit={handleBankTransfer} className="space-y-4">
              {/* Source Account Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Select Send Account (Debit)</label>
                <select
                  value={selectedSourceAcc?.id || ""}
                  onChange={(e) => setSelectedSourceAcc(accounts.find(a => a.id === e.target.value) || null)}
                  className="w-full bg-slate-50 border border-slate-205 focus:bg-white text-slate-800 rounded-xl p-3 text-xs focus:outline-none transition-colors"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.account_type} Account - {a.account_number} (Bal: ₹{a.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* recipient coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Beneficiary Account</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter recipient bank account"
                    value={destAccountNumber}
                    onChange={(e) => setDestAccountNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl p-3 text-xs text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Recipient Name / Account Holder</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Amit Kumar"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl p-3 text-xs text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold font-mono">IFSC Code Ident</label>
                  <input
                    type="text"
                    maxLength={11}
                    required
                    placeholder="SBIN0000302"
                    value={destIfsc}
                    onChange={(e) => setDestIfsc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl p-3 text-xs text-slate-850 uppercase focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Settlement Category</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl">
                    {["IMPS", "NEFT", "RTGS"].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTransferMode(mode as any)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          transferMode === mode ? "bg-white text-slate-900 shadow-xs border border-slate-150" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Settlement Cash Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="5,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl p-3 text-xs font-bold text-slate-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Narrative / Comment (Optional)</label>
                  <input
                    type="text"
                    placeholder="Loan clearance, Rent, Family Support..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl p-3 text-xs text-slate-800 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold font-display py-3 rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 text-white" />
                    <span>Executing ledger debit actions...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Authorize Fund Disbursal ({transferMode})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick beneficiaries panel side */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 h-fit shadow-xs" id="beneficiary-management">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800">Registered Payees</h3>
              <button
                onClick={() => setShowAddBen(!showAddBen)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Payee</span>
              </button>
            </div>

            {showAddBen ? (
              <form onSubmit={handleCreateBeneficiary} className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3 mb-4">
                <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-widest font-mono">New Beneficiary Form</span>
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newBenName}
                  onChange={(e) => setNewBenName(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-xl text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Account Number"
                  value={newBenAccount}
                  onChange={(e) => setNewBenAccount(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-xl text-slate-800 focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="IFSC Code"
                  value={newBenIfsc}
                  onChange={(e) => setNewBenIfsc(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-xl text-slate-800 uppercase focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-1.5 rounded-xl text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Add Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBen(false)}
                    className="w-full bg-slate-200 hover:bg-slate-300 py-1.5 rounded-xl text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            <div className="space-y-2">
              {beneficiaries.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-slate-400 font-mono">
                  No quick payees configured. Click Payee to add.
                </div>
              ) : (
                beneficiaries.map(b => (
                  <div
                    key={b.id}
                    onClick={() => selectBeneficiary(b)}
                    className="p-3 bg-slate-50/60 hover:bg-slate-50 border border-slate-150 hover:border-slate-250 rounded-2xl cursor-pointer transition-all text-left"
                  >
                    <span className="text-xs font-bold text-slate-800 block">{b.beneficiary_name}</span>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{b.beneficiary_account}</span>
                      <span>{b.ifsc}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "upi" && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xs" id="upi-subportal">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-650 font-mono mb-1">
              🚀 NexaPay Unified Payments
            </h3>
            <p className="text-xs text-slate-500">Transfer liquidity peer-to-peer instantly. Secure PIN authentications required.</p>
          </div>

          <form onSubmit={handleUpiTransfer} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Recipient UPI VPA ID</label>
              <input
                type="text"
                required
                placeholder="E.g., contact@paytm or quickname@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 focus:border-purple-500 focus:bg-white text-xs text-slate-800 rounded-xl p-3 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="₹100"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-purple-500 focus:bg-white text-xs text-slate-900 rounded-xl p-3 font-bold focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">6-Digit UPI security pin</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={upiPin}
                  onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-purple-500 focus:bg-white text-center font-mono text-xs text-slate-900 rounded-xl p-3"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Context memo Note</label>
              <input
                type="text"
                placeholder="Diner fee, Taxi ride..."
                value={upiRemark}
                onChange={(e) => setUpiRemark(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 focus:border-purple-500 focus:bg-white text-xs text-slate-800 rounded-xl p-3 focus:outline-none transition-colors"
              />
            </div>

            <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-purple-755 text-[10px] font-mono">
              <strong>💡 Demo Note:</strong> Preloaded simulation UPI PIN on linked bank accounts is <span className="text-slate-850 font-bold underline">121212</span>.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold font-display py-3 rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs transition-colors"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4 text-white" /> : <span>Disburse Instant UPI payment</span>}
            </button>
          </form>
        </div>
      )}

      {activeSubTab === "bills" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bills-subportal">
          <div className="lg:col-span-1 space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-widest font-bold">Select category</span>
            {Object.keys(billers).map(cat => (
              <button
                key={cat}
                onClick={() => { setBillerCategory(cat); setBillerName(billers[cat][0]); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  billerCategory === cat
                    ? "bg-orange-50 border-orange-500 text-orange-650 shadow-xs"
                    : "bg-white border-slate-200/80 text-slate-550 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {cat === "Electricity" ? <Zap className="w-4 h-4" /> :
                   cat === "Broadband" ? <Globe className="w-4 h-4" /> :
                   cat === "Mobile" ? <Phone className="w-4 h-4" /> : <Network className="w-4 h-4" />}
                  <span className="text-xs font-bold">{cat} Bills</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-655 font-mono mb-6">
              🔥 Pay {billerCategory} billings utilities
            </h3>

            <form onSubmit={handleBillPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block tracking-widest font-bold">Select bill provider</label>
                  <select
                    value={billerName}
                    onChange={(e) => setBillerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 text-slate-800 rounded-xl p-3 text-xs focus:outline-none transition-colors"
                  >
                    {billers[billerCategory]?.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block tracking-widest font-bold">Consumer Reference Unique key</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., 2018310492"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-orange-500 focus:bg-white text-xs text-slate-800 rounded-xl p-3 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block tracking-widest font-bold">Select payment checking account (Source)</label>
                  <select
                    value={selectedSourceAcc?.id || ""}
                    onChange={(e) => setSelectedSourceAcc(accounts.find(a => a.id === e.target.value) || null)}
                    className="w-full bg-slate-50 border border-slate-205 text-slate-800 rounded-xl p-3 text-xs transition-colors focus:outline-none"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.account_type} - {a.account_number} (Bal: ₹{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase block tracking-widest font-bold text-orange-655">Bill amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1,200"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-orange-500 focus:bg-white text-xs font-bold text-slate-905 rounded-xl p-3 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold font-display py-3 rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs transition-colors"
              >
                {loading ? <Loader2 className="animate-spin text-white w-4 h-4" /> : <span>Settle & Pay Outstanding billing</span>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
