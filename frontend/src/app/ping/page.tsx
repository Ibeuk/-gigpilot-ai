'use client';

import React from 'react';
import InstantPinger from '@/components/pinger/InstantPinger';
import InfiniteLoopMonitor from '@/components/pinger/InfiniteLoopMonitor';
import { Zap, ShieldCheck, Globe, Rocket, Repeat, Rss } from 'lucide-react';

export default function PingPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-emerald-400" />
          24/7 Infinite Auto-Promotion Engine
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Never-ending automatic promotion loop for your Fiverr Gigs. Runs 24/7 and auto-resumes on VPS reboot.
        </p>
      </div>

      {/* 24/7 Infinite Loop Monitor */}
      <InfiniteLoopMonitor />

      {/* Manual Instant Pinger Widget */}
      <InstantPinger />

      {/* Features Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Repeat className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">24/7 Continuous Loop</h3>
          <p className="text-xs text-gray-400">
            Runs endlessly in the background. Cycles through your Fiverr Gigs across 15+ target indexing nodes.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">VPS Auto-Resume</h3>
          <p className="text-xs text-gray-400">
            Integrated with system startup hooks. Automatically resumes promotion whenever your server or VPS restarts.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Rss className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Dynamic RSS 2.0 Feed</h3>
          <p className="text-xs text-gray-400">
            Auto-generates <code className="text-[10px] text-amber-300">/rss/gigs.xml</code> bundling all active Gigs into a single feed for RSS aggregators.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Rocket className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Backlink Aggregation</h3>
          <p className="text-xs text-gray-400">
            Submits your Gig URLs to high-authority search engine indexers (Google, Bing, Yandex, Pingomatic).
          </p>
        </div>
      </div>
    </div>
  );
}
