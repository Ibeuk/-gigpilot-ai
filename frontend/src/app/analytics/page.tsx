'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  PieChart,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Filter,
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Traffic & Conversion Analytics
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Deep dive into traffic sources, impression conversion rates, and promotional ROI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 rounded-xl glass-card text-xs text-gray-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <p className="text-xs text-gray-400 font-medium">Conversion Funnel (Impressions to Clicks)</p>
          <h3 className="text-2xl font-bold text-white">12.89% CTR</h3>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +3.4% above industry benchmark
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <p className="text-xs text-gray-400 font-medium">Top Traffic Channel</p>
          <h3 className="text-2xl font-bold text-white">Google Search Ads</h3>
          <p className="text-xs text-purple-400 font-semibold">48.2% total traffic volume</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <p className="text-xs text-gray-400 font-medium">Cost Per Click (CPC)</p>
          <h3 className="text-2xl font-bold text-white">$0.14 Avg</h3>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> -$0.05 efficiency gain
          </p>
        </div>
      </div>

      {/* Channel Performance Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white">Promotional Channel ROI & Conversion Breakdown</h3>
        <div className="space-y-4">
          {[
            { channel: 'Google Search Ads', share: '48.2%', clicks: '8,850', color: 'bg-indigo-500' },
            { channel: 'Social Media Content Blast', share: '31.5%', clicks: '5,800', color: 'bg-purple-500' },
            { channel: 'Meta Retargeting', share: '14.3%', clicks: '2,630', color: 'bg-pink-500' },
            { channel: 'Direct / Organic Referral', share: '6.0%', clicks: '1,140', color: 'bg-emerald-500' },
          ].map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-200">
                <span>{c.channel}</span>
                <span className="font-mono text-gray-400">{c.clicks} clicks ({c.share})</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full ${c.color}`} style={{ width: c.share }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
