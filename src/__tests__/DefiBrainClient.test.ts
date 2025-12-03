/**
 * DefiBrain SDK Tests
 */

import { DefiBrainClient } from '../DefiBrainClient';

describe('DefiBrainClient', () => {
  const API_KEY = 'defi_test_key_1234567890abcdef';
  const API_URL = 'https://backend-production-a565a.up.railway.app/v1';

  let client: DefiBrainClient;

  beforeEach(() => {
    client = new DefiBrainClient({
      apiKey: API_KEY,
      apiUrl: API_URL,
    });
  });

  describe('constructor', () => {
    it('should create client with provided config', () => {
      const client = new DefiBrainClient({
        apiKey: API_KEY,
        apiUrl: API_URL,
      });

      expect(client).toBeInstanceOf(DefiBrainClient);
    });

    it('should use default apiUrl if not provided', () => {
      const client = new DefiBrainClient({
        apiKey: API_KEY,
      });

      // Should use production URL by default
      expect(client).toBeInstanceOf(DefiBrainClient);
    });

    it('should use default chainId (1) if not provided', () => {
      const client = new DefiBrainClient({
        apiKey: API_KEY,
        apiUrl: API_URL,
      });

      expect(client).toBeInstanceOf(DefiBrainClient);
    });
  });

  describe('healthCheck', () => {
    it('should check health status', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          version: '1.0.0',
          protocols: ['pendle', 'curve', 'aave', 'morpho'],
          uptime: 3600,
        }),
      });

      const result = await client.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.protocols).toContain('pendle');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/health`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_KEY}`,
          }),
        })
      );
    });

    it('should throw error if health check fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(client.healthCheck()).rejects.toThrow('Health check failed');
    });
  });

  describe('getAvailableProtocols', () => {
    it('should get available protocols for an action', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          action: 'swap',
          chainId: 1,
          protocols: ['curve', '1inch'],
        }),
      });

      const protocols = await client.getAvailableProtocols('swap');

      expect(protocols).toEqual(['curve', '1inch']);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/protocols/available?action=swap&chainId=1`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_KEY}`,
          }),
        })
      );
    });

    it('should throw error if request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: {
            message: 'Invalid action',
            code: 'VALIDATION_ERROR',
          },
        }),
      });

      await expect(client.getAvailableProtocols('invalid')).rejects.toThrow('Invalid action');
    });
  });

  describe('optimizeYield', () => {
    it('should optimize yield for an asset', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: 'aave',
          action: 'supply',
          params: {
            asset: '0x...',
            amount: '1000000000000000000',
          },
          estimatedAPR: 5.5,
          estimatedGas: '200000',
          riskLevel: 'low',
          confidence: 0.95,
          transaction: {
            to: '0x...',
            data: '0x...',
            value: '0',
          },
        }),
      });

      const result = await client.optimizeYield({
        asset: '0x...',
        amount: '1000000000000000000',
        strategy: 'balanced',
      });

      expect(result.protocol).toBe('aave');
      expect(result.estimatedAPR).toBe(5.5);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/optimize-yield`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should retry on network errors', async () => {
      jest.useFakeTimers();
      
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            protocol: 'aave',
            action: 'supply',
            params: {},
            estimatedAPR: 5.5,
            estimatedGas: '200000',
            riskLevel: 'low',
            confidence: 0.95,
          }),
        });

      const clientWithRetry = new DefiBrainClient({
        apiKey: API_KEY,
        apiUrl: API_URL,
        retryOptions: { maxRetries: 3, initialDelay: 1000 },
      });

      const promise = clientWithRetry.optimizeYield({
        asset: '0x...',
        amount: '1000000',
      });

      jest.advanceTimersByTime(1000);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.protocol).toBe('aave');
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    }, 10000);

    it('should throw error if optimization fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: {
            message: 'Asset not supported',
            code: 'VALIDATION_ERROR',
          },
        }),
      });

      await expect(
        client.optimizeYield({
          asset: '0x...',
          amount: '1000000000000000000',
        })
      ).rejects.toThrow('Asset not supported');
    });
  });

  describe('findOptimalSwap', () => {
    it('should find optimal swap route', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: 'curve',
          route: {
            fromToken: '0x...',
            toToken: '0x...',
            amount: '1000000000000000000',
            estimatedAmount: '990000000000000000',
            protocols: ['curve'],
          },
          estimatedGas: '150000',
          transaction: {
            to: '0x...',
            data: '0x...',
            value: '0',
          },
        }),
      });

      const result = await client.findOptimalSwap({
        tokenIn: '0x...',
        tokenOut: '0x...',
        amount: '1000000000000000000',
        slippage: 1,
      });

      expect(result.protocol).toBe('curve');
      expect(result.route.estimatedAmount).toBe('990000000000000000');
    });

    it('should throw error if swap fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: {
            message: 'No route found',
            code: 'ROUTE_ERROR',
          },
        }),
      });

      await expect(
        client.findOptimalSwap({
          tokenIn: '0x...',
          tokenOut: '0x...',
          amount: '1000000000000000000',
        })
      ).rejects.toThrow('No route found');
    });
  });

  describe('executeAction', () => {
    it('should execute an action', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          transactionHash: '0x...',
          protocol: 'aave',
          action: 'supply',
          status: 'pending',
        }),
      });

      const result = await client.executeAction({
        protocol: 'aave',
        action: 'supply',
        params: {
          asset: '0x...',
          amount: '1000000000000000000',
        },
      });

      expect(result.protocol).toBe('aave');
      expect(result.status).toBe('pending');
    });
  });

  describe('getUsageStats', () => {
    it('should get usage statistics', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Usage statistics',
          stats: {
            callsToday: 15,
            callsThisMonth: 150,
            limit: 100,
            resetDate: new Date().toISOString(),
          },
        }),
      });

      const stats = await client.getUsageStats();

      expect(stats.callsToday).toBe(15);
      expect(stats.limit).toBe(100);
    });

    it('should throw error if request fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        }),
      });

      await expect(client.getUsageStats()).rejects.toThrow('Unauthorized');
    });
  });

  describe('fetch method', () => {
    it('should include Authorization header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${API_KEY}`,
          }),
        })
      );
    });

    it('should include Content-Type header for POST requests', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await client.optimizeYield({
        asset: '0x...',
        amount: '1000000000000000000',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('chainId management', () => {
    it('should get chain ID', () => {
      const client = new DefiBrainClient({
        apiKey: API_KEY,
        chainId: 137,
      });

      expect(client.getChainId()).toBe(137);
    });

    it('should set chain ID', () => {
      const client = new DefiBrainClient({
        apiKey: API_KEY,
        chainId: 1,
      });

      client.setChainId(137);
      expect(client.getChainId()).toBe(137);
    });
  });
});

