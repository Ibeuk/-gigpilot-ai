'use client';

import React, { useState } from 'react';
import InstantPinger from '@/components/pinger/InstantPinger';
import InfiniteLoopMonitor from '@/components/pinger/InfiniteLoopMonitor';
import {
  TrendingUp,
  Zap,
  Bot,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  BarChart2,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Clock,
  Eye,
  MousePointer,
  DollarSign,
} from 'lucide-react';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Dashboard Overview
            <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Live Control
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time Fiverr gig promotions, autonomous AI agents, and traffic analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl glass-card text-gray-300 hover:text-white transition-all flex items-center gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Metrics
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* 24/7 Infinite Auto-Promotion Loop Engine */}
      <InfiniteLoopMonitor />

      {/* PingMyURLs Style Instant Auto-Pinger Widget */}
      <InstantPinger />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Impressions</p>
              <h3 className="text-2xl font-bold text-white mt-1">142,850</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% vs last week
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-medium">Gig Clicks</p>
              <h3 className="text-2xl font-bold text-white mt-1">18,420</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.2% CTR Boost
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-medium">Active Campaigns</p>
              <h3 className="text-2xl font-bold text-white mt-1">8 Running</h3>
              <p className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1 font-semibold">
                <Zap className="w-3.5 h-3.5" /> 4 Channels Active
              </p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 font-medium">Estimated ROI</p>
              <h3 className="text-2xl font-bold text-white mt-1">$4,850.00</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> 4.2x Ad Return
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
        </div>
      </div>

      {/* Main Grid: Traffic Analytics & AI Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Traffic & Impression Visualizer */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Traffic & Impression Growth
              </h3>
              <p className="text-xs text-gray-400">Weekly traffic driven to promoted Fiverr Gigs</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Organic
              </span>
              <span className="flex items-center gap-1.5 text-gray-300 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> AI Campaign
              </span>
            </div>
          </div>

          {/* SVG Chart Visualization */}
          <div className="h-64 w-full bg-slate-950/60 rounded-xl p-4 border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="flex justify-between text-[10px] text-gray-500 border-b border-white/5 pb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {[
                { day: 'Mon', organic: 35, ai: 60 },
                { day: 'Tue', organic: 42, ai: 75 },
                { day: 'Wed', organic: 50, ai: 90 },
                { day: 'Thu', organic: 65, ai: 110 },
                { day: 'Fri', organic: 70, ai: 140 },
                { day: 'Sat', organic: 85, ai: 165 },
                { day: 'Sun', organic: 95, ai: 190 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    <div
                      style={{ height: `${item.organic}%` }}
                      className="w-3 bg-indigo-600/70 group-hover:bg-indigo-500 rounded-t transition-all"
                    ></div>
                    <div
                      style={{ height: `${item.ai}%` }}
                      className="w-3 bg-purple-500 rounded-t group-hover:bg-pink-500 transition-all"
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: AI Agent Status */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                AI Agent Fleet
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                4 AGENTS
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Ad Campaign Strategist', status: 'Optimizing Ads', color: 'text-indigo-400', progress: 92 },
                { name: 'Content Blast Generator', status: 'Generating Posts', color: 'text-purple-400', progress: 78 },
                { name: 'Fiverr SEO & Tag Optimizer', status: 'Analyzing Keywords', color: 'text-emerald-400', progress: 100 },
                { name: 'Analytics & Traffic Auditor', status: 'Monitoring Traffic', color: 'text-cyan-400', progress: 65 },
              ].map((agent, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-200">{agent.name}</span>
                    <span className={`text-[10px] font-mono ${agent.color}`}>{agent.status}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400`}
                      style={{ width: `${agent.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Manage Agent Configurations
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recommendations, Task Queue, Active Campaigns & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 3: AI Recommendations */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Optimization Recommendations
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
              <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                Keyword Boost Available
              </p>
              <p className="text-gray-400 text-[11px]">
                Targeting "AI Automation Workflow" on Google Ads can increase gig impressions by 34%.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Pricing Tier Suggestion
              </p>
              <p className="text-gray-400 text-[11px]">
                Adding a Premium $150 package to your Full Stack Gig improved conversions for 82% of similar sellers.
              </p>
            </div>
          </div>
        </div>

        {/* Widget 4: Autonomous Task Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Autonomous Task Queue
          </h3>
          <div className="space-y-2.5">
            {[
              { task: 'Post Social Media Blast', status: 'In Progress', queue: 'BullMQ #402' },
              { task: 'Update Meta Ad Audience', status: 'Queued', queue: 'BullMQ #403' },
              { task: 'Fetch Google Analytics Sync', status: 'Completed', queue: 'BullMQ #401' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                <div>
                  <p className="font-medium text-gray-200">{t.task}</p>
                  <p className="text-[10px] text-gray-500">{t.queue}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-gray-300 font-mono">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 5: System Health & Services */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            System Infrastructure Health
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-gray-300 font-medium">PostgreSQL Database</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 99.9% Up
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-gray-300 font-medium">Redis / BullMQ Queue</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-gray-300 font-medium">NestJS Backend API</span>
              <span className="text-indigo-400 font-mono font-semibold">Port 3001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
