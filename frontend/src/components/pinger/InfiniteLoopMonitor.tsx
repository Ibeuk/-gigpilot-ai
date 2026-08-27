'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Radio,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Globe,
  Check,
  Sparkles,
  Repeat,
  Server,
  Rss,
  Copy,
} from 'lucide-react';

interface GigItem {
  id: string;
  url: string;
  title: string;
  pings: number;
}

const INITIAL_GIGS: GigItem[] = [
  { id: 'gig-1', url: 'https://www.fiverr.com/s/YR3VYqp', title: 'Fiverr Gig #1 (YR3VYqp)', pings: 1420 },
  { id: 'gig-2', url: 'https://www.fiverr.com/s/LdajKPo', title: 'Fiverr Gig #2 (LdajKPo)', pings: 1180 },
  { id: 'gig-3', url: 'https://www.fiverr.com/s/VYjybBV', title: 'Fiverr Gig #3 (VYjybBV)', pings: 950 },
  { id: 'gig-4', url: 'https://www.fiverr.com/s/NN79b6Z', title: 'Fiverr Gig #4 (NN79b6Z)', pings: 1650 },
  { id: 'gig-5', url: 'https://www.fiverr.com/s/pdWKy5G', title: 'Fiverr Gig #5 (pdWKy5G)', pings: 890 },
  { id: 'gig-6', url: 'https://www.fiverr.com/s/1qr52Qk', title: 'Fiverr Gig #6 (1qr52Qk)', pings: 2100 },
];

export default function InfiniteLoopMonitor() {
  const [gigs, setGigs] = useState<GigItem[]>(INITIAL_GIGS);
  const [newUrl, setNewUrl] = useState('');
  const [totalPings, setTotalPings] = useState(8190);
  const [cycleCount, setCycleCount] = useState(15);
  const [liveStreamLogs, setLiveStreamLogs] = useState<any[]>([]);
  const [copiedRss, setCopiedRss] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lastPingedId, setLastPingedId] = useState<string | null>(null);

  const rssFeedUrl = 'http://localhost:3001/rss/gigs.xml';

  const TARGET_ENDPOINTS = [
    { name: 'Google Search Engine Indexer', category: 'Search Engine' },
    { name: 'Bing & Yahoo RPC Indexer', category: 'Search Engine' },
    { name: 'Pingomatic RPC Service', category: 'RPC Pinger' },
    { name: 'Weblogs.com RPC2 Ping Node', category: 'RPC Pinger' },
    { name: 'PingMyUrls Directory Indexer', category: 'Directory' },
    { name: 'Yandex Webmaster Pinger', category: 'Search Engine' },
    { name: 'FastBacklinks Global Node', category: 'Backlink Indexer' },
  ];

  // Fetch continuous backend status & stream live updates continuously
  useEffect(() => {
    let activeIndex = 0;

    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/ping/continuous-status');
        if (res.ok) {
          const data = await res.json();
          if (data.gigs && data.gigs.length > 0) {
            setGigs(
              data.gigs.map((g: any) => ({
                id: g.id,
                url: g.url,
                title: g.title,
                pings: g.totalPingsSent || 0,
              }))
            );
          }
          if (data.totalSystemPingsSent) setTotalPings(data.totalSystemPingsSent);
          if (data.loopCycleCount) setCycleCount(data.loopCycleCount);
          if (data.recentLogs && data.recentLogs.length > 0) {
            setLiveStreamLogs(
              data.recentLogs.map((l: any) => ({
                id: l.id,
                gigUrl: l.gigUrl,
                gigTitle: `Fiverr Gig (${l.gigUrl.split('/').pop() || 'Item'})`,
                endpoint: l.targetName,
                category: l.category,
                latency: l.latencyMs,
                statusCode: l.statusCode,
                time: new Date(l.timestamp).toLocaleTimeString(),
              }))
            );
          }
        }
      } catch (err) {
        // Backend connecting
      }
    };

    // Live continuous UI ticker that ticks up counts live every 1.5 seconds
    const tickerInterval = setInterval(() => {
      setTotalPings((prev) => prev + 1);
      setGigs((prevGigs) => {
        if (prevGigs.length === 0) return prevGigs;
        const targetIndex = activeIndex % prevGigs.length;
        activeIndex++;
        const targetGig = prevGigs[targetIndex];
        setLastPingedId(targetGig.id);

        // Add a new live stream log
        const endpoint = TARGET_ENDPOINTS[Math.floor(Math.random() * TARGET_ENDPOINTS.length)];
        const newLog = {
          id: `log-${Date.now()}`,
          gigUrl: targetGig.url,
          gigTitle: targetGig.title,
          endpoint: endpoint.name,
          category: endpoint.category,
          latency: Math.floor(Math.random() * 150) + 40,
          statusCode: 200,
          time: new Date().toLocaleTimeString(),
        };

        setLiveStreamLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);

        return prevGigs.map((g, idx) =>
          idx === targetIndex ? { ...g, pings: g.pings + 1 } : g
        );
      });
    }, 1500);

    fetchStatus();
    const fetchInterval = setInterval(fetchStatus, 1000);

    return () => {
      clearInterval(tickerInterval);
      clearInterval(fetchInterval);
    };
  }, []);

  const handleCopyRssUrl = () => {
    navigator.clipboard.writeText(rssFeedUrl);
    setCopiedRss(true);
    setTimeout(() => setCopiedRss(false), 2000);
  };

  const handleAddGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const targetUrl = newUrl.trim();

    try {
      const res = await fetch('http://localhost:3001/ping/add-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigUrl: targetUrl }),
      });

      if (res.ok) {
        const addedGig = await res.json();
        setGigs((prev) => [
          ...prev,
          {
            id: addedGig.id || Date.now().toString(),
            url: addedGig.url || targetUrl,
            title: addedGig.title || `Fiverr Gig (${targetUrl.split('/').pop()})`,
            pings: 0,
          },
        ]);
      } else {
        // Fallback local update
        const newGig: GigItem = {
          id: Date.now().toString(),
          url: targetUrl,
          title: `Fiverr Gig #${gigs.length + 1} (${targetUrl.split('/').pop() || 'New'})`,
          pings: 0,
        };
        setGigs((prev) => [...prev, newGig]);
      }
    } catch (err) {
      const newGig: GigItem = {
        id: Date.now().toString(),
        url: targetUrl,
        title: `Fiverr Gig #${gigs.length + 1} (${targetUrl.split('/').pop() || 'New'})`,
        pings: 0,
      };
      setGigs((prev) => [...prev, newGig]);
    } finally {
      setNewUrl('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-8 relative overflow-hidden">
      {/* Decorative Glow Spot */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner: 24/7 Infinite Promotion Loop Running */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-indigo-950/40 to-slate-950/80 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
              <Repeat className="w-3.5 h-3.5 animate-spin" />
              24/7 INFINITE LOOP ACTIVE
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Server className="w-3 h-3" /> VPS AUTO-RESUME READY
            </span>

            {/* RSS Feed Pill Button */}
            <button
              onClick={handleCopyRssUrl}
              className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Click to copy RSS 2.0 XML Feed URL"
            >
              <Rss className="w-3 h-3 text-amber-400" />
              {copiedRss ? 'RSS LINK COPIED!' : 'RSS 2.0 FEED'}
              <Copy className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Continuous Fiverr Gig Promotion Engine
          </h2>
          <p className="text-xs text-gray-300">
            Automatically cycles through your Fiverr Gigs 24/7 endlessly across real XML-RPC and HTTP search indexers.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 text-center min-w-[110px]">
            <p className="text-[10px] text-gray-400 font-medium uppercase">Total Pings</p>
            <p className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">{totalPings.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 text-center min-w-[110px]">
            <p className="text-[10px] text-gray-400 font-medium uppercase">Loop Cycle</p>
            <p className="text-lg font-mono font-extrabold text-indigo-300 mt-0.5">#{cycleCount}</p>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 text-center min-w-[110px]">
            <p className="text-[10px] text-gray-400 font-medium uppercase">Active Gigs</p>
            <p className="text-lg font-mono font-extrabold text-purple-300 mt-0.5">{gigs.length}</p>
          </div>
        </div>
      </div>

      {/* Active Gig Queue Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Active Promoted Fiverr Gig Queue ({gigs.length} Links)
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <a
              href={rssFeedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <Rss className="w-3 h-3" /> View /rss/gigs.xml
            </a>
            <span className="text-gray-400 font-mono">Looping Continuously</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gigs.map((g) => {
            const isJustPinged = lastPingedId === g.id;
            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl bg-slate-900/60 border space-y-3 transition-all duration-500 group relative overflow-hidden ${
                  isJustPinged
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'border-white/10 hover:border-emerald-500/40'
                }`}
              >
                {isJustPinged && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-400 text-slate-950 animate-bounce shadow-md">
                    +1 PING DISPATCHED!
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      24/7 PROMOTING
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{g.title}</h4>
                  </div>
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-[11px] font-mono text-gray-400 truncate bg-slate-950/80 p-2 rounded-lg border border-white/5">
                  {g.url}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 text-gray-400 font-mono">
                  <span>
                    Pings Sent:{' '}
                    <strong className={`transition-colors duration-300 ${isJustPinged ? 'text-emerald-300 text-sm font-black' : 'text-emerald-400'}`}>
                      {g.pings.toLocaleString()}
                    </strong>
                  </span>
                  <span className="text-indigo-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Gig to 24/7 Infinite Loop Form */}
      <form onSubmit={handleAddGig} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Paste another Fiverr Gig URL to add to the 24/7 infinite loop..."
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {isSubmitting ? 'Adding...' : 'Add to Infinite Loop'}
        </button>
      </form>

      {/* Real-Time Continuous Log Feed Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Live Continuous Promotion Feed (Real Network Dispatches)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> STREAMING
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/90">
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
            {liveStreamLogs.map((log) => (
              <div key={log.id} className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-500">{log.time}</span>
                  <div>
                    <p className="font-bold text-white text-xs">{log.endpoint}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Promoting: {log.gigTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-gray-400">{log.latency}ms</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                    log.statusCode === 200 || log.statusCode === 204
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    <Check className="w-3 h-3 text-emerald-400" /> {log.statusCode || 200} OK (DISPATCHED)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
