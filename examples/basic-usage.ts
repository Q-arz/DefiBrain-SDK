/**
 * Basic Usage Example
 * 
 * This example shows how to use the DefiBrain SDK
 * to optimize yield and execute swaps.
 */

import { DefiBrainClient } from "../src/DefiBrainClient";

async function main() {
  // Initialize client
  const client = new DefiBrainClient({
    apiKey: process.env.DEFIBRAIN_API_KEY || "test_free_key",
    apiUrl: process.env.DEFIBRAIN_API_URL || "https://backend-production-a565a.up.railway.app/v1",
    chainId: 1, // Ethereum mainnet
  });

  try {
    // Example 1: Optimize yield for USDC
    console.log("Optimizing yield for USDC...");
    const yieldResult = await client.optimizeYield({
      asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      amount: "1000000", // 1 USDC
      strategy: "max_yield",
    });

    console.log(`Best protocol: ${yieldResult.protocol}`);
    console.log(`Estimated APR: ${yieldResult.estimatedAPR}%`);
    console.log(`Confidence: ${yieldResult.confidence}%`);

    // Example 2: Find optimal swap route
    console.log("\nFinding optimal swap route...");
    const swapResult = await client.findOptimalSwap({
      tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      tokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      amount: "1000000",
      slippage: 1,
    });

    console.log(`Best protocol: ${swapResult.protocol}`);
    console.log(`Estimated output: ${swapResult.route.estimatedAmount}`);

    // Example 3: Get available protocols
    console.log("\nGetting available protocols...");
    const protocols = await client.getAvailableProtocols("supply");
    console.log(`Available protocols for supply: ${protocols.join(", ")}`);

    // Example 4: Health check
    console.log("\nChecking API health...");
    const health = await client.healthCheck();
    console.log(`API Status: ${health.status}`);
    console.log(`Supported protocols: ${health.protocols.join(", ")}`);

    // Example 5: Get usage stats
    console.log("\nGetting usage statistics...");
    const usage = await client.getUsageStats();
    console.log(`Calls today: ${usage.callsToday}/${usage.limit}`);
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

main();

