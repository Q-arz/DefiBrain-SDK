/**
 * OneInch Helper - Protocol-specific helpers for 1inch
 *
 * Simple helpers for swaps routed through the 1inch aggregator.
 */

import { DefiBrainClient, FindSwapResponse } from "../DefiBrainClient";
import { TransactionHelper, TransactionRequest } from "../utils/TransactionHelper";
import { validateAddress, validateAmount } from "../utils/ValidationHelper";

/**
 * OneInch Helper - Easy 1inch swap operations
 */
export class OneInchHelper {
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
   * Find the optimal 1inch route between two tokens.
   */
  async findOptimalSwap(
    tokenIn: string,
    tokenOut: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<FindSwapResponse> {
    validateAddress(tokenIn, "TokenIn");
    validateAddress(tokenOut, "TokenOut");
    validateAmount(amount, "Amount");

    const result = await this.client.findOptimalSwap({
      tokenIn,
      tokenOut,
      amount,
      slippage,
      preferProtocol: "1inch",
    });

    if (result.protocol !== "1inch") {
      throw new Error(
        `Best route is not 1inch (got ${result.protocol}). ` +
        `This helper is intended for swaps where 1inch is the selected protocol.`
      );
    }

    return result;
  }

  /**
   * Execute a swap using 1inch.
   *
   * - If you already have a swap result from findOptimalSwap, pass it in.
   * - Otherwise the helper will query the optimal 1inch route first.
   */
  async swap(
    tokenIn: string,
    tokenOut: string,
    amount: string,
    options: {
      slippage?: number;
      execute?: boolean;
      existingRoute?: FindSwapResponse;
    } = {}
  ): Promise<FindSwapResponse & { txHash?: string }> {
    const { slippage = 0.5, execute = false, existingRoute } = options;

    if (execute && !this.txHelper) {
      throw new Error("Transaction helper not set. Call setTransactionHelper() first.");
    }

    const swapResult =
      existingRoute || (await this.findOptimalSwap(tokenIn, tokenOut, amount, slippage));

    if (execute && swapResult.transaction && this.txHelper) {
      const tx = swapResult.transaction as TransactionRequest;
      const txHash = await this.txHelper.signAndSend({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });

      return { ...swapResult, txHash };
    }

    return swapResult as FindSwapResponse & { txHash?: string };
  }
}


