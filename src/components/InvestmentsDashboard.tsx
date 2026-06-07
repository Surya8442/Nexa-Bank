/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Coins, ChevronRight, TrendingUp, DollarSign, Wallet, ShieldCheck, Loader2, ArrowUpRight, HelpCircle, RefreshCw } from "lucide-react";
import { Investment } from "../types";

export default function InvestmentsDashboard() {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buy state fields
  const [buyCategory, setBuyCategory] = useState<"Mutual Fund" | "NPS" | "Digital Gold" | "Fixed Deposit">("Mutual Fund");
  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");

  const investmentOffers = {
    "Mutual Fund": [
      { name: "SBI Bluechip Direct-Growth Fund", provider: "SBI Mutual Fund", yield: "14.2% p.a." },
      { name: "Nexa Infrastructure Focused Fund", provider: "Nexa Mutual Fund", yield: "18.5% p.a." },
      { name: "Nifty 50 Index Conservative Fund", provider: "UTI Asset Management", yield: "12.8% p.a." }
    ],
    "NPS": [
      { name: "National Pension Choice Fund - Class Equity (E)", provider: "Protean CRA", yield: "9.8% p.a." },
      { name: "LIC Pension Fund Scheme G", provider: "LIC CRA Corp", yield: "8.1% p.a." }
    ],
    "Digital Gold": [
      { name: "24K 99.9% Accredited Digital Gold", provider: "MMTC-PAMP Security", yield: "Sovereign Gold Linked" }
    ],
    "Fixed Deposit": [
      { name: "Nexa Premium Saver High-yield FD", provider: "NexaBank Treasury", yield: "7.25% p.a." }
    ]
  };

  const getOffers = () => investmentOffers[buyCategory];

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/investments", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setInvestments(data.investments);
      }
    } catch (e) {
      setError("Failed to fetch investment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Update default offer select name when tab changes
  useEffect(() => {
    const list = getOffers();
    if (list && list.length > 0) {
      setBillerName(list[0].name);
    }
  }, [buyCategory]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const offer = getOffers().find(o => o.name === billerName);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/investments/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: buyCategory,
          name: billerName,
          provider: offer?.provider || "Nexa Securities",
          amount: Number(amount)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setAmount("");
      fetchInvestments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations for dynamic totals
  const totalInvested = investments.reduce((sum, item) => sum + item.initial_amount, 0);
  const totalValuation = investments.reduce((sum, item) => sum + item.current_value, 0);
  const totalGain = totalValuation - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6" id="nexa-investments-panel">
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Investment Center Dashboard</h1>
          <p className="text-xs text-slate-500">Subscribed mutual funds, pension funds, digital gold, and high-yield fixed deposits.</p>
        </div>
        <button
          onClick={fetchInvestments}
          className="p-2.5 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats block totals summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 p-3 opacity-[0.06]">
            <Wallet className="w-16 h-16 text-slate-900" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Total Capital Allocated</span>
          <h3 className="text-2xl font-extrabold text-slate-900 font-display mt-1">₹{totalInvested.toLocaleString("en-IN")}</h3>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Deposited cash value</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 p-3 opacity-[0.06]">
            <Coins className="w-16 h-16 text-slate-900" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Current Market Valuation</span>
          <h3 className="text-2xl font-extrabold text-slate-900 font-display mt-1">₹{totalValuation.toLocaleString("en-IN")}</h3>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Real-time asset trackers active</span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 relative overflow-hidden shadow-xs bg-gradient-to-tr from-emerald-50 to-white">
          <div className="absolute top-0 right-0 p-3 opacity-[0.08]">
            <TrendingUp className="text-emerald-650 w-16 h-16" />
          </div>
          <span className="text-[10px] font-mono text-emerald-600 block uppercase tracking-wider font-bold">Net Portfolio Return Yield</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 font-display mt-1 flex items-baseline gap-1.5 animate-none">
            <span>+₹{totalGain.toLocaleString("en-IN")}</span>
            <span className="text-xs font-mono font-bold">({gainPercentage.toFixed(1)}%)</span>
          </h3>
          <span className="text-[10px] text-emerald-600 font-mono mt-1 block">Yield growth index update</span>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin text-blue-600 w-8 h-8 rounded-full border-t-2 border-slate-350" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="investments-interaction-grid">
          {/* Active Investment listings */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono mb-4">
              💼 Your Subscribed Wealth Portfolios
            </h3>

            {investments.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-mono">
                No active asset orders linked. Subscribe via the Broker desk.
              </div>
            ) : (
              <div className="space-y-3">
                {investments.map(item => {
                  const gain = item.current_value - item.initial_amount;
                  return (
                    <div key={item.id} className="p-4 bg-slate-50 border border-slate-105 rounded-2xl flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] font-mono uppercase bg-slate-200/60 px-2 py-0.5 rounded text-slate-600 font-bold">
                          {item.type}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-2 max-w-sm truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Asset Order ID: {item.id}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Current Value</span>
                        <span className="text-slate-900 text-xs font-bold font-mono">₹{item.current_value.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-emerald-600 block font-mono font-bold mt-0.5">
                          +₹{gain.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Broker Shop Desk Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 h-fit shadow-xs" id="broker-shop-desk">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
              📈 Direct Wealth subscription Desk
            </h3>

            {/* shop types selector */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl mb-4 text-[10px] border border-slate-200">
              {Object.keys(investmentOffers).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBuyCategory(cat as any)}
                  className={`py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                    buyCategory === cat ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <form onSubmit={handleBuy} className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Select Fund Asset Offer</label>
                <select
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 text-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:bg-white transition-colors"
                >
                  {getOffers().map(o => (
                    <option key={o.name} value={o.name}>
                      {o.name} ({o.yield})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Subscription amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="Min ₹5,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 text-xs focus:outline-none focus:bg-white focus:border-blue-500 rounded-xl p-3 text-slate-800 font-mono font-bold transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl cursor-pointer text-xs transition-colors shadow-xs"
              >
                {loading ? <Loader2 className="animate-spin text-white w-4 h-4 mx-auto" /> : <span>Confirm Order & Subscribe Asset</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
