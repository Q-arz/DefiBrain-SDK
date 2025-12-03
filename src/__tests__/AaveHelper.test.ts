/**
 * Aave Helper Tests
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { AaveHelper } from '../helpers/AaveHelper';
import { TransactionHelper } from '../utils/TransactionHelper';

describe('AaveHelper', () => {
  const API_KEY = 'test-key';
  const API_URL = 'https://test.api.com/v1';

  let client: DefiBrainClient;
  let aaveHelper: AaveHelper;
  let mockTxHelper: jest.Mocked<TransactionHelper>;

  beforeEach(() => {
    client = new DefiBrainClient({
      apiKey: API_KEY,
      apiUrl: API_URL,
    });

    mockTxHelper = {
      signAndSend: jest.fn().mockResolvedValue('0xtxhash'),
    } as any;

    aaveHelper = new AaveHelper(client, mockTxHelper);
  });

  const mockOkResponse = (overrides: any = {}) => ({
    ok: true,
    json: async () => ({
      protocol: 'aave',
      action: overrides.action ?? 'supply',
      status: 'pending',
      transaction: {
        to: '0xcontract',
        data: '0xdata',
        value: '0x0',
      },
      ...overrides,
    }),
  });

  describe('supply', () => {
    it('should prepare supply without executing', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'supply' }),
      );

      const result = await aaveHelper.supply(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        false,
      );

      expect(result.protocol).toBe('aave');
      expect(result.action).toBe('supply');
      expect(mockTxHelper.signAndSend).not.toHaveBeenCalled();
    });

    it('should execute supply when execute=true', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'supply' }),
      );

      const result = await aaveHelper.supply(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        true,
      );

      expect(result.txHash).toBe('0xtxhash');
      expect(mockTxHelper.signAndSend).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should call executeAction with withdraw action', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'withdraw' }),
      );

      const result = await aaveHelper.withdraw(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        false,
      );

      expect(result.action).toBe('withdraw');
    });
  });

  describe('borrow', () => {
    it('should call executeAction with borrow action', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'borrow' }),
      );

      const result = await aaveHelper.borrow(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        false,
      );

      expect(result.action).toBe('borrow');
    });
  });

  describe('repay', () => {
    it('should call executeAction with repay action', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'repay' }),
      );

      const result = await aaveHelper.repay(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '1000000',
        false,
      );

      expect(result.action).toBe('repay');
    });
  });

  describe('validation', () => {
    it('should throw if execute=true and txHelper is not set', async () => {
      const helperWithoutTx = new AaveHelper(client);

      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'supply' }),
      );

      await expect(
        helperWithoutTx.supply(
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          '1000000',
          true,
        ),
      ).rejects.toThrow('Transaction helper not set');
    });
  });
});


