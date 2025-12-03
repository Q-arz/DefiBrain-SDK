/**
 * Morpho Helper - Helpers específicos para Morpho Blue
 *
 * Thin wrapper sobre DefiBrainClient para operaciones comunes de Morpho.
 */

import { DefiBrainClient, ExecuteActionResponse } from '../DefiBrainClient';
import { TransactionHelper } from '../utils/TransactionHelper';
import { validateAddress, validateAmount } from '../utils/ValidationHelper';

export interface MorphoActionParams {
  marketId: string;
  assets: string; // amount in smallest units
  onBehalfOf?: string;
  receiver?: string;
  data?: string;
}

export class MorphoHelper {
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
   * Supply assets to a Morpho Blue market
   */
  async supply(
    marketId: string,
    assets: string,
    onBehalfOf?: string,
    execute: boolean = false
  ): Promise<ExecuteActionResponse & { txHash?: string }> {
    this.ensureTxHelperIfExecute(execute);

    validateAmount(assets, 'Assets');

    const params: MorphoActionParams = {
      marketId,
      assets,
      onBehalfOf,
    };

    const result = await this.client.executeAction({
      protocol: 'morpho',
      action: 'supply',
      params,
    });

    if (execute && result.transaction && this.txHelper) {
      const tx = result.transaction;
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
   * Withdraw assets from a Morpho Blue market
   */
  async withdraw(
    marketId: string,
    assets: string,
    receiver?: string,
    onBehalfOf?: string,
    execute: boolean = false
  ): Promise<ExecuteActionResponse & { txHash?: string }> {
    this.ensureTxHelperIfExecute(execute);

    validateAmount(assets, 'Assets');
    if (receiver) validateAddress(receiver, 'Receiver');
    if (onBehalfOf) validateAddress(onBehalfOf, 'OnBehalfOf');

    const params: MorphoActionParams = {
      marketId,
      assets,
      receiver,
      onBehalfOf,
    };

    const result = await this.client.executeAction({
      protocol: 'morpho',
      action: 'withdraw',
      params,
    });

    if (execute && result.transaction && this.txHelper) {
      const tx = result.transaction;
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
   * Borrow assets from a Morpho Blue market
   */
  async borrow(
    marketId: string,
    assets: string,
    receiver?: string,
    onBehalfOf?: string,
    execute: boolean = false
  ): Promise<ExecuteActionResponse & { txHash?: string }> {
    this.ensureTxHelperIfExecute(execute);

    validateAmount(assets, 'Assets');
    if (receiver) validateAddress(receiver, 'Receiver');
    if (onBehalfOf) validateAddress(onBehalfOf, 'OnBehalfOf');

    const params: MorphoActionParams = {
      marketId,
      assets,
      receiver,
      onBehalfOf,
    };

    const result = await this.client.executeAction({
      protocol: 'morpho',
      action: 'borrow',
      params,
    });

    if (execute && result.transaction && this.txHelper) {
      const tx = result.transaction;
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
   * Repay a borrow on Morpho Blue
   */
  async repay(
    marketId: string,
    assets: string,
    onBehalfOf?: string,
    execute: boolean = false
  ): Promise<ExecuteActionResponse & { txHash?: string }> {
    this.ensureTxHelperIfExecute(execute);

    validateAmount(assets, 'Assets');
    if (onBehalfOf) validateAddress(onBehalfOf, 'OnBehalfOf');

    const params: MorphoActionParams = {
      marketId,
      assets,
      onBehalfOf,
    };

    const result = await this.client.executeAction({
      protocol: 'morpho',
      action: 'repay',
      params,
    });

    if (execute && result.transaction && this.txHelper) {
      const tx = result.transaction;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      return { ...result, txHash };
    }

    return result;
  }

  private ensureTxHelperIfExecute(execute: boolean): void {
    if (execute && !this.txHelper) {
      throw new Error('Transaction helper not set. Call setTransactionHelper() first.');
    }
  }
}


