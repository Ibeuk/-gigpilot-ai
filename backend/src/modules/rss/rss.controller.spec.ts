import { Test, TestingModule } from '@nestjs/testing';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';

describe('RssController', () => {
  let controller: RssController;
  let rssService: RssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RssController],
      providers: [
        {
          provide: RssService,
          useValue: {
            generateGigsRssFeed: jest.fn().mockReturnValue('<?xml version="1.0"?><rss></rss>'),
          },
        },
      ],
    }).compile();

    controller = module.get<RssController>(RssController);
    rssService = module.get<RssService>(RssService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return RSS XML feed', () => {
    const req: any = {
      protocol: 'https',
      get: jest.fn().mockReturnValue('gigpilot.ai'),
    };

    const xml = controller.getGigsRssFeed(req);
    expect(xml).toBe('<?xml version="1.0"?><rss></rss>');
    expect(rssService.generateGigsRssFeed).toHaveBeenCalledWith('https://gigpilot.ai');
  });
});
