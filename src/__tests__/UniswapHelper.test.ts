/**
 * Uniswap Helper Tests
 */

import { DefiBrainClient } from "../DefiBrainClient";
import { UniswapHelper } from "../helpers/UniswapHelper";
import { TransactionHelper } from "../utils/TransactionHelper";

describe("UniswapHelper", () => {
  let client: DefiBrainClient;
  let uniHelper: UniswapHelper;
  let mockTxHelper: jest.Mocked<TransactionHelper>;

  beforeEach(() => {
    client = new DefiBrainClient({
      apiKey: "test-key",
      apiUrl: "https://test.api.com/v1",
    });

    mockTxHelper = {
      signAndSend: jest.fn().mockResolvedValue("0xtxhash"),
    } as any;

    uniHelper = new UniswapHelper(client, mockTxHelper);
  });

  describe("findOptimalSwap", () => {
    it("should find optimal swap via Uniswap", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: "uniswap",
          route: {
            fromToken: "0xA0b8...eB48",
            toToken: "0xdAC1...1ec7",
            amount: "1000000",
            estimatedAmount: "999000",
            protocols: ["uniswap"],
          },
          estimatedGas: "180000",
        }),
      } as any);

      const result = await uniHelper.findOptimalSwap(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "1000000",
        0.5
      );

      expect(result.protocol).toBe("uniswap");
      expect(result.route.estimatedAmount).toBe("999000");
    });

    it("should throw if best protocol is not Uniswap", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: "curve",
          route: {
            fromToken: "0x...",
            toToken: "0x...",
            amount: "1000000",
            estimatedAmount: "999000",
            protocols: ["curve"],
          },
          estimatedGas: "150000",
        }),
      } as any);

      await expect(
        uniHelper.findOptimalSwap(
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          "1000000",
          0.5
        )
      ).rejects.toThrow("Best route is not Uniswap (got curve).");
    });
  });

  describe("swap", () => {
    it("should execute swap when execute=true", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: "uniswap",
          route: {
            fromToken: "0x...",
            toToken: "0x...",
            amount: "1000000",
            estimatedAmount: "990000",
            protocols: ["uniswap"],
          },
          estimatedGas: "180000",
          transaction: {
            to: "0xrouter",
            data: "0xdata",
            value: "0x0",
          },
        }),
      } as any);

      const result = await uniHelper.swap(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "1000000",
        { slippage: 0.5, execute: true }
      );

      expect((result as any).txHash).toBe("0xtxhash");
      expect(mockTxHelper.signAndSend).toHaveBeenCalled();
    });

    it("should throw if transaction helper not set and execute=true", async () => {
      const helperWithoutTx = new UniswapHelper(client);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocol: "uniswap",
          route: {
            fromToken: "0x...",
            toToken: "0x...",
            amount: "1000000",
            estimatedAmount: "990000",
            protocols: ["uniswap"],
          },
          estimatedGas: "180000",
          transaction: {
            to: "0xrouter",
            data: "0xdata",
            value: "0x0",
          },
        }),
      } as any);

      await expect(
        helperWithoutTx.swap(
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          "1000000",
          { slippage: 0.5, execute: true }
        )
      ).rejects.toThrow("Transaction helper not set");
    });
  });
});


