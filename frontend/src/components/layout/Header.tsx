'use client';

import React from 'react';
import { Bell, Search, Menu, Sparkles, CheckCircle2, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export default function Header({ onToggleMobile }: HeaderProps) {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
            placeholder="Search your gigs, campaigns, AI actions..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Launch Action */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all">
          <Sparkles className="w-3.5 h-3.5" />
          Run AI Promotion
        </button>

        {/* System Health Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active & Safe</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="text-left hidden md:block max-w-[130px] truncate">
            <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'Seller'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || 'Active Account'}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
