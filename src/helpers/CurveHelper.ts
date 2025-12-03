/**
 * Curve Helper - Protocol-specific helpers for Curve Finance
 *
 * Simple helpers for stablecoin swaps using Curve through DefiBrain.
 */

import { DefiBrainClient, ExecuteActionResponse, FindSwapResponse } from "../DefiBrainClient";
import { TransactionHelper, TransactionRequest } from "../utils/TransactionHelper";
import { validateAddress, validateAmount } from "../utils/ValidationHelper";

/**
 * Curve Helper - Easy Curve operations
 *
 * This helper focuses on stablecoin swaps routed via Curve.
 * It uses the backend's optimal swap resolver but forces Curve as preferred protocol.
 */
export class CurveHelper {
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
   * Find the optimal Curve route for a stable swap (USDC/USDT/DAI, etc.)
   */
  async findOptimalStableSwap(
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
      preferProtocol: "curve",
    });

    if (result.protocol !== "curve") {
      throw new Error(
        `Best route is not Curve (got ${result.protocol}). ` +
        `This helper is intended for stablecoin swaps where Curve is best.`
      );
    }

    return result;
  }

  /**
   * Execute a stable swap on Curve.
   *
   * - If you already have a swap result from findOptimalStableSwap, pass it in.
   * - Otherwise the helper will query the optimal Curve route first.
   */
  async swapStable(
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
      existingRoute ||
      (await this.findOptimalStableSwap(tokenIn, tokenOut, amount, slippage));

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


