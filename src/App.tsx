/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import AuthScreens from "./components/AuthScreens";
import Sidebar from "./components/Sidebar";
import AccountSummary from "./components/AccountSummary";
import FundTransfer from "./components/FundTransfer";
import CardManagement from "./components/CardManagement";
import LoansDashboard from "./components/LoansDashboard";
import InvestmentsDashboard from "./components/InvestmentsDashboard";
import CustomerSupport from "./components/CustomerSupport";
import { User, NexaNotification } from "./types";
import { Bell, X, ShieldCheck, Mail, Smartphone, Eye, Sparkles } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("nexa_token"));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [loading, setLoading] = useState(true);

  // Notifications Dialog Sidebar state
  const [notifications, setNotifications] = useState<NexaNotification[]>([]);
  const [showNotifSidebar, setShowNotifSidebar] = useState(false);

  const determineAuthSession = async () => {
    const rawToken = localStorage.getItem("nexa_token");
    if (!rawToken) {
      setLoading(false);
      return;
    }

    try {
      // Check auth validation by fetching account summary
      const res = await fetch("/api/accounts/summary", {
        headers: { "Authorization": `Bearer ${rawToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setToken(rawToken);
        // Retrieve temporary user data saved in session metadata
        const savedUser = localStorage.getItem("nexa_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Fail-safe default
          setUser({
            id: data.customer.id,
            email: "demo@nexabank.com",
            phone: "+91 98765 43210",
            first_name: data.customer.first_name,
            last_name: data.customer.last_name,
            kyc_status: data.customer.kyc_status
          });
        }
      } else {
        // Clear corrupt session
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Alert logs retrieve failed", err);
    }
  };

  useEffect(() => {
    determineAuthSession();
  }, []);

  useEffect(() => {
    if (token) {
      fetchAlerts();
      // Periodically poll for transaction logs and credits to feel real-time!
      const timer = setInterval(() => {
        fetchAlerts();
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem("nexa_token", newToken);
    localStorage.setItem("nexa_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setActiveTab("summary");
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setActiveTab("summary");
  };

  // Safe mark alert as read simulation
  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Sparkles className="animate-spin text-blue-500 w-10 h-10 mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Decrypting Nexa Safe...</span>
      </div>
    );
  }

  // Router to render the selected tab active screen
  const renderPortalView = () => {
    switch (activeTab) {
      case "summary":
        return <AccountSummary />;
      case "transfer":
        return <FundTransfer />;
      case "cards":
        return <CardManagement />;
      case "loans":
        return <LoansDashboard />;
      case "investments":
        return <InvestmentsDashboard />;
      case "support":
        return <CustomerSupport />;
      default:
        return <AccountSummary />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" id="nexa-application-canvas">
      {!token || !user ? (
        <AuthScreens onAuthSuccess={handleAuthSuccess} />
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden">
          
          {/* Main Sidebar Nave */}
          <Sidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            notifyCount={unreadNotifCount}
            openNotifications={() => setShowNotifSidebar(true)}
          />

          {/* Core Dashboard Content scrollboard area with Bento Grid canvas background */}
          <main className="flex-1 bg-[#F8FAFC] p-6 lg:p-10 overflow-y-auto max-h-screen relative">
            {/* Render selected route */}
            <div className="z-10 relative">
              {renderPortalView()}
            </div>
          </main>

          {/* Interactive sliding alerts drawer in Bento Grid style */}
          {showNotifSidebar && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="alerts-drawer-root">
              <div
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs cursor-pointer"
                onClick={() => setShowNotifSidebar(false)}
              />

              <div className="relative w-full max-w-sm bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-xl h-full animate-slide-left z-10 text-left">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider font-sans">
                      <Bell className="text-blue-600 w-4.5 h-4.5" />
                      <span>Transmissions alerts</span>
                    </div>
                    <button
                      onClick={() => setShowNotifSidebar(false)}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400 font-mono">
                        No secure messages dispatched.
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div
                          key={item.id}
                          onClick={() => markNotifRead(item.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-colors text-left ${
                            item.read ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-blue-50/55 border-blue-100 text-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-xs font-bold leading-tight block">{item.title}</span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[10px] leading-relaxed mb-2 text-slate-500">{item.message}</p>
                          <span className="text-[9px] font-mono text-slate-450">
                            {new Date(item.created_at).toLocaleDateString()} &nbsp;•&nbsp; Transmission Safe
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>AES-GCM Protocols Active</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="hover:text-slate-700 underline"
                  >
                    Clear Transmissions
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
