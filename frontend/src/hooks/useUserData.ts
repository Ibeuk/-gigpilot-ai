'use client';

import { useState, useEffect } from 'react';

export interface Gig {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  fiverrUrl: string;
  keywords: string[];
  campaignsCount: number;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED';
  rating: number;
  reviews: number;
  createdAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  gigTitle: string;
  type: string;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'COMPLETED';
  reach: string;
  clicks: number;
  conversions: number;
  budget: string;
  startDate: string;
}

export interface PingGig {
  id: string;
  gigUrl: string;
  title: string;
  status: 'Active' | 'Paused' | 'Error';
  pingsCount: number;
  successRate: number;
  lastPingAt: string;
}

export interface UserSettings {
  sellerName: string;
  email: string;
  niche: string;
  fiverrProfileUrl: string;
  autoPingEnabled: boolean;
  pingIntervalMinutes: number;
  telegramNotifications: boolean;
  aiAgentAutoPromote: boolean;
}

export interface UserWorkspace {
  gigs: Gig[];
  campaigns: Campaign[];
  pingGigs: PingGig[];
  settings: UserSettings;
}

const DEFAULT_GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Full Stack Web Development with Next.js & Node.js',
    category: 'Programming & Tech',
    subcategory: 'Web Development',
    fiverrUrl: 'https://fiverr.com/sample-gig-1',
    keywords: ['Next.js', 'React', 'Node.js', 'Web App', 'TypeScript'],
    campaignsCount: 2,
    status: 'ACTIVE',
    rating: 4.9,
    reviews: 28,
  },
  {
    id: 'gig-2',
    title: 'Autonomous AI Agent System & Python Automation',
    category: 'AI Services',
    subcategory: 'AI Agents & Automation',
    fiverrUrl: 'https://fiverr.com/sample-gig-2',
    keywords: ['AI Agent', 'Python', 'LangChain', 'OpenAI', 'Automation'],
    campaignsCount: 1,
    status: 'ACTIVE',
    rating: 5.0,
    reviews: 14,
  },
];

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Next.js Promo Blast',
    gigTitle: 'Full Stack Web Development with Next.js & Node.js',
    type: 'SOCIAL_MEDIA',
    status: 'ACTIVE',
    reach: '12.4K',
    clicks: 480,
    conversions: 32,
    budget: '$150',
    startDate: '2026-08-01',
  },
];

const DEFAULT_PING_GIGS: PingGig[] = [
  {
    id: 'ping-1',
    gigUrl: 'https://www.fiverr.com/s/sample-gig',
    title: 'Full Stack Web Development with Next.js & Node.js',
    status: 'Active',
    pingsCount: 1420,
    successRate: 99.8,
    lastPingAt: 'Just now',
  },
];

export function useUserData(userId: string | undefined | null) {
  const [data, setData] = useState<UserWorkspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const storageKey = userId ? `gigpilot_userdata_${userId}` : null;

  // Load user data when userId changes
  useEffect(() => {
    if (!userId || !storageKey) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        // Initial state for brand new user
        const initial: UserWorkspace = {
          gigs: [...DEFAULT_GIGS],
          campaigns: [...DEFAULT_CAMPAIGNS],
          pingGigs: [...DEFAULT_PING_GIGS],
          settings: {
            sellerName: '',
            email: '',
            niche: 'Web Development & AI',
            fiverrProfileUrl: '',
            autoPingEnabled: true,
            pingIntervalMinutes: 15,
            telegramNotifications: true,
            aiAgentAutoPromote: true,
          },
        };
        localStorage.setItem(storageKey, JSON.stringify(initial));
        setData(initial);
      }
    } catch (err) {
      console.error('Error loading user workspace data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, storageKey]);

  // Helper to persist updated workspace state for THIS user only
  const updateWorkspace = (updater: (prev: UserWorkspace) => UserWorkspace) => {
    if (!storageKey || !data) return;
    const next = updater(data);
    setData(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to save user workspace:', err);
    }
  };

  const addGig = (newGig: Omit<Gig, 'id' | 'campaignsCount' | 'rating' | 'reviews'>) => {
    updateWorkspace((prev) => {
      const created: Gig = {
        ...newGig,
        id: 'gig_' + Date.now(),
        campaignsCount: 0,
        rating: 5.0,
        reviews: 0,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, gigs: [created, ...prev.gigs] };
    });
  };

  const deleteGig = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      gigs: prev.gigs.filter((g) => g.id !== id),
    }));
  };

  const addCampaign = (newCamp: Omit<Campaign, 'id' | 'reach' | 'clicks' | 'conversions' | 'startDate'>) => {
    updateWorkspace((prev) => {
      const created: Campaign = {
        ...newCamp,
        id: 'camp_' + Date.now(),
        reach: '0',
        clicks: 0,
        conversions: 0,
        startDate: new Date().toISOString().split('T')[0],
      };
      return { ...prev, campaigns: [created, ...prev.campaigns] };
    });
  };

  const addPingGig = (gigUrl: string, title: string) => {
    updateWorkspace((prev) => {
      const created: PingGig = {
        id: 'ping_' + Date.now(),
        gigUrl,
        title: title || 'Fiverr Gig Pinger Target',
        status: 'Active',
        pingsCount: 1,
        successRate: 100,
        lastPingAt: 'Just now',
      };
      return { ...prev, pingGigs: [created, ...prev.pingGigs] };
    });
  };

  const deletePingGig = (id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      pingGigs: prev.pingGigs.filter((p) => p.id !== id),
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    updateWorkspace((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  return {
    gigs: data?.gigs || [],
    campaigns: data?.campaigns || [],
    pingGigs: data?.pingGigs || [],
    settings: data?.settings || null,
    loading,
    addGig,
    deleteGig,
    addCampaign,
    addPingGig,
    deletePingGig,
    updateSettings,
  };
}
