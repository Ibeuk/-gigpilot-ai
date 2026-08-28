import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';
import { ContinuousPingerService } from './continuous-pinger.service';

describe('PingController', () => {
  let controller: PingController;
  let pingService: PingService;
  let continuousPinger: ContinuousPingerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [
        {
          provide: PingService,
          useValue: {
            getTargets: jest.fn().mockReturnValue([{ id: 'test-ping', name: 'Test Pinger' }]),
            executeAutoPing: jest.fn().mockResolvedValue({ jobStarted: true, results: [] }),
          },
        },
        {
          provide: ContinuousPingerService,
          useValue: {
            getContinuousStatus: jest.fn().mockReturnValue({ isRunning: true, gigs: [] }),
            addGigUrl: jest.fn().mockReturnValue({ id: 'gig-new', url: 'http://test.url' }),
          },
        },
      ],
    }).compile();

    controller = module.get<PingController>(PingController);
    pingService = module.get<PingService>(PingService);
    continuousPinger = module.get<ContinuousPingerService>(ContinuousPingerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return targets', () => {
    const res = controller.getTargets();
    expect(res.targets).toHaveLength(1);
    expect(pingService.getTargets).toHaveBeenCalled();
  });

  it('should return continuous status', () => {
    const res = controller.getContinuousStatus();
    expect(res.isRunning).toBe(true);
    expect(continuousPinger.getContinuousStatus).toHaveBeenCalled();
  });

  it('should add gig url', () => {
    const res = controller.addGig({ gigUrl: 'https://www.fiverr.com/s/YR3VYqp', title: 'Test Gig' });
    expect(res.id).toBe('gig-new');
    expect(continuousPinger.addGigUrl).toHaveBeenCalledWith('https://www.fiverr.com/s/YR3VYqp', 'Test Gig');
  });

  it('should throw BadRequestException on invalid gig url for addGig', () => {
    expect(() => controller.addGig({ gigUrl: '' })).toThrow(BadRequestException);
  });

  it('should auto-start pinging', async () => {
    const res = await controller.autoStartPing({ gigUrl: 'https://www.fiverr.com/s/YR3VYqp' });
    expect(res.jobStarted).toBe(true);
    expect(pingService.executeAutoPing).toHaveBeenCalledWith('https://www.fiverr.com/s/YR3VYqp');
  });

  it('should throw BadRequestException on invalid gig url for autoStartPing', async () => {
    await expect(controller.autoStartPing({ gigUrl: '' })).rejects.toThrow(BadRequestException);
  });
});
