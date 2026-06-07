/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MessageSquare, ShieldCheck, Mail, Map, MapPin, User, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { ServiceRequest } from "../types";

export default function CustomerSupport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  // Ticket creation state fields
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  // KYC update state fields
  const [address, setAddress] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [dob, setDob] = useState("");

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/customer-services/requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/customer-services/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: ticketTitle, description: ticketDesc })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setTicketTitle("");
      setTicketDesc("");
      fetchServiceRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("nexa_token");
      const res = await fetch("/api/customer-services/kyc", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ address, dob, pan, aadhaar })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message);
      setAddress("");
      setPan("");
      setAadhaar("");
      setDob("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="nexa-services-management">
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">Customer Support & KYC Centers</h1>
          <p className="text-xs text-slate-500">Generate support tickets and update credentials with zero friction.</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KYC Documentations & Address Update */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit" id="user-profile-kyc">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold mb-5 text-sm uppercase tracking-wider font-mono">
            <User className="text-blue-600 w-4.5 h-4.5" />
            <span>Re-KYC Profile & Credential Uploads</span>
          </div>

          <form onSubmit={handleUpdateKYC} className="space-y-4">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Update Permanent Address</label>
              <textarea
                placeholder="Key in your new validated residential residence address details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-205 p-3 text-xs text-slate-850 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Birth Date</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-3 text-xs text-slate-850 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">PAN Card Code</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 p-3 text-xs text-slate-850 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl uppercase font-mono transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Aadhaar Identity Code</label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 p-3 text-xs text-slate-850 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl cursor-pointer text-xs transition-colors shadow-xs"
            >
              {loading ? <Loader2 className="animate-spin text-white w-4 h-4 mx-auto" /> : <span>Update KYC Verification Registry</span>}
            </button>
          </form>
        </div>

        {/* Technical service tickets & History log */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs" id="tickets-filing">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold mb-5 text-sm uppercase tracking-wider font-mono">
              <MessageSquare className="text-blue-600 w-4.5 h-4.5" />
              <span>File New Support Ticket Service</span>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Ticket Title Issue</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Credit Card Dispatch Status, Fee Dispute"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl p-3 text-xs text-slate-850 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Issue Narrative Details</label>
                <textarea
                  required
                  placeholder="Key in explicit support ticket specifications..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl p-3 text-xs text-slate-850 focus:outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl cursor-pointer text-xs transition-colors shadow-xs"
              >
                {loading ? <Loader2 className="animate-spin text-white w-4 h-4 mx-auto" /> : <span>Broadcast Ticket to Desk</span>}
              </button>
            </form>
          </div>

          {/* Active ticket tracking status */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit" id="active-tickets-tracking">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">
              📨 Active Support Tickets
            </h3>

            {requests.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-mono">
                No active service requests located.
              </div>
            ) : (
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {requests.map(req => {
                  const isResolved = req.status === "Resolved" || req.status === "Closed";
                  return (
                    <div key={req.id} className="p-3.5 bg-slate-50 border border-slate-105 rounded-2xl text-left">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-xs font-extrabold text-slate-850 block max-w-[150px] truncate">{req.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase font-mono ${
                          isResolved ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-orange-50 text-orange-800 border border-orange-100"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 leading-normal truncate">{req.description}</p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-2">Ticket Reference: {req.id}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
