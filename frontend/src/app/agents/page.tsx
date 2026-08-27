'use client';

import React, { useState } from 'react';
import {
  Bot,
  Terminal,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';

const mockAgents = [
  {
    id: 'agent-1',
    name: 'Ad Campaign Strategist Agent',
    description: 'Generates search ad copy, optimizes target demographic keywords, and adjusts PPC bids.',
    status: 'RUNNING',
    type: 'Marketing & Ads',
    lastAction: 'Updated Google Ads negative keywords (2 mins ago)',
    executionCount: 1420,
    model: 'Gemini 2.0 Flash',
  },
  {
    id: 'agent-2',
    name: 'Social Media & Content Generator',
    description: 'Creates promotional posts, code snippet showcases, and gig feature highlights.',
    status: 'RUNNING',
    type: 'Content Creation',
    lastAction: 'Posted promotional thread to X/Twitter & LinkedIn (12 mins ago)',
    executionCount: 890,
    model: 'Gemini 2.0 Flash',
  },
  {
    id: 'agent-3',
    name: 'Fiverr SEO & Metadata Specialist',
    description: 'Audits Fiverr search ranking algorithm factors and suggests tag enhancements.',
    status: 'IDLE',
    type: 'SEO & Optimization',
    lastAction: 'Completed Gig audit for Next.js Web Dev (1 hour ago)',
    executionCount: 450,
    model: 'GPT-4o Mini',
  },
  {
    id: 'agent-4',
    name: 'Analytics & Traffic Auditor',
    description: 'Tracks click-through rates, conversion funnels, and alerts on anomalous traffic spikes.',
    status: 'RUNNING',
    type: 'Analytics & Monitoring',
    lastAction: 'Audited 24-hour impression data (5 mins ago)',
    executionCount: 2100,
    model: 'Gemini 2.0 Flash',
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            AI Agent Fleet & Orchestration
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor autonomous AI agents powered by Gemini 2.0 and NestJS event emitters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            3/4 AGENTS ACTIVE
          </span>
        </div>
      </div>

      {/* Agents List + Live Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Cards */}
        <div className="lg:col-span-2 space-y-4">
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedAgent.id === agent.id
                  ? 'border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{agent.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/10 text-gray-300">
                      {agent.model}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{agent.description}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                  agent.status === 'RUNNING'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {agent.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  {agent.lastAction}
                </span>
                <span className="font-mono text-[11px] text-gray-500">
                  Runs: {agent.executionCount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Terminal & Agent Control */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live Agent Execution Log
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">STREAMING</span>
            </div>

            {/* Terminal Window */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-white/10 font-mono text-[11px] space-y-2 h-72 overflow-y-auto">
              <p className="text-gray-500">[11:04:12] Initializing {selectedAgent.name}...</p>
              <p className="text-indigo-400">[11:04:13] Provider: Gemini 2.0 Flash (API Key Verified)</p>
              <p className="text-gray-300">[11:04:15] Task: Analyze target keywords for Fiverr Gig "Next.js Dev"</p>
              <p className="text-emerald-400">[11:04:18] Success: Generated 12 high-converting tags</p>
              <p className="text-purple-400">[11:04:22] EventEmitter: Emitted `agent.task.completed` payload</p>
              <p className="text-gray-400 animate-pulse">[11:04:26] Awaiting next scheduled queue interval...</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5" /> Trigger Manual Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
