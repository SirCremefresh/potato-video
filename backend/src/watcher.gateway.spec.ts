import { Test, TestingModule } from '@nestjs/testing';
import { WatcherGateway } from './watcher.gateway';

describe('WatcherGateway', () => {
  let gateway: WatcherGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatcherGateway],
    }).compile();

    gateway = module.get<WatcherGateway>(WatcherGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
