'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Sparkles,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle,
  TrendingUp,
  Tag,
  Star,
} from 'lucide-react';

const mockGigs = [
  {
    id: 'gig-1',
    title: 'Full Stack Web Development with Next.js & Node.js',
    category: 'Programming & Tech',
    subcategory: 'Web Development',
    fiverrUrl: 'https://fiverr.com/sample-gig-1',
    keywords: ['Next.js', 'React', 'Node.js', 'Web App', 'TypeScript'],
    campaignsCount: 4,
    status: 'ACTIVE',
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 'gig-2',
    title: 'Autonomous AI Agent System & Python Automation',
    category: 'AI Services',
    subcategory: 'AI Agents & Automation',
    fiverrUrl: 'https://fiverr.com/sample-gig-2',
    keywords: ['AI Agent', 'Python', 'LangChain', 'OpenAI', 'Automation'],
    campaignsCount: 3,
    status: 'ACTIVE',
    rating: 5.0,
    reviews: 94,
  },
  {
    id: 'gig-3',
    title: 'Professional PostgreSQL & Database Optimization',
    category: 'Programming & Tech',
    subcategory: 'Databases',
    fiverrUrl: 'https://fiverr.com/sample-gig-3',
    keywords: ['PostgreSQL', 'Prisma', 'SQL', 'Database Tuning'],
    campaignsCount: 1,
    status: 'DRAFT',
    rating: 4.8,
    reviews: 42,
  },
];

export default function GigsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Fiverr Gig Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your Fiverr gig catalog, optimize tags with AI, and launch promotions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Fiverr Gig
        </button>
      </div>

      {/* Gig Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGigs.map((gig) => (
          <div key={gig.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {gig.subcategory}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  gig.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {gig.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug hover:text-indigo-300 transition-colors">
                {gig.title}
              </h3>

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {gig.rating} ({gig.reviews})
                </span>
                <span>•</span>
                <span className="text-gray-400">{gig.campaignsCount} Active Campaigns</span>
              </div>

              {/* Keywords list */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {gig.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-900/80 text-gray-300 rounded border border-white/5 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-indigo-400" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <a
                href={gig.fiverrUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Fiverr URL <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Promote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
