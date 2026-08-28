import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContinuousPingerService } from './continuous-pinger.service';

describe('ContinuousPingerService', () => {
  let service: ContinuousPingerService;

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContinuousPingerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContinuousPingerService>(ContinuousPingerService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize and report continuous status', () => {
    const status = service.getContinuousStatus();
    expect(status.gigs).toHaveLength(6);
    expect(status.totalSystemPingsSent).toBeGreaterThan(0);
  });

  it('should add a new Fiverr Gig URL to the loop', () => {
    const newGigUrl = 'https://www.fiverr.com/s/newTestGig123';
    const gig = service.addGigUrl(newGigUrl, 'New Test Gig');

    expect(gig.url).toBe(newGigUrl);
    expect(gig.title).toBe('New Test Gig');

    const status = service.getContinuousStatus();
    expect(status.gigs).toHaveLength(7);
  });

  it('should return existing gig if added again', () => {
    const existingUrl = 'https://www.fiverr.com/s/YR3VYqp';
    const gig = service.addGigUrl(existingUrl);

    expect(gig.id).toBe('gig-1');
    const status = service.getContinuousStatus();
    expect(status.gigs).toHaveLength(6);
  });
});
