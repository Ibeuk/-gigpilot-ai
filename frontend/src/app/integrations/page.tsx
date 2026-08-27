'use client';

import React from 'react';
import { Share2, CheckCircle2, ShieldCheck, Link2, ExternalLink } from 'lucide-react';

const mockIntegrations = [
  {
    name: 'Google Ads API',
    category: 'Advertising',
    description: 'Automated search campaign creation and keyword bidding.',
    connected: true,
    status: 'AUTHENTICATED',
  },
  {
    name: 'Meta Marketing API',
    category: 'Social Advertising',
    description: 'Facebook & Instagram retargeting campaigns.',
    connected: true,
    status: 'AUTHENTICATED',
  },
  {
    name: 'Google Analytics GA4',
    category: 'Traffic Intelligence',
    description: 'Conversion tracking and real-time visitor event attribution.',
    connected: true,
    status: 'AUTHENTICATED',
  },
  {
    name: 'Resend / Email Marketing',
    category: 'Email Services',
    description: 'Transactional notifications and client updates.',
    connected: false,
    status: 'NOT CONNECTED',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-6 h-6 text-cyan-400" />
          External Platform Integrations
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Connect advertising accounts, analytics services, and email dispatch engines.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIntegrations.map((item, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {item.category}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  item.connected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{item.name}</h3>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> OAuth 2.0 Encrypted
              </span>
              <button className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                item.connected
                  ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}>
                {item.connected ? 'Configure' : 'Connect Account'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
