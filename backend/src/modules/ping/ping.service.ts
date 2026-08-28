import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { dispatchPing } from './xml-rpc-pinger.util';

export interface PingTarget {
  id: string;
  name: string;
  category: 'Search Engine' | 'RPC Pinger' | 'Directory' | 'Social Bookmark' | 'Backlink Indexer';
  urlPattern: string;
}

export interface PingResult {
  targetId: string;
  name: string;
  category: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  statusCode: number;
  latencyMs: number;
  message: string;
  timestamp: string;
}

@Injectable()
export class PingService {
  private readonly logger = new Logger(PingService.name);

  private readonly pingTargets: PingTarget[] = [
    { id: 'google-ping', name: 'Google Search Engine Indexer', category: 'Search Engine', urlPattern: 'http://www.google.com/webmasters/tools/ping?sitemap={url}' },
    { id: 'bing-ping', name: 'Bing & Yahoo Search Indexer', category: 'Search Engine', urlPattern: 'http://www.bing.com/ping?sitemap={url}' },
    { id: 'pingomatic', name: 'Pingomatic RPC Service', category: 'RPC Pinger', urlPattern: 'http://rpc.pingomatic.com/' },
    { id: 'weblogs', name: 'Weblogs.com RPC2 Ping Node', category: 'RPC Pinger', urlPattern: 'http://rpc.weblogs.com/RPC2' },
    { id: 'yandex-ping', name: 'Yandex Webmaster Indexer', category: 'Search Engine', urlPattern: 'https://blogs.yandex.ru/pings/?status=success&url={url}' },
    { id: 'feedburner', name: 'Google FeedBurner Indexer', category: 'RPC Pinger', urlPattern: 'http://feedburner.google.com/fb/a/ping' },
    { id: 'backlink-node-1', name: 'FastBacklinks Global Pinger', category: 'Backlink Indexer', urlPattern: 'https://api.fastbacklinks.org/ping?url={url}' },
    { id: 'backlink-node-2', name: 'IndexingEngine Pro Node', category: 'Backlink Indexer', urlPattern: 'https://index.enginepro.io/submit?url={url}' },
    { id: 'social-bookmark-1', name: 'SocialPing Aggregator', category: 'Social Bookmark', urlPattern: 'https://socialping.net/auto?url={url}' },
    { id: 'social-bookmark-2', name: 'PromoBlast Directory', category: 'Directory', urlPattern: 'https://promoblast.com/directory/ping?url={url}' },
    { id: 'twingly-rpc', name: 'Twingly Global RPC Node', category: 'RPC Pinger', urlPattern: 'http://rpc.twingly.com/' },
    { id: 'blogdigger-rpc', name: 'Blogdigger RPC2 Node', category: 'RPC Pinger', urlPattern: 'http://www.blogdigger.com/RPC2' },
    { id: 'indexking', name: 'IndexKing Global Submitter', category: 'Directory', urlPattern: 'https://www.indexking.com/add?url={url}' },
    { id: 'baidu-ping', name: 'Baidu Search Webmaster Node', category: 'Search Engine', urlPattern: 'http://ping.baidu.com/ping/RPC2' },
    { id: 'superfeedr', name: 'Superfeedr Real-Time Hub', category: 'RPC Pinger', urlPattern: 'https://superfeedr.com/ping?url={url}' },
    { id: 'masspinger', name: 'MassPinger Directory Submitter', category: 'Directory', urlPattern: 'https://masspinger.com/submit?url={url}' },
    { id: 'backlink-submitter', name: 'BacklinkSubmitter Engine Node', category: 'Backlink Indexer', urlPattern: 'https://backlinksubmitter.net/ping?url={url}' },
    { id: 'mypagehub', name: 'MyPageHub Global Indexer', category: 'Directory', urlPattern: 'https://mypagehub.com/ping?url={url}' },
    { id: 'rapidindexer', name: 'RapidIndexer Pro Endpoint', category: 'Backlink Indexer', urlPattern: 'https://rapidindexer.org/ping?url={url}' },
    { id: 'feedly', name: 'Feedly Content Aggregator', category: 'Social Bookmark', urlPattern: 'https://feedly.com/fetch?url={url}' },
  ];

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Get all registered ping targets
   */
  getTargets(): PingTarget[] {
    return this.pingTargets;
  }

  /**
   * Execute auto-promotion pinging across all target endpoints in parallel
   */
  async executeAutoPing(gigUrl: string): Promise<{ jobStarted: boolean; targetCount: number; results: PingResult[] }> {
    this.logger.log(`🚀 Starting instant auto-promotion real pinging for Gig URL: ${gigUrl}`);

    // Emit event for real-time subscribers
    this.eventEmitter.emit('ping.started', {
      gigUrl,
      targetCount: this.pingTargets.length,
      startedAt: new Date().toISOString(),
    });

    const pingPromises = this.pingTargets.map(async (target) => {
      const outcome = await dispatchPing(target.urlPattern, target.category, gigUrl, 'Fiverr Gig Instant Promotion', 5000);
      
      const result: PingResult = {
        targetId: target.id,
        name: target.name,
        category: target.category,
        status: outcome.success ? 'SUCCESS' : 'FAILED',
        statusCode: outcome.statusCode,
        latencyMs: outcome.latencyMs,
        message: outcome.message,
        timestamp: new Date().toISOString(),
      };

      this.eventEmitter.emit('ping.result', { gigUrl, result });
      return result;
    });

    const results = await Promise.all(pingPromises);

    return {
      jobStarted: true,
      targetCount: this.pingTargets.length,
      results,
    };
  }
}

