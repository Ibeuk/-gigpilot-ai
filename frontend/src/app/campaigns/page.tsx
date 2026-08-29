'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  Eye,
  MousePointer,
  X,
} from 'lucide-react';

export default function CampaignsPage() {
  const { user } = useAuth();
  const { campaigns, gigs, addCampaign, loading } = useUserData(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('SOCIAL_MEDIA');
  const [gigTitle, setGigTitle] = useState('');
  const [budget, setBudget] = useState('$100');

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCampaign({
      name,
      type,
      gigTitle: gigTitle || (gigs[0]?.title || 'All Fiverr Gigs'),
      status: 'ACTIVE',
      budget,
    });

    setName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-400" />
            Promotional Campaigns ({user?.name || 'Private'})
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Private campaign control for <span className="text-purple-300 font-semibold">{user?.email}</span>. Only you can view or launch campaigns here.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Launch Campaign
        </button>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Active Campaigns</h3>
          <span className="text-xs text-gray-400 font-mono">{campaigns.length} Campaigns Total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-xs">Loading user campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-3">
            <Megaphone className="w-10 h-10 text-purple-400 mx-auto opacity-50" />
            <p>No active promotional campaigns for this account.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {camp.status}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {camp.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base mt-1">{camp.name}</h4>
                  <p className="text-xs text-gray-400">Target: {camp.gigTitle}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3 text-indigo-400" /> Reach</span>
                    <span className="font-bold text-white text-sm block mt-0.5">{camp.reach || '12.4K'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 flex items-center gap-1"><MousePointer className="w-3 h-3 text-purple-400" /> Clicks</span>
                    <span className="font-bold text-white text-sm block mt-0.5">{camp.clicks || 480}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Conversions</span>
                    <span className="font-bold text-emerald-400 text-sm block mt-0.5">{camp.conversions || 32} orders</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Budget</span>
                    <span className="font-bold text-white text-sm block mt-0.5">{camp.budget}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-purple-400" />
              Launch New Promotion Campaign
            </h2>
            <form onSubmit={handleLaunchCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next.js Traffic Blast"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Channel / Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="SOCIAL_MEDIA">Social Media Blast (X / LinkedIn / Meta)</option>
                  <option value="GOOGLE_ADS">Google Search & PPC Ads</option>
                  <option value="SEO_PINGER">Search Engine Indexing Pinger</option>
                  <option value="CONTENT_MARKETING">AI Blog & Article Syndication</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Gig</label>
                <select
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {gigs.map((g) => (
                    <option key={g.id} value={g.title}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Budget ($)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="$100"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Launch Private Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
