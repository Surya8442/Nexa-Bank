/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Grid, CreditCard, Banknote, Landmark, HelpCircle, LogOut, Bell, Coins, UserCircle } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  notifyCount: number;
  openNotifications: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, notifyCount, openNotifications }: SidebarProps) {
  const menuItems = [
    { id: "summary", label: "Account Summary", icon: Grid },
    { id: "transfer", label: "Fund Transfer & UPI", icon: Banknote },
    { id: "cards", label: "Card Management", icon: CreditCard },
    { id: "loans", label: "Loan Services", icon: Landmark },
    { id: "investments", label: "Investment Center", icon: Coins },
    { id: "support", label: "Customer Service Hub", icon: HelpCircle },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col justify-between" id="nexa-sidebar">
      <div>
        {/* Brand logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Coins className="text-white w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-tight">NexaBank</h2>
            <span className="text-[9px] block text-blue-600 font-mono -mt-1 tracking-widest uppercase">Bento Core System</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl mb-6 shadow-sm shadow-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 uppercase">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate leading-tight">
                {user.first_name} {user.last_name}
              </h4>
              <span className="text-[10px] font-mono text-slate-500">{user.email}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 text-[10px] border-t border-slate-200/60 flex justify-between items-center text-slate-500 font-mono">
            <span>KYC VERIFIED</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              APPROVED
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider block mb-2 uppercase">Core Portals</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold border-l-2 border-blue-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        {/* Live Alerts Bell */}
        <button
          onClick={openNotifications}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Alert Messages</span>
          </div>
          {notifyCount > 0 && (
            <span className="bg-rose-500 text-white font-bold font-mono text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-bounce">
              {notifyCount}
            </span>
          )}
        </button>

        {/* Logout Trigger */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Exit Secure Session</span>
        </button>
      </div>
    </aside>
  );
}
