/**
 * Retry Helper Tests
 */

import { retry, RetryOptions } from '../utils/RetryHelper';

describe('RetryHelper', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockResolvedValueOnce('success');

      const promise = retry(fn, { maxRetries: 3, initialDelay: 1000 });

      // Fast-forward time
      jest.advanceTimersByTime(1000);
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry up to maxRetries times', async () => {
      jest.useRealTimers();
      
      let callCount = 0;
      const fn = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('NetworkError'));
      });

      await expect(
        retry(fn, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow('NetworkError');
      
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(callCount).toBe(3);
      
      jest.useFakeTimers();
    });

    it('should use exponential backoff', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockResolvedValueOnce('success');

      const promise = retry(fn, {
        maxRetries: 3,
        initialDelay: 1000,
        backoffFactor: 2,
      });

      // First retry after 1s
      jest.advanceTimersByTime(1000);
      await jest.runAllTimersAsync();
      // Second retry after 2s (1s * 2)
      jest.advanceTimersByTime(2000);
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('ValidationError'));

      const promise = retry(fn, {
        maxRetries: 3,
        retryableErrors: ['NetworkError'],
      });

      await expect(promise).rejects.toThrow('ValidationError');
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should respect maxDelay', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockResolvedValueOnce('success');

      const promise = retry(fn, {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 2000,
        backoffFactor: 10, // Would be 10s without maxDelay
      });

      // Should only wait maxDelay (2s) not 10s
      jest.advanceTimersByTime(2000);
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});

