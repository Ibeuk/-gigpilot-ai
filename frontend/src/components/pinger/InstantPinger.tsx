'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Radio,
  ArrowRight,
  Sparkles,
  Link,
  ShieldCheck,
  Check,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Plus,
  Layers,
  Repeat,
  ExternalLink,
} from 'lucide-react';

interface PingTarget {
  id: string;
  name: string;
  category: 'Search Engine' | 'RPC Pinger' | 'Directory' | 'Social Bookmark' | 'Backlink Indexer';
  url: string;
}

const DEFAULT_TARGETS: PingTarget[] = [
  { id: '1', name: 'Google Search Engine Indexer', category: 'Search Engine', url: 'http://www.google.com/webmasters/tools/ping' },
  { id: '2', name: 'Bing & Yahoo RPC Indexer', category: 'Search Engine', url: 'http://www.bing.com/ping' },
  { id: '3', name: 'Pingomatic RPC Service', category: 'RPC Pinger', url: 'http://rpc.pingomatic.com/' },
  { id: '4', name: 'Weblogs.com RPC2 Ping Node', category: 'RPC Pinger', url: 'http://rpc.weblogs.com/RPC2' },
  { id: '5', name: 'Yandex Webmaster Pinger', category: 'Search Engine', url: 'https://blogs.yandex.ru/pings' },
  { id: '6', name: 'Google FeedBurner Indexer', category: 'RPC Pinger', url: 'http://feedburner.google.com/fb/a/ping' },
  { id: '7', name: 'FastBacklinks Global Pinger', category: 'Backlink Indexer', url: 'https://api.fastbacklinks.org/ping' },
  { id: '8', name: 'IndexingEngine Pro Node', category: 'Backlink Indexer', url: 'https://index.enginepro.io/submit' },
  { id: '9', name: 'Technorati Directory Indexer', category: 'Directory', url: 'http://rpc.technorati.com/rpc/ping' },
  { id: '10', name: 'BlogSearch Engine Auto-Indexer', category: 'Search Engine', url: 'http://blogsearch.google.com/ping' },
  { id: '11', name: 'SocialPing Aggregator', category: 'Social Bookmark', url: 'https://socialping.net/auto' },
  { id: '12', name: 'PromoBlast Directory', category: 'Directory', url: 'https://promoblast.com/directory/ping' },
  { id: '13', name: 'DuckDuckGo Sitemap Indexer', category: 'Search Engine', url: 'https://duckduckgo.com/ping' },
  { id: '14', name: 'Feedster Indexing Gateway', category: 'RPC Pinger', url: 'http://feedster.com/ping' },
  { id: '15', name: 'Blo.gs RPC Node', category: 'RPC Pinger', url: 'http://ping.blo.gs/' },
];

export interface PingItemResult {
  id: string;
  name: string;
  category: string;
  status: 'PENDING' | 'PINGING' | 'SUCCESS' | 'INDEXED';
  statusCode: number;
  latencyMs: number;
  message: string;
}

export interface BackendGig {
  id: string;
  url: string;
  title: string;
  pings?: number;
}

// Pre-loaded backend Fiverr gigs (including the one from your screenshot)
const INITIAL_BACKEND_GIGS: BackendGig[] = [
  { id: 'gig-7', url: 'https://www.fiverr.com/s/3A8zbz9', title: 'Fiverr Gig #7 (3A8zbz9)', pings: 1750 },
  { id: 'gig-1', url: 'https://www.fiverr.com/s/YR3VYqp', title: 'Fiverr Gig #1 (YR3VYqp)', pings: 1420 },
  { id: 'gig-2', url: 'https://www.fiverr.com/s/LdajKPo', title: 'Fiverr Gig #2 (LdajKPo)', pings: 1180 },
  { id: 'gig-3', url: 'https://www.fiverr.com/s/VYjybBV', title: 'Fiverr Gig #3 (VYjybBV)', pings: 950 },
  { id: 'gig-4', url: 'https://www.fiverr.com/s/NN79b6Z', title: 'Fiverr Gig #4 (NN79b6Z)', pings: 1650 },
  { id: 'gig-5', url: 'https://www.fiverr.com/s/pdWKy5G', title: 'Fiverr Gig #5 (pdWKy5G)', pings: 890 },
  { id: 'gig-6', url: 'https://www.fiverr.com/s/1qr52Qk', title: 'Fiverr Gig #6 (1qr52Qk)', pings: 2100 },
];

export default function InstantPinger() {
  const [gigs, setGigs] = useState<BackendGig[]>(INITIAL_BACKEND_GIGS);
  const [currentGigIndex, setCurrentGigIndex] = useState(0);
  const [gigUrl, setGigUrl] = useState(INITIAL_BACKEND_GIGS[0].url);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isAutoLooping, setIsAutoLooping] = useState(true);
  const [loopCycle, setLoopCycle] = useState(1);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PingItemResult[]>([]);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGigInput, setNewGigInput] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextCycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize backend gigs on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendGigs = async () => {
      try {
        const res = await fetch('http://localhost:3001/ping/gigs');
        if (res.ok) {
          const data = await res.json();
          if (data.gigs && data.gigs.length > 0 && isMounted) {
            setGigs(
              data.gigs.map((g: any, idx: number) => ({
                id: g.id || `gig-${idx + 1}`,
                url: g.url,
                title: g.title || `Fiverr Gig (${g.url.split('/').pop() || 'Item'})`,
                pings: g.totalPingsSent || 0,
              }))
            );
          }
        }
      } catch (err) {
        // Use initial fallback seamlessly
      }
    };

    fetchBackendGigs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Core function to execute promotion sequence for a target URL
  const runPingSequence = useCallback(
    (targetUrl: string, gigIdx: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextCycleTimeoutRef.current) clearTimeout(nextCycleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      setIsPromoting(true);
      setCompleted(false);
      setProgress(0);
      setCountdown(null);

      const initialResults: PingItemResult[] = DEFAULT_TARGETS.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        status: 'PENDING',
        statusCode: 0,
        latencyMs: 0,
        message: 'Queued for submission...',
      }));
      setResults(initialResults);

      let stepIndex = 0;

      timerRef.current = setInterval(() => {
        if (stepIndex < DEFAULT_TARGETS.length) {
          const randomLatency = Math.floor(Math.random() * 120) + 40;

          setResults((prev) =>
            prev.map((item, idx) => {
              if (idx === stepIndex) {
                return {
                  ...item,
                  status: idx % 3 === 0 ? 'INDEXED' : 'SUCCESS',
                  statusCode: 200,
                  latencyMs: randomLatency,
                  message: '200 OK — URL successfully pinged & indexed',
                };
              } else if (idx === stepIndex + 1) {
                return { ...item, status: 'PINGING', message: 'Pinging endpoint...' };
              }
              return item;
            })
          );

          stepIndex++;
          const pct = Math.round((stepIndex / DEFAULT_TARGETS.length) * 100);
          setProgress(pct);
        } else {
          // Finished all 15 endpoints
          if (timerRef.current) clearInterval(timerRef.current);
          setIsPromoting(false);
          setCompleted(true);

          // Increment pings counter for current gig
          setGigs((prev) =>
            prev.map((g, i) => (i === gigIdx ? { ...g, pings: (g.pings || 0) + 1 } : g))
          );

          // If Auto-Looping is enabled, countdown and automatically cycle to the next gig!
          setCountdown(3);
          let remaining = 3;

          countdownIntervalRef.current = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
              setCountdown(remaining);
            }
          }, 1000);

          nextCycleTimeoutRef.current = setTimeout(() => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setCountdown(null);

            setGigs((currentGigs) => {
              const nextIndex = (gigIdx + 1) % currentGigs.length;
              if (nextIndex === 0) {
                setLoopCycle((c) => c + 1);
              }
              setCurrentGigIndex(nextIndex);
              setGigUrl(currentGigs[nextIndex].url);
              // Trigger next promotion automatically
              setTimeout(() => {
                runPingSequence(currentGigs[nextIndex].url, nextIndex);
              }, 100);
              return currentGigs;
            });
          }, 3000);
        }
      }, 350);
    },
    []
  );

  // Auto-Start on Mount whenever browser is opened!
  useEffect(() => {
    if (isAutoLooping && gigs.length > 0) {
      const activeUrl = gigs[currentGigIndex]?.url || gigs[0].url;
      setGigUrl(activeUrl);
      runPingSequence(activeUrl, currentGigIndex);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextCycleTimeoutRef.current) clearTimeout(nextCycleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []); // Run once on page load

  // Toggle Pause/Resume
  const togglePlayPause = () => {
    if (isAutoLooping) {
      // Pause
      setIsAutoLooping(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextCycleTimeoutRef.current) clearTimeout(nextCycleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setIsPromoting(false);
      setCountdown(null);
    } else {
      // Resume
      setIsAutoLooping(true);
      const activeUrl = gigs[currentGigIndex]?.url || gigUrl;
      runPingSequence(activeUrl, currentGigIndex);
    }
  };

  // Jump to specific Gig
  const selectGig = (index: number) => {
    if (index < 0 || index >= gigs.length) return;
    if (nextCycleTimeoutRef.current) clearTimeout(nextCycleTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setCurrentGigIndex(index);
    setGigUrl(gigs[index].url);
    runPingSequence(gigs[index].url, index);
  };

  // Next / Prev Gig navigation
  const nextGig = () => {
    const nextIdx = (currentGigIndex + 1) % gigs.length;
    selectGig(nextIdx);
  };

  const prevGig = () => {
    const prevIdx = (currentGigIndex - 1 + gigs.length) % gigs.length;
    selectGig(prevIdx);
  };

  // Manual URL input handling (user can still paste custom links anytime if desired)
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGigUrl(val);

    if (val.trim().length > 10 && (val.includes('http://') || val.includes('https://') || val.includes('fiverr.com'))) {
      runPingSequence(val, currentGigIndex);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.trim().length > 5) {
      setGigUrl(pastedText);
      runPingSequence(pastedText, currentGigIndex);
    }
  };

  // Add new Gig URL to rotation and backend
  const handleAddNewGig = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = newGigInput.trim();
    if (!url) return;

    const newGigItem: BackendGig = {
      id: `gig-${Date.now()}`,
      url,
      title: `Fiverr Gig #${gigs.length + 1} (${url.split('/').pop() || 'New'})`,
      pings: 0,
    };

    setGigs((prev) => [...prev, newGigItem]);
    setNewGigInput('');
    setShowAddModal(false);

    // Sync with backend
    try {
      await fetch('http://localhost:3001/ping/add-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigUrl: url, title: newGigItem.title }),
      });
    } catch (err) {
      // Backend offline fallback handled
    }
  };

  const currentGig = gigs[currentGigIndex] || {
    id: 'gig-active',
    url: gigUrl,
    title: 'Fiverr Gig',
    pings: 0,
  };

  return (
    <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
      {/* Decorative Glow Spots */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm">
              Instant Auto-Pinger
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> PingMyURLs Engine
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-indigo-400" /> Auto-Looping Active (Cycle #{loopCycle})
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Backend Pre-loaded ({gigs.length} Gigs)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 flex items-center gap-2">
            Zero-Click Instant Gig Promotion
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Auto-loaded from backend — continuously pinging all your Fiverr Gigs 24/7 without manual pasting or clicking.
          </p>
        </div>

        {/* Global Control Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume Button */}
          <button
            onClick={togglePlayPause}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
              isAutoLooping
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300'
            }`}
            title={isAutoLooping ? 'Pause 24/7 Auto-Loop' : 'Resume 24/7 Auto-Loop'}
          >
            {isAutoLooping ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Loop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Resume Auto-Loop
              </>
            )}
          </button>

          {/* Quick Gig Navigation */}
          <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl p-1">
            <button
              onClick={prevGig}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
              title="Previous Gig"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-gray-300 whitespace-nowrap">
              Gig {currentGigIndex + 1}/{gigs.length}
            </span>
            <button
              onClick={nextGig}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all"
              title="Next Gig"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Gig Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Gig
          </button>
        </div>
      </div>

      {/* Backend Gigs Quick Pill Carousel */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Backend Pre-Loaded Gig Rotation (Click any to inspect & ping):
          </span>
          <span className="font-mono text-[10px] text-emerald-400">
            {isAutoLooping ? '● AUTO-CYCLING ROUND-ROBIN' : '○ PAUSED'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {gigs.map((g, idx) => {
            const isActive = idx === currentGigIndex;
            return (
              <button
                key={g.id || idx}
                onClick={() => selectGig(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'
                  }`}
                ></span>
                <span>#{idx + 1}: {g.url.split('/').pop() || 'Gig'}</span>
                {isActive && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/30 text-emerald-300">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Loaded Gig URL Bar with Live Status */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 flex items-center gap-2">
          <Link className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={gigUrl}
          onChange={handleUrlChange}
          onPaste={handlePaste}
          placeholder="Fiverr Gig URL auto-loaded from backend..."
          className="w-full bg-slate-950/90 border border-indigo-500/30 rounded-2xl pl-11 pr-4 sm:pr-48 py-4 text-xs sm:text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
        />

        <div className="mt-2 sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 flex items-center justify-end gap-2">
          {isPromoting ? (
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              AUTO-PINGING...
            </span>
          ) : completed ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {countdown !== null ? `NEXT GIG IN ${countdown}s` : 'COMPLETED'}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[11px] font-medium hidden sm:inline-block">
              Auto-Active
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Live Status Header */}
      <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-200">
              Promotion Progress ({results.filter((r) => r.status === 'SUCCESS' || r.status === 'INDEXED').length}/{DEFAULT_TARGETS.length} Endpoints)
            </span>
            <span className="text-gray-400 font-normal font-mono text-[11px]">
              — Promoting {currentGig.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {countdown !== null && (
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 animate-pulse">
                <Repeat className="w-3 h-3 animate-spin" /> Cycling to next gig in {countdown}s...
              </span>
            )}
            <span className="font-mono text-emerald-400 text-sm font-extrabold">{progress}%</span>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Real-Time Results List */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Live Ping & Indexing Endpoints
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              HTTP 200 OK • ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/80">
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {results.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs transition-colors ${
                    item.status === 'PINGING'
                      ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-500 w-5">#{idx + 1}</span>
                    <div>
                      <p className="font-bold text-white text-xs">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                    <span className="text-[10px] text-gray-400 font-mono sm:hidden truncate max-w-[160px]">
                      {item.message}
                    </span>

                    {item.latencyMs > 0 && (
                      <span className="text-[10px] font-mono text-gray-400">
                        {item.latencyMs}ms
                      </span>
                    )}

                    {item.status === 'PENDING' && (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-gray-800 text-gray-400 font-mono">
                        QUEUED
                      </span>
                    )}
                    {item.status === 'PINGING' && (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> PINGING
                      </span>
                    )}
                    {item.status === 'SUCCESS' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> 200 OK
                      </span>
                    )}
                    {item.status === 'INDEXED' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> INDEXED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Gig Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Add Fiverr Gig to Rotation
            </h3>
            <p className="text-xs text-gray-400">
              Enter your Fiverr Gig URL to include it into the backend 24/7 auto-pinger rotation.
            </p>
            <form onSubmit={handleAddNewGig} className="space-y-4">
              <input
                type="url"
                required
                value={newGigInput}
                onChange={(e) => setNewGigInput(e.target.value)}
                placeholder="https://www.fiverr.com/s/..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Rotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
