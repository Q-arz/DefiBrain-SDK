/**
 * Pendle Helper - Protocol-specific helpers for Pendle
 * 
 * Simple helpers for Pendle PT/YT operations
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { TransactionHelper, TransactionRequest } from '../utils/TransactionHelper';
import { validateAddress, validateAmount } from '../utils/ValidationHelper';

export interface PendlePTInfo {
  address: string;
  underlyingAsset: string;
  maturityDate: Date;
  yieldToken: string;
}

export interface PendleYTInfo {
  address: string;
  underlyingAsset: string;
  maturityDate: Date;
  principalToken: string;
}

/**
 * Pendle Helper - Easy Pendle operations
 */
export class PendleHelper {
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
   * Optimize yield using Pendle PT/YT
   * Simple way to find best Pendle yield opportunities
   */
  async optimizeYieldWithPendle(
    asset: string,
    amount: string,
    strategy: 'max_yield' | 'min_risk' | 'balanced' = 'max_yield'
  ) {
    validateAddress(asset, 'Asset');
    validateAmount(amount, 'Amount');

    const result = await this.client.optimizeYield({
      asset,
      amount,
      strategy,
    });

    // Filter to only Pendle results
    if (result.protocol !== 'pendle') {
      throw new Error(`Best protocol is ${result.protocol}, not Pendle`);
    }

    return result;
  }

  /**
   * Get Pendle PT (Principal Token) info
   */
  async getPTInfo(ptAddress: string): Promise<PendlePTInfo> {
    validateAddress(ptAddress, 'PT Address');

    // This would call backend to get PT info
    // For now, return structure
    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'getPTInfo',
      params: { ptAddress },
    });

    return result as any as PendlePTInfo;
  }

  /**
   * Get Pendle YT (Yield Token) info
   */
  async getYTInfo(ytAddress: string): Promise<PendleYTInfo> {
    validateAddress(ytAddress, 'YT Address');

    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'getYTInfo',
      params: { ytAddress },
    });

    return result as any as PendleYTInfo;
  }

  /**
   * Swap PT to YT
   * Simple way to swap Principal Token to Yield Token
   */
  async swapPTtoYT(ptAddress: string, amount: string, execute: boolean = false) {
    validateAddress(ptAddress, 'PT Address');
    validateAmount(amount, 'Amount');

    if (!this.txHelper) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'swapPTtoYT',
      params: { ptAddress, amount },
    });

    if (execute && (result as any).transaction) {
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
   * Swap YT to PT
   * Simple way to swap Yield Token to Principal Token
   */
  async swapYTtoPT(ytAddress: string, amount: string, execute: boolean = false) {
    validateAddress(ytAddress, 'YT Address');
    validateAmount(amount, 'Amount');

    if (!this.txHelper) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'swapYTtoPT',
      params: { ytAddress, amount },
    });

    if (execute && (result as any).transaction) {
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
   * Redeem PT at maturity
   * Simple way to redeem Principal Token when it matures
   */
  async redeemPT(ptAddress: string, amount: string, execute: boolean = false) {
    validateAddress(ptAddress, 'PT Address');
    validateAmount(amount, 'Amount');

    if (!this.txHelper) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }

    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'redeemPT',
      params: { ptAddress, amount },
    });

    if (execute && (result as any).transaction) {
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
   * Estimate yield for YT
   * Get estimated yield for a Yield Token
   */
  async estimateYield(ytAddress: string) {
    validateAddress(ytAddress, 'YT Address');

    const result = await this.client.executeAction({
      protocol: 'pendle',
      action: 'estimateYield',
      params: { ytAddress },
    });

    return result;
  }
}

