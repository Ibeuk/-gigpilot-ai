'use client';

import React from 'react';
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  TrendingUp,
  Globe,
  Share2,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MousePointer,
} from 'lucide-react';

const mockCampaigns = [
  {
    id: 'camp-1',
    name: 'Next.js Dev Google Search Ads',
    type: 'GOOGLE_ADS',
    targetGig: 'Full Stack Web Development with Next.js',
    status: 'RUNNING',
    budget: '$150.00',
    spent: '$42.50',
    impressions: '42,800',
    clicks: '3,840',
    ctr: '8.97%',
  },
  {
    id: 'camp-2',
    name: 'AI Agent Social Media Content Blast',
    type: 'SOCIAL_BLAST',
    targetGig: 'Autonomous AI Agent System & Python',
    status: 'RUNNING',
    budget: '$50.00',
    spent: '$18.00',
    impressions: '65,200',
    clicks: '9,120',
    ctr: '13.98%',
  },
  {
    id: 'camp-3',
    name: 'Meta Retargeting Campaign',
    type: 'META_ADS',
    targetGig: 'Professional PostgreSQL Optimization',
    status: 'PAUSED',
    budget: '$200.00',
    spent: '$110.00',
    impressions: '34,800',
    clicks: '5,460',
    ctr: '15.68%',
  },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-400" />
            Promotional Campaigns
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor and manage multi-channel promotion campaigns driving traffic to your Fiverr Gigs.
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Launch Campaign
        </button>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Active Campaigns</h3>
          <span className="text-xs text-gray-400 font-mono">3 Campaigns Total</span>
        </div>

        <div className="divide-y divide-white/5">
          {mockCampaigns.map((camp) => (
            <div key={camp.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    camp.status === 'RUNNING'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {camp.status}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {camp.type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{camp.name}</h4>
                <p className="text-xs text-gray-400">Target: <strong className="text-gray-300">{camp.targetGig}</strong></p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <p className="text-gray-400 text-[10px]">Impressions</p>
                  <p className="font-bold text-white mt-0.5">{camp.impressions}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <p className="text-gray-400 text-[10px]">Clicks</p>
                  <p className="font-bold text-white mt-0.5">{camp.clicks}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <p className="text-gray-400 text-[10px]">CTR</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{camp.ctr}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <p className="text-gray-400 text-[10px]">Budget Spent</p>
                  <p className="font-bold text-indigo-300 mt-0.5">{camp.spent} / {camp.budget}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {camp.status === 'RUNNING' ? (
                  <button className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all">
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all">
                    <Play className="w-3.5 h-3.5" /> Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
