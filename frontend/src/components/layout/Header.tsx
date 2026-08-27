'use client';

import React from 'react';
import { Bell, Search, Menu, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export default function Header({ onToggleMobile }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/10 bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 ml-0 md:ml-64">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button
          onClick={onToggleMobile}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gigs, campaigns, AI actions..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Launch Action (Hidden on tiny screens) */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all">
          <Sparkles className="w-3.5 h-3.5" />
          Run AI Promotion
        </button>

        {/* System Health Pill (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>API Healthy</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            AD
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-gray-200">Alex Drake</p>
            <p className="text-[10px] text-gray-400">Pro Fiverr Seller</p>
          </div>
        </div>
      </div>
    </header>
  );
}
