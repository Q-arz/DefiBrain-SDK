/**
 * Uniswap Helper - Protocol-specific helpers for Uniswap v3
 *
 * Simple helpers for swaps routed directly through Uniswap (via backend resolver).
 */

import { DefiBrainClient, FindSwapResponse } from "../DefiBrainClient";
import { TransactionHelper, TransactionRequest } from "../utils/TransactionHelper";
import { validateAddress, validateAmount } from "../utils/ValidationHelper";

/**
 * Uniswap Helper - Easy Uniswap swap operations
 *
 * Usa el resolver de swaps del backend pero forzando Uniswap como protocolo preferido.
 */
export class UniswapHelper {
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
   * Find the optimal Uniswap route between two tokens.
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
      preferProtocol: "uniswap",
    });

    if (result.protocol !== "uniswap") {
      throw new Error(
        `Best route is not Uniswap (got ${result.protocol}). ` +
        `This helper is intended for swaps where Uniswap is the selected protocol.`
      );
    }

    return result;
  }

  /**
   * Execute a swap using Uniswap.
   *
   * - If you already have a swap result from findOptimalSwap, pass it in.
   * - Otherwise the helper will query the optimal Uniswap route first.
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


