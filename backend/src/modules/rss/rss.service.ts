import { Injectable } from '@nestjs/common';
import { ContinuousPingerService, PromotedGig } from '../ping/continuous-pinger.service';

@Injectable()
export class RssService {
  constructor(private readonly continuousPinger: ContinuousPingerService) {}

  /**
   * Generate valid RSS 2.0 XML string containing active Fiverr Gigs
   */
  generateGigsRssFeed(baseUrl: string = 'https://gigpilot.ai'): string {
    const status = this.continuousPinger.getContinuousStatus();
    const gigs: PromotedGig[] = status.gigs || [];
    const buildDate = new Date().toUTCString();

    const itemsXml = gigs
      .map((gig) => {
        const itemPubDate = new Date(gig.addedAt || Date.now()).toUTCString();
        return `    <item>
      <title>${this.escapeXml(gig.title)}</title>
      <link>${this.escapeXml(gig.url)}</link>
      <guid isPermaLink="true">${this.escapeXml(gig.url)}</guid>
      <description><![CDATA[Top-rated professional Fiverr service: ${this.escapeXml(gig.title)}. Accelerated 24/7 indexing and auto-promotion active.]]></description>
      <pubDate>${itemPubDate}</pubDate>
      <category>Fiverr Gig Services</category>
    </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GigPilot AI — Active Fiverr Gigs Index Feed</title>
    <link>${baseUrl}</link>
    <description>Dynamic RSS feed for automated indexing and search engine promotion of active Fiverr Gigs.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss/gigs.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
