import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PingService } from './ping.service';
import * as pingerUtil from './xml-rpc-pinger.util';

describe('PingService', () => {
  let service: PingService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PingService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PingService>(PingService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTargets', () => {
    it('should return list of ping targets', () => {
      const targets = service.getTargets();
      expect(targets.length).toBeGreaterThanOrEqual(20);
      expect(targets[0].id).toBe('google-ping');
    });
  });

  describe('executeAutoPing', () => {
    it('should execute ping to all targets and emit events', async () => {
      const mockDispatchResult = {
        statusCode: 200,
        latencyMs: 120,
        success: true,
        message: 'Successfully pinged target (OK)',
      };
      jest.spyOn(pingerUtil, 'dispatchPing').mockResolvedValue(mockDispatchResult);

      const res = await service.executeAutoPing('https://www.fiverr.com/s/YR3VYqp');

      expect(res.jobStarted).toBe(true);
      expect(res.targetCount).toBe(20);
      expect(res.results).toHaveLength(20);
      expect(eventEmitter.emit).toHaveBeenCalledWith('ping.started', expect.any(Object));
      expect(eventEmitter.emit).toHaveBeenCalledWith('ping.result', expect.any(Object));
    });
  });
});
