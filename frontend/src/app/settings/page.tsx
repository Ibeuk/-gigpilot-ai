'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { Settings, Cpu, Key, User, Save, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserData(user?.id);

  const [sellerName, setSellerName] = useState('');
  const [fiverrProfileUrl, setFiverrProfileUrl] = useState('');
  const [autoPingEnabled, setAutoPingEnabled] = useState(true);
  const [pingInterval, setPingInterval] = useState(15);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setSellerName(settings.sellerName || user?.name || '');
      setFiverrProfileUrl(settings.fiverrProfileUrl || '');
      setAutoPingEnabled(settings.autoPingEnabled ?? true);
      setPingInterval(settings.pingIntervalMinutes || 15);
    }
  }, [settings, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      sellerName,
      fiverrProfileUrl,
      autoPingEnabled,
      pingIntervalMinutes: pingInterval,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          Account & Private Preferences ({user?.name || 'User'})
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Isolated preferences for user <span className="text-indigo-300 font-semibold">{user?.email}</span> (ID: <span className="font-mono text-indigo-400">{user?.id}</span>).
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <User className="w-4 h-4 text-indigo-400" />
          Seller Profile & Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Full Name / Seller Display Name</label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="e.g. Ibe Uko"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Email Address (Read-only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300 font-semibold block mb-1">Fiverr Profile URL</label>
          <input
            type="url"
            value={fiverrProfileUrl}
            onChange={(e) => setFiverrProfileUrl(e.target.value)}
            placeholder="https://www.fiverr.com/yourusername"
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 pt-4">
          <Cpu className="w-4 h-4 text-purple-400" />
          Auto-Pinger & AI Engine Settings
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-white/10">
            <div>
              <span className="font-bold text-white block">24/7 Continuous Auto-Ping Loop</span>
              <span className="text-gray-400 text-[11px]">Automatically ping your registered Fiverr gigs to maintain high indexing frequency.</span>
            </div>
            <input
              type="checkbox"
              checked={autoPingEnabled}
              onChange={(e) => setAutoPingEnabled(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Ping Interval (Minutes)</label>
            <select
              value={pingInterval}
              onChange={(e) => setPingInterval(Number(e.target.value))}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value={5}>Every 5 Minutes (Aggressive)</option>
              <option value={15}>Every 15 Minutes (Balanced - Recommended)</option>
              <option value={30}>Every 30 Minutes (Standard)</option>
              <option value={60}>Every 60 Minutes (Conservative)</option>
            </select>
          </div>
        </div>

        {/* Backend & Privacy Status */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Strict Multi-Tenant Isolation: All settings and data are encrypted and scoped to User ID: <code className="font-mono text-white">{user?.id}</code>.</span>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Private Settings Saved!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
