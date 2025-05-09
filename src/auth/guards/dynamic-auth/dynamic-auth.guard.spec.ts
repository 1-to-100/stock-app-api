import { DynamicAuthGuard } from './dynamic-auth.guard';

describe('DynamicAuthGuard', () => {
  it('should be defined', () => {
    expect(new DynamicAuthGuard()).toBeDefined();
  });
});
