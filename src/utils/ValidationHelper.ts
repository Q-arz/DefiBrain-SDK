/**
 * Validation Helper - Input validation utilities
 * 
 * Simple validation functions for common inputs
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate amount (must be positive number string)
 */
export function isValidAmount(amount: string): boolean {
  try {
    const num = BigInt(amount);
    return num > 0n;
  } catch {
    return false;
  }
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Format amount from wei to readable format
 */
export function formatAmount(amount: string, decimals: number = 18): string {
  try {
    const amountBigInt = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = amountBigInt / divisor;
    const remainder = amountBigInt % divisor;
    
    if (remainder === 0n) {
      return whole.toString();
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmed = remainderStr.replace(/0+$/, '');
    
    return `${whole}.${trimmed}`;
  } catch {
    return amount;
  }
}

/**
 * Parse amount to wei
 */
export function parseAmount(amount: string, decimals: number = 18): string {
  if (!amount || amount.trim() === '') {
    throw new Error(`Invalid amount format: ${amount}`);
  }
  
  try {
    const [whole, decimal = ''] = amount.split('.');
    if (!whole || whole === '') {
      throw new Error(`Invalid amount format: ${amount}`);
    }
    const decimalPadded = decimal.padEnd(decimals, '0').slice(0, decimals);
    return (BigInt(whole) * BigInt(10 ** decimals) + BigInt(decimalPadded || '0')).toString();
  } catch (error: any) {
    if (error.message?.includes('Invalid amount format')) {
      throw error;
    }
    throw new Error(`Invalid amount format: ${amount}`);
  }
}

/**
 * Validate and throw if invalid
 */
export function validateAddress(address: string, name: string = 'Address'): void {
  if (!isValidAddress(address)) {
    throw new Error(`${name} is not a valid Ethereum address: ${address}`);
  }
}

export function validateAmount(amount: string, name: string = 'Amount'): void {
  if (!isValidAmount(amount)) {
    throw new Error(`${name} must be a positive number: ${amount}`);
  }
}

export function validateChainId(chainId: number, name: string = 'Chain ID'): void {
  if (!isValidChainId(chainId)) {
    throw new Error(`${name} must be a positive integer: ${chainId}`);
  }
}

