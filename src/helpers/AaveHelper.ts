/**
 * Aave Helper - Protocol-specific helpers for Aave V3
 * 
 * Simple helpers for Aave operations
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { TransactionHelper } from '../utils/TransactionHelper';
import { validateAddress, validateAmount } from '../utils/ValidationHelper';

/**
 * Aave Helper - Easy Aave operations
 */
export class AaveHelper {
  private client: DefiBrainClient;
  private txHelper: TransactionHelper | null = null;

  constructor(client: DefiBrainClient, txHelper?: TransactionHelper) {
    this.client = client;
    this.txHelper = txHelper || null;
  }

  /**
   * Set transaction helper for executing transactions
   */
  setTransactionHelper(txHelper: TransactionHelper): void {
    this.txHelper = txHelper;
  }

  /**
   * Supply assets to Aave
   * Simple way to supply tokens to Aave
   */
  async supply(asset: string, amount: string, execute: boolean = false) {
    validateAddress(asset, 'Asset');
    validateAmount(amount, 'Amount');

    if (!this.txHelper && execute) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'aave',
      action: 'supply',
      params: { asset, amount },
    });

    if (execute && (result as any).transaction && this.txHelper) {
      const tx = (result as any).transaction;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return { ...result, txHash };
    }

    return result;
  }

  /**
   * Withdraw assets from Aave
   */
  async withdraw(asset: string, amount: string, execute: boolean = false) {
    validateAddress(asset, 'Asset');
    validateAmount(amount, 'Amount');

    if (!this.txHelper && execute) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'aave',
      action: 'withdraw',
      params: { asset, amount },
    });

    if (execute && (result as any).transaction && this.txHelper) {
      const tx = (result as any).transaction;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return { ...result, txHash };
    }

    return result;
  }

  /**
   * Borrow assets from Aave
   */
  async borrow(asset: string, amount: string, execute: boolean = false) {
    validateAddress(asset, 'Asset');
    validateAmount(amount, 'Amount');

    if (!this.txHelper && execute) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'aave',
      action: 'borrow',
      params: { asset, amount },
    });

    if (execute && (result as any).transaction && this.txHelper) {
      const tx = (result as any).transaction;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return { ...result, txHash };
    }

    return result;
  }

  /**
   * Repay borrowed assets
   */
  async repay(asset: string, amount: string, execute: boolean = false) {
    validateAddress(asset, 'Asset');
    validateAmount(amount, 'Amount');

    if (!this.txHelper && execute) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'aave',
      action: 'repay',
      params: { asset, amount },
    });

    if (execute && (result as any).transaction && this.txHelper) {
      const tx = (result as any).transaction;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return { ...result, txHash };
    }

    return result;
  }
}

