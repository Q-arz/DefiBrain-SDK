/**
 * Pendle Helper Tests
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { PendleHelper } from '../helpers/PendleHelper';
import { TransactionHelper } from '../utils/TransactionHelper';

describe('PendleHelper', () => {
  let client: DefiBrainClient;
  let pendleHelper: PendleHelper;
  let mockTxHelper: jest.Mocked<TransactionHelper>;

  beforeEach(() => {
    client = new DefiBrainClient({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com/v1',
    });

    mockTxHelper = {
      signAndSend: jest.fn().mockResolvedValue('0xtxhash'),
    } as any;

    pendleHelper = new PendleHelper(client, mockTxHelper);
  });

  describe('optimizeYieldWithPendle', () => {
    it('should optimize yield with Pendle', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: 'pendle',
          action: 'supply',
          params: { asset: '0x...', amount: '1000000' },
          estimatedAPR: 5.5,
          estimatedGas: '200000',
          riskLevel: 'low',
          confidence: 0.95,
        }),
      });

      const result = await pendleHelper.optimizeYieldWithPendle(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        'max_yield'
      );

      expect(result.protocol).toBe('pendle');
      expect(result.estimatedAPR).toBe(5.5);
    });

    it('should throw if best protocol is not Pendle', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: 'aave',
          action: 'supply',
          params: {},
          estimatedAPR: 5.0,
          estimatedGas: '200000',
          riskLevel: 'low',
          confidence: 0.9,
        }),
      });

      await expect(
        pendleHelper.optimizeYieldWithPendle(
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          '1000000'
        )
      ).rejects.toThrow('Best protocol is aave, not Pendle');
    });
  });

  describe('swapPTtoYT', () => {
    it('should prepare swap without executing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          transactionHash: '',
          protocol: 'pendle',
          action: 'swapPTtoYT',
          status: 'pending',
        }),
      });

      const result = await pendleHelper.swapPTtoYT('0x' + '1'.repeat(40), '1000000', false);

      expect(result.protocol).toBe('pendle');
      expect(mockTxHelper.signAndSend).not.toHaveBeenCalled();
    });

    it('should execute swap when execute=true', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          transactionHash: '',
          protocol: 'pendle',
          action: 'swapPTtoYT',
          status: 'pending',
          transaction: {
            to: '0xcontract',
            data: '0xdata',
            value: '0x0',
          },
        }),
      });

      const result = await pendleHelper.swapPTtoYT('0x' + '1'.repeat(40), '1000000', true);

      expect((result as any).txHash).toBe('0xtxhash');
      expect(mockTxHelper.signAndSend).toHaveBeenCalled();
    });

    it('should throw if transaction helper not set', async () => {
      const helperWithoutTx = new PendleHelper(client);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          transactionHash: '',
          protocol: 'pendle',
          action: 'swapPTtoYT',
          status: 'pending',
          transaction: {
            to: '0xcontract',
            data: '0xdata',
            value: '0x0',
          },
        }),
      });

      await expect(
        helperWithoutTx.swapPTtoYT('0x' + '1'.repeat(40), '1000000', true)
      ).rejects.toThrow('Transaction helper not set');
    });
  });

  describe('validation', () => {
    it('should validate address', async () => {
      await expect(
        pendleHelper.optimizeYieldWithPendle('invalid', '1000000')
      ).rejects.toThrow('Asset is not a valid Ethereum address');
    });

    it('should validate amount', async () => {
      await expect(
        pendleHelper.optimizeYieldWithPendle(
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          '0'
        )
      ).rejects.toThrow('Amount must be a positive number');
    });
  });
});

