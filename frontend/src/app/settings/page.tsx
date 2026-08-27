'use client';

import React, { useState } from 'react';
import { Settings, Cpu, Key, User, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          System Settings & AI Model Preferences
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure AI provider endpoints, API credentials, and NestJS event dispatchers.
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Cpu className="w-4 h-4 text-indigo-400" />
          AI Engine Provider Selection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Google Gemini AI</span>
              <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 font-mono rounded">RECOMMENDED</span>
            </div>
            <p className="text-gray-400 text-[11px]">Primary model: gemini-2.0-flash (Sub-second response time for agent actions).</p>
            <div className="pt-2">
              <label className="text-gray-400 font-mono text-[10px]">GEMINI_API_KEY</label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full mt-1 bg-slate-950/80 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">OpenAI API</span>
              <span className="px-2 py-0.5 text-[10px] bg-gray-800 text-gray-400 font-mono rounded">SECONDARY</span>
            </div>
            <p className="text-gray-400 text-[11px]">Secondary model: gpt-4o-mini for fallback reasoning.</p>
            <div className="pt-2">
              <label className="text-gray-400 font-mono text-[10px]">OPENAI_API_KEY</label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full mt-1 bg-slate-950/80 border border-white/10 rounded-lg px-3 py-1.5 text-gray-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Backend Endpoint Settings */}
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 pt-4">
          <Key className="w-4 h-4 text-purple-400" />
          Backend API & WebSocket Config
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-300 font-medium">NEXT_PUBLIC_API_URL</label>
            <input
              type="text"
              defaultValue="http://localhost:3001/api/v1"
              className="w-full mt-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-gray-200 font-mono"
            />
          </div>
          <div>
            <label className="text-gray-300 font-medium">NEXT_PUBLIC_WS_URL</label>
            <input
              type="text"
              defaultValue="ws://localhost:3001"
              className="w-full mt-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-gray-200 font-mono"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Settings Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
