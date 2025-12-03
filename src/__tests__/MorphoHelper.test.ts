/**
 * Morpho Helper Tests
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { MorphoHelper } from '../helpers/MorphoHelper';
import { TransactionHelper } from '../utils/TransactionHelper';

describe('MorphoHelper', () => {
  const API_KEY = 'test-key';
  const API_URL = 'https://test.api.com/v1';

  let client: DefiBrainClient;
  let morphoHelper: MorphoHelper;
  let mockTxHelper: jest.Mocked<TransactionHelper>;

  beforeEach(() => {
    client = new DefiBrainClient({
      apiKey: API_KEY,
      apiUrl: API_URL,
    });

    mockTxHelper = {
      signAndSend: jest.fn().mockResolvedValue('0xtxhash'),
    } as any;

    morphoHelper = new MorphoHelper(client, mockTxHelper);
  });

  const mockOkResponse = (overrides: any = {}) => ({
    ok: true,
    json: async () => ({
      protocol: 'morpho',
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
    it('should call executeAction with correct params', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'supply' }),
      );

      const result = await morphoHelper.supply(
        '0xmarketId',
        '1000000',
        undefined,
        false,
      );

      expect(result.action).toBe('supply');
      expect(mockTxHelper.signAndSend).not.toHaveBeenCalled();
    });
  });

  describe('borrow', () => {
    it('should execute when execute=true', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'borrow' }),
      );

      const result = await morphoHelper.borrow(
        '0xmarketId',
        '500000',
        '0x' + '1'.repeat(40),
        undefined,
        true,
      );

      expect(result.action).toBe('borrow');
      expect(result.txHash).toBe('0xtxhash');
      expect(mockTxHelper.signAndSend).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should throw if execute=true and txHelper not set', async () => {
      const helperWithoutTx = new MorphoHelper(client);

      global.fetch = jest.fn().mockResolvedValue(
        mockOkResponse({ action: 'supply' }),
      );

      await expect(
        helperWithoutTx.supply('0xmarketId', '1000000', undefined, true),
      ).rejects.toThrow('Transaction helper not set');
    });
  });
});


