/**
 * Validation Helper Tests
 */

import {
  isValidAddress,
  isValidAmount,
  isValidChainId,
  isValidTxHash,
  formatAmount,
  parseAmount,
  validateAddress,
  validateAmount,
  validateChainId,
} from '../utils/ValidationHelper';

describe('ValidationHelper', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(true);
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB4')).toBe(false);
      expect(isValidAddress('A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(false);
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('not an address')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive amounts', () => {
      expect(isValidAmount('1000000')).toBe(true);
      expect(isValidAmount('1')).toBe(true);
      expect(isValidAmount('999999999999999999999')).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount('0')).toBe(false);
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount('')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('1.5')).toBe(false); // BigInt doesn't support decimals
    });
  });

  describe('isValidChainId', () => {
    it('should validate positive chain IDs', () => {
      expect(isValidChainId(1)).toBe(true);
      expect(isValidChainId(137)).toBe(true);
      expect(isValidChainId(42161)).toBe(true);
    });

    it('should reject invalid chain IDs', () => {
      expect(isValidChainId(0)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
      expect(isValidChainId(1.5)).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct transaction hashes', () => {
      expect(isValidTxHash('0x' + 'a'.repeat(64))).toBe(true);
      expect(isValidTxHash('0x' + '0'.repeat(64))).toBe(true);
    });

    it('should reject invalid hashes', () => {
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('0x' + 'a'.repeat(63))).toBe(false);
      expect(isValidTxHash('')).toBe(false);
    });
  });

  describe('formatAmount', () => {
    it('should format amounts correctly', () => {
      expect(formatAmount('1000000000000000000', 18)).toBe('1');
      expect(formatAmount('1500000000000000000', 18)).toBe('1.5');
      expect(formatAmount('1000000', 6)).toBe('1');
      expect(formatAmount('1500000', 6)).toBe('1.5');
    });

    it('should handle zero amounts', () => {
      expect(formatAmount('0', 18)).toBe('0');
    });

    it('should trim trailing zeros', () => {
      expect(formatAmount('1000000000000000000', 18)).toBe('1');
      expect(formatAmount('1005000000000000000', 18)).toBe('1.005');
    });
  });

  describe('parseAmount', () => {
    it('should parse amounts correctly', () => {
      expect(parseAmount('1', 18)).toBe('1000000000000000000');
      expect(parseAmount('1.5', 18)).toBe('1500000000000000000');
      expect(parseAmount('1', 6)).toBe('1000000');
      expect(parseAmount('1.5', 6)).toBe('1500000');
    });

    it('should handle decimal amounts', () => {
      expect(parseAmount('0.5', 18)).toBe('500000000000000000');
      expect(parseAmount('0.001', 18)).toBe('1000000000000000');
    });

    it('should throw on invalid format', () => {
      expect(() => parseAmount('abc', 18)).toThrow();
      expect(() => parseAmount('', 18)).toThrow('Invalid amount format');
    });
  });

  describe('validateAddress', () => {
    it('should not throw for valid addresses', () => {
      expect(() => validateAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).not.toThrow();
    });

    it('should throw for invalid addresses', () => {
      expect(() => validateAddress('0x123')).toThrow();
      expect(() => validateAddress('invalid')).toThrow();
    });

    it('should use custom name in error message', () => {
      expect(() => validateAddress('invalid', 'Token Address')).toThrow('Token Address');
    });
  });

  describe('validateAmount', () => {
    it('should not throw for valid amounts', () => {
      expect(() => validateAmount('1000000')).not.toThrow();
    });

    it('should throw for invalid amounts', () => {
      expect(() => validateAmount('0')).toThrow();
      expect(() => validateAmount('invalid')).toThrow();
    });
  });

  describe('validateChainId', () => {
    it('should not throw for valid chain IDs', () => {
      expect(() => validateChainId(1)).not.toThrow();
    });

    it('should throw for invalid chain IDs', () => {
      expect(() => validateChainId(0)).toThrow();
      expect(() => validateChainId(-1)).toThrow();
    });
  });
});

