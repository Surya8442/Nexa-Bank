/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CreditCard, Lock, ShieldCheck, ShieldAlert, Check, Loader2, Eye, EyeOff, Sparkles, RefreshCw, Printer, Download } from "lucide-react";
import { Card } from "../types";

export default function CardManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCVVs, setShowCVVs] = useState<Record<string, boolean>>({});

  // ATM Pin Reset Form
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const handleDownloadCardPass = () => {
    if (!selectedCard) return;
    
    const isBlocked = selectedCard.status === "Blocked";
    const isDebit = selectedCard.card_type === "Debit";
    const cvvVisible = showCVVs[selectedCard.id];
    
    const cardHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexa Virtual Card Wallet Secure Pass</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            color: #1e293b;
          }
          .pass-container {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 32px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            max-width: 440px;
            width: 100%;
            padding: 30px;
            box-sizing: border-box;
            text-align: center;
          }
          .title-area h1 {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin: 0 0 4px 0;
          }
          .title-area p {
            font-size: 11px;
            color: #64748b;
            margin: 0 0 24px 0;
            font-weight: 500;
          }
          .card-graphic {
            position: relative;
            background: ${isBlocked ? '#1e293b' : isDebit ? 'linear-gradient(135deg, #1d4ed8, #4338ca, #0f172a)' : 'linear-gradient(135deg, #0f172a, #451a03, #1c1917)'};
            border-radius: 20px;
            padding: 24px;
            color: #ffffff;
            text-align: left;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            margin-bottom: 24px;
            aspect-ratio: 1.586/1;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .card-glow {
            position: absolute;
            top: 0;
            right: 0;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 50%;
            filter: blur(40px);
            pointer-events: none;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .provider {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            color: #cbd5e1;
          }
          .card-type {
            font-size: 11px;
            font-weight: 700;
            color: #e2e8f0;
          }
          .chip-area {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 15px;
          }
          .chip {
            width: 32px;
            height: 22px;
            border-radius: 4px;
            background: linear-gradient(135deg, #fef08a, #facc15, #d97706);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 3px;
            box-sizing: border-box;
            border: 1px solid rgba(0,0,0,0.1);
          }
          .chip-line1 {
            border: 1px solid rgba(0,0,0,0.15);
            height: 4px;
            border-radius: 1px;
          }
          .chip-line2 {
            border: 1px solid rgba(0,0,0,0.15);
            height: 6px;
            border-radius: 1px;
          }
          .contactless {
            display: flex;
            flex-direction: column;
            gap: 2px;
            opacity: 0.6;
          }
          .contactless div {
            width: 3px;
            height: 10px;
            background: #ffffff;
            border-radius: 10px;
          }
          .card-number {
            font-family: 'JetBrains Mono', monospace;
            font-size: 16px;
            letter-spacing: 2px;
            color: #ffffff;
            margin: 20px 0;
            font-weight: 700;
          }
          .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10px;
            color: #cbd5e1;
            font-family: 'JetBrains Mono', monospace;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 10px;
          }
          .holder {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            color: #ffffff;
            margin-top: 2px;
          }
          .meta-val {
            font-weight: 700;
            color: #ffffff;
          }
          .receipt-details {
            background-color: #f8fafc;
            border-radius: 16px;
            padding: 16px;
            font-size: 11px;
            text-align: left;
            border: 1px solid #f1f5f9;
            margin-bottom: 24px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .receipt-row:last-child {
            margin-bottom: 0;
            border-top: 1px dashed #e2e8f0;
            padding-top: 8px;
            font-weight: 700;
          }
          .label {
            color: #64748b;
          }
          .value {
            color: #0f172a;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
          }
          .certified-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .print-btn {
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 14px;
            padding: 12px 24px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.2s;
            margin-top: 15px;
          }
          .print-btn:hover {
            background-color: #1e293b;
          }
          @media print {
            body { background: #fff; }
            .pass-container { border: none; box-shadow: none; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="pass-container">
          <div class="title-area">
            <h1>NEXA WALLET SECURE PASS</h1>
            <p>Certified virtual credit/debit hotlist credential pass</p>
          </div>

          <div class="card-graphic">
            <div class="card-glow"></div>
            <div class="card-header">
              <div>
                <span class="provider">${selectedCard.card_provider}</span>
                <div class="card-type">${selectedCard.card_type} card</div>
              </div>
              <span style="font-size: 10px; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${selectedCard.status}
              </span>
            </div>

            <div class="chip-area">
              <div class="chip">
                <div class="chip-line1"></div>
                <div class="chip-line2"></div>
              </div>
              <div class="contactless">
                <div></div>
                <div></div>
              </div>
            </div>

            <div class="card-number">
              ${selectedCard.card_number}
            </div>

            <div class="card-meta">
              <div>
                <div>Card Member</div>
                <div class="holder">${selectedCard.card_holder || "Nexa Customer"}</div>
              </div>
              <div style="display: flex; gap: 15px;">
                <div>
                  <div>Expiry</div>
                  <div class="meta-val">${selectedCard.expiry}</div>
                </div>
                <div>
                  <div>CVV</div>
                  <div class="meta-val" style="letter-spacing: 2px;">${cvvVisible ? selectedCard.cvv : "•••"}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="receipt-details">
            <div class="receipt-row">
              <span class="label">Reference Identity</span>
              <span class="value">${selectedCard.id}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Spend Limit Amount</span>
              <span class="value">₹${selectedCard.limit_amount.toLocaleString("en-IN")}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Current Usage Value</span>
              <span class="value">₹${selectedCard.current_usage.toLocaleString("en-IN")}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Encryption Key Type</span>
              <span class="value">SHA-256 Secured Ledger</span>
            </div>
            <div class="receipt-row">
              <span class="label">Linked Account ID</span>
              <span class="value">${selectedCard.account_id}</span>
            </div>
          </div>

          <div class="certified-badge">
            <svg style="width: 12px; height: 12px; fill: currentColor;" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 11.37c0-2.43 1.97-4.4 4.4-4.4h6.868c2.43 0 4.4 1.97 4.4 4.4v2.748c0 1.215-.985 2.2-2.2 2.2H4.366c-1.215 0-2.2-.985-2.2-2.2V11.37zM6.566 8.37a2.9 2.9 0 100-5.8 2.9 2.9 0 000 5.8zm6.868 0a2.9 2.9 0 100-5.8 2.9 2.9 0 000 5.8z" clip-rule="evenodd"/>
            </svg>
            Nexa Vault Authenticated Pass
          </div>

          <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([cardHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nexa_Virtual_Card_${selectedCard.card_number.replace(/\s+/g, '')}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/cards", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.cards);
        if (data.cards.length > 0) {
          setSelectedCard(data.cards[0]);
        }
      }
    } catch (e) {
      setError("Failed to fetch allied banking cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleBlock = async (cardId: string, currentBlockedStatus: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch(`/api/cards/${cardId}/toggle-block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ block: !currentBlockedStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      // Local state update
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: data.card.status } : c));
      if (selectedCard?.id === cardId) {
        setSelectedCard(prev => prev ? { ...prev, status: data.card.status } : null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    if (newPin.length !== 4) {
      setError("The secure ATM pin code must represent exactly 4 numerical characters.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("The secure PIN codes mismatch. Please key in matching codes.");
      return;
    }

    setPinLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch(`/api/cards/${selectedCard.id}/reset-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pin: newPin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setNewPin("");
      setConfirmPin("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPinLoading(false);
    }
  };

  const toggleCvvVisible = (cardId: string) => {
    setShowCVVs(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="space-y-6" id="nexa-card-management">
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/85 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Nexa Card Hub</h1>
          <p className="text-xs text-slate-500">Lock cards and customize ATM secret pins digitally.</p>
        </div>
        <button
          onClick={fetchCards}
          className="p-2.5 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs shadow-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Showcase and List */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Available Bank Cards</span>

            <div className="grid grid-cols-1 gap-4">
              {cards.map((card) => {
                const isBlocked = card.status === "Blocked";
                const isDebit = card.card_type === "Debit";
                const cvvVisible = showCVVs[card.id];

                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`relative p-6 rounded-3xl border cursor-pointer transition-all overflow-hidden ${
                      selectedCard?.id === card.id 
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm" 
                        : "border-slate-200/80 hover:border-slate-300 bg-white"
                    } ${
                      isBlocked ? "opacity-60" : ""
                    }`}
                  >
                    <div className={`p-6 rounded-2xl relative overflow-hidden text-white ${
                      isBlocked ? "bg-slate-800" :
                      isDebit
                        ? "bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900"
                        : "bg-gradient-to-br from-slate-900 via-amber-950 to-stone-900"
                    }`}>
                      {/* Glowing Vector overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-slate-300 font-bold uppercase">
                            {card.card_provider}
                          </span>
                          <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">{card.card_type} Account Card</h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase font-mono ${
                          isBlocked ? "bg-rose-500/30 text-rose-200" : "bg-emerald-500/30 text-emerald-200"
                        }`}>
                          {card.status}
                        </span>
                      </div>

                      {/* Chip & NFC Graphic Vector */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 flex flex-col justify-between p-1 shadow">
                          <div className="border border-slate-950/20 w-4 h-1.5 rounded-sm" />
                          <div className="border border-slate-950/20 w-5 h-2 rounded-sm" />
                        </div>
                        <div className="flex flex-col gap-0.5 opacity-60">
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-base font-bold text-white tracking-widest font-mono">
                          {card.card_number}
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/10 pt-4 text-[10px] text-slate-300 font-mono">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Hold Name</span>
                          <span className="text-white font-bold uppercase font-sans">{card.card_holder || "Nexa Customer"}</span>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono">Exp Limit</span>
                            <span className="text-white font-bold">₹{card.limit_amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400">Expiry</span>
                            <span className="text-white font-bold">{card.expiry}</span>
                          </div>
                          <div className="relative">
                            <span className="block text-[8px] uppercase tracking-wider text-slate-400">CVV</span>
                            <div className="flex items-center gap-1">
                              <span className="text-white font-bold tracking-widest">
                                {cvvVisible ? card.cvv : "•••"}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCvvVisible(card.id);
                                }}
                                className="text-slate-300 hover:text-white cursor-pointer"
                              >
                                {cvvVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card actions (selected card) */}
          {selectedCard && (
            <div className="space-y-6">
              {/* Quick block switcher */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-4 font-bold">Secure Hotlists Toggle</span>

                <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200/50 rounded-2xl">
                  <div className="max-w-[70%]">
                    <h4 className="text-xs font-bold text-slate-800">Temporary Card Freeze block</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Toggle status to temporarily or permanently block/unblock ATM swipe rights.</p>
                  </div>
                  <button
                    onClick={() => handleToggleBlock(selectedCard.id, selectedCard.status === "Blocked")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer active:scale-[0.98] transition-transform ${
                      selectedCard.status === "Blocked"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-rose-600 hover:bg-rose-700 text-white"
                    }`}
                  >
                    {selectedCard.status === "Blocked" ? "Activate Card" : "Freeze Card"}
                  </button>
                </div>
              </div>

              {/* Secure Local Pass Download */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-4 font-bold">Secure Local Pass</span>
                
                <div className="bg-slate-50 p-4 border border-slate-200/50 rounded-2xl flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Card Wallet Offline Pass</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Download a certified wallet pass with chip, status, and spend limits to your device securely.</p>
                  </div>
                  <button
                    onClick={handleDownloadCardPass}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 rounded-xl cursor-pointer active:scale-[0.98] transition-all border border-slate-900 shadow-xs"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Download Wallet Pass</span>
                  </button>
                </div>
              </div>

              {/* Reset atm PIN */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-4 font-bold">ATM PIN Code Configuration</span>

                <form onSubmit={handleResetPinSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">New ATM 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-slate-205 focus:bg-white text-center font-mono focus:outline-none p-3 rounded-xl text-slate-900 text-xs transition-colors"
                        placeholder="••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Confirm ATM PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-slate-205 focus:bg-white text-center font-mono focus:outline-none p-3 rounded-xl text-slate-900 text-xs transition-colors"
                        placeholder="••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pinLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl cursor-pointer text-xs transition-colors shadow-sm"
                  >
                    {pinLoading ? <Loader2 className="animate-spin text-white w-4 h-4 mx-auto" /> : <span>Update Secured Card PIN Code</span>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
