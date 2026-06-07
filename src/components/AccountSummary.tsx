/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Eye, EyeOff, Search, ArrowUpRight, ArrowDownLeft, FileText, Landmark, Wallet, RefreshCw, Layers, Download, Printer } from "lucide-react";
import { BankAccount, BankTransaction } from "../types";

export default function AccountSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [showBalances, setShowBalances] = useState<Record<string, boolean>>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<"All" | "Credits" | "Debits">("All");

  const handleDownloadCSV = () => {
    if (!selectedAccount) return;
    
    // Create CSV content from filtered transactions
    const headers = ["Transaction ID", "Date", "Description", "Type", "Amount (INR)", "Balance (INR)"];
    
    const rows = filteredTxs.map(tx => [
      tx.id,
      `"${new Date(tx.created_at).toLocaleString("en-IN")}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type,
      tx.amount,
      tx.balance_after
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nexa_Statement_${selectedAccount.account_number}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = () => {
    if (!selectedAccount) return;
    
    const userEmail = localStorage.getItem("nexa_email") || "Verified Nexa Customer";
    
    const statementHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexa Bank - Official Statement</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .logo-area p {
            font-size: 11px;
            color: #64748b;
            margin: 4px 0 0 0;
            font-weight: 500;
          }
          .statement-details {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #64748b;
          }
          .statement-details h2 {
            font-size: 14px;
            color: #475569;
            margin: 0 0 8px 0;
            font-family: 'Inter', sans-serif;
            font-weight: 700;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .info-block h3 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin: 0 0 6px 0;
          }
          .info-block p {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
          }
          .info-block .small {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
          }
          .table-container {
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
            padding: 10px;
            font-weight: 700;
          }
          td {
            padding: 12px 10px;
            font-size: 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .amount {
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
          }
          .amount.credit {
            color: #16a34a;
          }
          .amount.debit {
            color: #dc2626;
          }
          .mono {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
          }
          .badge {
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-upi { background-color: #faf5ff; color: #7e22ce; }
          .badge-bill { background-color: #fff7ed; color: #c2410c; }
          .badge-emi { background-color: #fef2f2; color: #b91c1c; }
          .badge-other { background-color: #f0fdf4; color: #15803d; }
          .footer {
            margin-top: 60px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
          .stamp {
            display: inline-block;
            border: 2px dashed #16a34a;
            color: #16a34a;
            padding: 6px 12px;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            transform: rotate(-3deg);
            border-radius: 4px;
            margin-top: 20px;
          }
          .print-header-actions {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            display: flex;
            justify-content: flex-end;
          }
          .print-btn {
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-header-actions no-print">
          <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
        </div>

        <div class="header">
          <div class="logo-area">
            <h1>NEXA FINANCIAL INSTITUTION</h1>
            <p>Empowered Digital Ledger & Allied Liquidity Services</p>
          </div>
          <div class="statement-details">
            <h2>ACCOUNT STATEMENT</h2>
            <div>Generated: ${new Date().toLocaleString("en-IN")}</div>
            <div>Ref Code: NX-${Math.floor(100000 + Math.random() * 900000)}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <h3>Account Holder</h3>
            <p>${userEmail}</p>
          </div>
          <div class="info-block">
            <h3>Registered Account Details</h3>
            <p class="small">${selectedAccount.account_number} (${selectedAccount.account_type})</p>
          </div>
          <div class="info-block">
            <h3>Branch Location & IFSC</h3>
            <p>${selectedAccount.branch} (${selectedAccount.ifsc})</p>
          </div>
          <div class="info-block">
            <h3>Statement Book Balance</h3>
            <p>₹${selectedAccount.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Narrative Details</th>
                <th class="text-center">Reference Type</th>
                <th class="text-right">Transaction Value</th>
                <th class="text-right">Ledger Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTxs.map(tx => {
                const isCredit = tx.amount > 0;
                const badgeClass = tx.type === "UPI" ? "badge-upi" : tx.type === "Bill Payment" ? "badge-bill" : tx.type === "Loan EMI" ? "badge-emi" : "badge-other";
                return `
                  <tr>
                    <td class="mono">${new Date(tx.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style="font-weight: 600;">${tx.description}</td>
                    <td class="text-center"><span class="badge ${badgeClass}">${tx.type}</span></td>
                    <td class="text-right amount ${isCredit ? 'credit' : 'debit'}">${isCredit ? '+' : ''}₹${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td class="text-right mono">₹${tx.balance_after.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div style="text-align: right; margin-top: 30px;">
          <div class="stamp">Securely Verified By Nexa DB</div>
        </div>

        <div class="footer">
          <p>This is a computer-generated transaction statement certified under cryptographic keys. No physical signature required.</p>
          <p>Nexa Securities Ltd © ${new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([statementHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nexa_Statement_${selectedAccount.account_number}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAccountsSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/accounts/summary", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load account ledger reports.");

      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        setSelectedAccount(data.accounts[0]);
        // Default hide balance for safety
        const hides: Record<string, boolean> = {};
        data.accounts.forEach((acc: BankAccount) => {
          hides[acc.id] = false;
        });
        setShowBalances(hides);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMiniStatement = async (accountId: string) => {
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch(`/api/accounts/statement/${accountId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error("Statement fetch failed", e);
    }
  };

  useEffect(() => {
    fetchAccountsSummary();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchMiniStatement(selectedAccount.id);
    }
  }, [selectedAccount]);

  const toggleBalance = (accId: string) => {
    setShowBalances(prev => ({
      ...prev,
      [accId]: !prev[accId]
    }));
  };

  // Filter transaction records
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (txTypeFilter === "Credits") {
      return matchesSearch && tx.amount > 0;
    } else if (txTypeFilter === "Debits") {
      return matchesSearch && tx.amount < 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6" id="nexa-account-summary">
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Nexa Accounts Portfolio</h1>
          <p className="text-xs text-slate-500">Enquire secure ledger logs and statement records in real-time.</p>
        </div>
        <button
          onClick={fetchAccountsSummary}
          className="p-2.5 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin text-blue-600 w-8 h-8 rounded-full border-t-2 border-slate-350" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-750 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* Account balance grids in clean modern Bento style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const visible = showBalances[acc.id];
              const isSelected = selectedAccount?.id === acc.id;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`relative p-6 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                      : "bg-white border-slate-200/85 hover:border-slate-350 text-slate-800 shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-2xl ${
                        isSelected
                          ? "bg-slate-850 text-blue-400"
                          : acc.account_type === "Savings" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {acc.account_type === "Savings" ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase font-mono tracking-widest ${isSelected ? "text-slate-400" : "text-slate-500"}`}>{acc.account_type} Account</span>
                        <h3 className={`text-xs font-mono font-bold mt-0.5 ${isSelected ? "text-slate-200" : "text-slate-700"}`}>{acc.account_number}</h3>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBalance(acc.id);
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "text-slate-400 hover:text-white hover:bg-slate-850" : "text-slate-400 hover:text-slate-750 hover:bg-slate-50"
                      }`}
                    >
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="my-3">
                    <span className={`text-[10px] uppercase font-mono tracking-widest ${isSelected ? "text-slate-400" : "text-slate-500"}`}>Available Balance</span>
                    <div className={`text-2xl font-bold font-display mt-1 ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {visible ? `₹${acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "•••••••"}
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[10px] font-mono ${
                    isSelected ? "border-slate-850 text-slate-400" : "border-slate-100 text-slate-500"
                  }`}>
                    <span>IFSC: <span className={isSelected ? "text-slate-200" : "text-slate-700"}>{acc.ifsc}</span></span>
                    <span>Branch: <span className={isSelected ? "text-slate-200" : "text-slate-700"}>{acc.branch.split(" ")[0]}</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statement View block */}
          {selectedAccount && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs" id="mini-statements-block">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Account Activity Logs ({selectedAccount.account_number})
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">Showing last 20 operations</span>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 bg-slate-50 border border-slate-200/60 p-1 rounded-xl">
                  {["All", "Credits", "Debits"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTxTypeFilter(tab as any)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                        txTypeFilter === tab
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search utility */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search statements by narrative, type (e.g., Salary, UPI)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-all"
                />
              </div>

              {/* Transactions Statement Table */}
              <div className="overflow-x-auto">
                {filteredTxs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No matching ledger accounts transactions discovered.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-3 px-2">Initiated Date</th>
                        <th className="py-3 px-2">Narrative Action</th>
                        <th className="py-3 px-2 text-center">Reference Type</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                        <th className="py-3 px-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {filteredTxs.map((tx) => {
                        const isCredit = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 text-slate-700">
                            <td className="py-3 px-2 text-[11px] font-mono text-slate-450">
                              {new Date(tx.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="py-3 px-2 font-bold max-w-xs truncate text-slate-800" title={tx.description}>
                              {tx.description}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                tx.type === "UPI" ? "bg-purple-50 text-purple-600" :
                                tx.type === "Bill Payment" ? "bg-orange-50 text-orange-600" :
                                tx.type === "Loan EMI" ? "bg-rose-50 text-rose-600" :
                                "bg-emerald-50 text-emerald-600"
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className={`py-3 px-2 text-right font-bold font-mono ${
                              isCredit ? "text-emerald-600" : "text-rose-650"
                            }`}>
                              {isCredit ? "+" : ""}{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-450">
                              ₹{tx.balance_after.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Spreadsheet (CSV)</span>
                </button>
                <button
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs border border-blue-600"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Print Certified Statement</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
