'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import {
  Briefcase,
  Plus,
  Sparkles,
  ExternalLink,
  Trash2,
  Tag,
  Star,
  X,
  AlertCircle,
} from 'lucide-react';

export default function GigsPage() {
  const { user } = useAuth();
  const { gigs, addGig, deleteGig, loading } = useUserData(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programming & Tech');
  const [subcategory, setSubcategory] = useState('Web Development');
  const [fiverrUrl, setFiverrUrl] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleAddGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fiverrUrl) return;

    const kwArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    addGig({
      title,
      category,
      subcategory,
      fiverrUrl,
      keywords: kwArray.length > 0 ? kwArray : ['Fiverr', 'Gig'],
      status: 'ACTIVE',
    });

    setTitle('');
    setFiverrUrl('');
    setKeywords('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Fiverr Gig Catalog ({user?.name || 'Private'})
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Private, isolated catalog for <span className="text-indigo-300 font-semibold">{user?.email}</span>. Only you can access your gigs.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Fiverr Gig
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">Loading private workspace...</div>
      ) : gigs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4">
          <Briefcase className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No Gigs Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You don&apos;t have any registered Fiverr gigs yet. Add your first gig to start AI auto-promotions.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all"
          >
            Add Your First Gig
          </button>
        </div>
      ) : (
        /* Gig Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {gig.subcategory}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      gig.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
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
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] bg-slate-900/80 text-gray-300 rounded border border-white/5 flex items-center gap-1"
                    >
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
                  Fiverr Link <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteGig(gig.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                    title="Delete Gig"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Promote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Gig Modal */}
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
              <Plus className="w-5 h-5 text-indigo-400" />
              Add New Fiverr Gig
            </h2>
            <form onSubmit={handleAddGig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Gig Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Full Stack Web App in Next.js"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Fiverr URL</label>
                <input
                  type="url"
                  value={fiverrUrl}
                  onChange={(e) => setFiverrUrl(e.target.value)}
                  placeholder="https://fiverr.com/s/your-gig-link"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category & Subcategory</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="React, Next.js, Web Development, API"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold text-xs shadow-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Save Gig to My Private Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
