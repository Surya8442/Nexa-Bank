/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Landmark, ArrowRight, CheckCircle, ShieldAlert, Sparkles, CircleDollarSign, Loader2, Calendar, Percent, RefreshCw } from "lucide-react";
import { Loan } from "../types";

export default function LoansDashboard() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // EMI Calculator state variables
  const [loanCategory, setLoanCategory] = useState<"Home" | "Personal" | "Vehicle">("Home");
  const [principal, setPrincipal] = useState(500000); // 5 Lakhs
  const [tenure, setTenure] = useState(60); // 5 Years

  const rates = {
    Home: 8.45,
    Personal: 11.25,
    Vehicle: 9.80
  };

  const selectedRate = rates[loanCategory];

  // Dynamic EMI Calculation Formula
  const calculateEMI = () => {
    const monthlyRate = (selectedRate / 12) / 100;
    const emi = Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1));
    return isNaN(emi) ? 0 : emi;
  };

  const emiVal = calculateEMI();

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/loans", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLoans(data.loans);
    } catch (e) {
      setError("Failed to fetch current accounts loan ledgers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApplyLoan = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          loanType: `${loanCategory} Loan Special`,
          amount: principal,
          tenureMonths: tenure
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      fetchLoans();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayEMI = async (loanId: string) => {
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch(`/api/loans/${loanId}/pay-emi`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      fetchLoans();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6" id="nexa-loans-panel">
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Lending & Loan Portals</h1>
          <p className="text-xs text-slate-500">Instantly disburse customized auto, home, and personal loans sandbox-wide.</p>
        </div>
        <button
          onClick={fetchLoans}
          className="p-2.5 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs text-left shadow-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin text-blue-600 w-8 h-8 rounded-full border-t-2 border-slate-350" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* EMI Interactive Calculator Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Sparkles className="text-blue-600 w-4 h-4" />
              Nexa Automated Loan Optimizer
            </h3>

            {/* Category selection */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-205">
              {["Home", "Personal", "Vehicle"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setLoanCategory(cat as any)}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    loanCategory === cat ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cat} Loans
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">Desired Principal Cash Amount</span>
                  <span className="text-slate-900 font-extrabold font-mono text-sm">₹{principal.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={2500000}
                  step={50000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹1,00,000</span>
                  <span>₹25,00,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">Clearance Tenure Period</span>
                  <span className="text-slate-900 font-extrabold font-mono text-sm">{tenure} Months ({Math.round(tenure/12)} Yrs)</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={240}
                  step={12}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>12 Months</span>
                  <span>240 Months</span>
                </div>
              </div>
            </div>

            {/* Simulated Summary box */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-105">
              <div className="text-center p-2">
                <span className="text-[9px] text-slate-400 block uppercase font-mono mb-1 font-bold">Interest Rate</span>
                <span className="text-emerald-650 text-sm font-extrabold font-mono">{selectedRate}% p.a.</span>
              </div>
              <div className="text-center p-2 border-x border-slate-200">
                <span className="text-[9px] text-slate-400 block uppercase font-mono mb-1 font-bold">Total Loan Months</span>
                <span className="text-slate-900 text-sm font-extrabold font-mono">{tenure} M</span>
              </div>
              <div className="text-center p-2">
                <span className="text-[9px] text-slate-400 block uppercase font-mono mb-1 font-bold">Monthly EMI</span>
                <span className="text-blue-650 text-sm font-extrabold font-mono font-bold">₹{emiVal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handleApplyLoan}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs shadow-xs"
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>Apply & Disburse ₹{principal.toLocaleString("en-IN")} Instantly</span>
            </button>
          </div>

          {/* Active loans panel side */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs" id="loans-ledger-panel">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Active Loans Portfolio</h3>

            {loans.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No active lending agreements linked.
              </div>
            ) : (
              <div className="space-y-4 h-[350px] overflow-y-auto pr-1">
                {loans.map(loan => {
                  const isClosed = loan.remaining_balance <= 0 || loan.status === "Closed";
                  return (
                    <div
                      key={loan.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isClosed ? "bg-slate-50/50 border-slate-200 opacity-60" : "bg-slate-50 border-slate-105"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500">{loan.loan_type}</span>
                          <span className="text-[10px] font-mono font-bold block text-slate-400 mt-1">ID: {loan.id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase font-mono border ${
                          isClosed ? "bg-slate-200 text-slate-600 border-slate-250" : "bg-blue-50 text-blue-800 border-blue-105"
                        }`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 text-left">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold">Principal Amount</span>
                          <span className="text-slate-800 text-xs font-bold font-mono">₹{loan.principal.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold">Remaining Balance</span>
                          <span className="text-emerald-650 text-xs font-bold font-mono">₹{loan.remaining_balance.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {!isClosed && (
                        <div className="border-t border-slate-105 pt-3 mt-3 flex justify-between items-center gap-4">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold">Due EMI</span>
                            <span className="text-blue-650 text-xs font-bold font-mono">₹{loan.emi.toLocaleString("en-IN")}/mo</span>
                          </div>
                          
                          <button
                            onClick={() => handlePayEMI(loan.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl text-[10px] uppercase cursor-pointer transition-colors shadow-xs"
                          >
                            Pay EMI
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
