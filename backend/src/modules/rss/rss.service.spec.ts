import { Test, TestingModule } from '@nestjs/testing';
import { RssService } from './rss.service';
import { ContinuousPingerService } from '../ping/continuous-pinger.service';

describe('RssService', () => {
  let service: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RssService,
        {
          provide: ContinuousPingerService,
          useValue: {
            getContinuousStatus: jest.fn().mockReturnValue({
              gigs: [
                {
                  id: 'gig-1',
                  url: 'https://www.fiverr.com/s/YR3VYqp',
                  title: 'Fiverr Gig #1 & Special <Test>',
                  addedAt: new Date().toISOString(),
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RssService>(RssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate valid RSS 2.0 XML string', () => {
    const xml = service.generateGigsRssFeed('https://gigpilot.ai');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>GigPilot AI — Active Fiverr Gigs Index Feed</title>');
    expect(xml).toContain('<link>https://www.fiverr.com/s/YR3VYqp</link>');
    expect(xml).toContain('&amp; Special &lt;Test&gt;');
  });
});
