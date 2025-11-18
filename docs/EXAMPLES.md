# DefiBrain SDK - Usage Examples

Complete examples for using the DefiBrain SDK.

## Basic Setup

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

const client = new DefiBrainClient({
  apiKey: process.env.DEFIBRAIN_API_KEY!,
  apiUrl: 'https://backend-production-a565a.up.railway.app/v1',
  chainId: 1, // Ethereum mainnet
});
```

## Example 1: Optimize Yield for USDC

```typescript
// Find best yield option for USDC
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000', // 1 USDC (6 decimals)
  strategy: 'max_yield',
  maxRisk: 'medium'
});

console.log(`Best protocol: ${result.protocol}`);
console.log(`Estimated APR: ${result.estimatedAPR}%`);
console.log(`Risk level: ${result.riskLevel}`);

// Execute the transaction if you want
if (result.transaction) {
  // Sign and send transaction using your wallet
  const tx = await signer.sendTransaction(result.transaction);
  await tx.wait();
}
```

## Example 2: Compare Multiple Assets

```typescript
const assets = [
  { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USDC' },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'USDT' },
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'DAI' },
];

for (const asset of assets) {
  const result = await client.optimizeYield({
    asset: asset.address,
    amount: '1000000',
    strategy: 'max_yield'
  });
  
  console.log(`${asset.name}: ${result.protocol} at ${result.estimatedAPR}% APR`);
}
```

## Example 3: Swap Before Depositing

```typescript
// Step 1: Find optimal swap
const swap = await client.findOptimalSwap({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  amount: '1000000',
  slippage: 0.5
});

console.log(`Swap ${swap.route.amount} USDC for ${swap.route.estimatedAmount} DAI`);
console.log(`Using protocol: ${swap.protocol}`);

// Step 2: Execute swap if needed
if (swap.transaction) {
  const swapTx = await signer.sendTransaction(swap.transaction);
  await swapTx.wait();
}

// Step 3: Optimize yield with swapped token
const yieldResult = await client.optimizeYield({
  asset: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  amount: swap.route.estimatedAmount,
  strategy: 'max_yield'
});
```

## Example 4: Monitor Health and Usage

```typescript
// Check API health
const health = await client.healthCheck();
console.log(`API Status: ${health.status}`);
console.log(`Uptime: ${health.uptime}s`);
console.log(`Available protocols: ${health.protocols.join(', ')}`);

// Check usage
const usage = await client.getUsageStats();
console.log(`Calls today: ${usage.callsToday}/${usage.limit}`);
console.log(`Calls this month: ${usage.callsThisMonth}`);
console.log(`Reset date: ${usage.resetDate}`);
```

## Example 5: Error Handling

```typescript
try {
  const result = await client.optimizeYield({
    asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '1000000'
  });
} catch (error: any) {
  if (error.message.includes('rate limit')) {
    console.error('Rate limit exceeded. Please wait.');
  } else if (error.message.includes('API key')) {
    console.error('Invalid API key.');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Example 6: Get Available Protocols

```typescript
// Get all protocols that support supply action
const protocols = await client.getAvailableProtocols('supply');
console.log('Protocols supporting supply:', protocols);
// Output: ['aave', 'morpho', 'pendle']

// Get protocols for swap
const swapProtocols = await client.getAvailableProtocols('swap');
console.log('Protocols supporting swap:', swapProtocols);
// Output: ['1inch', 'curve']
```

## Example 7: Execute Direct Action

```typescript
// Execute a specific action on a protocol
const result = await client.executeAction({
  protocol: 'aave',
  action: 'supply',
  params: {
    asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    amount: '1000000',
    onBehalfOf: '0x...' // Your address
  }
});

console.log(`Transaction hash: ${result.transactionHash}`);
console.log(`Status: ${result.status}`);
```

## Example 8: Complete Workflow

```typescript
async function optimizeAndExecute(assetAddress: string, amount: string) {
  try {
    // 1. Check API health
    const health = await client.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error('API is not healthy');
    }

    // 2. Optimize yield
    const optimization = await client.optimizeYield({
      asset: assetAddress,
      amount: amount,
      strategy: 'max_yield',
      maxRisk: 'medium'
    });

    console.log(`Best option: ${optimization.protocol} at ${optimization.estimatedAPR}% APR`);

    // 3. Check if transaction is ready
    if (optimization.transaction) {
      // 4. Execute transaction
      const tx = await signer.sendTransaction(optimization.transaction);
      console.log(`Transaction sent: ${tx.hash}`);
      
      // 5. Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return receipt;
    } else {
      console.log('No transaction ready. Manual execution required.');
    }
  } catch (error) {
    console.error('Error in workflow:', error);
    throw error;
  }
}

// Usage
await optimizeAndExecute(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '1000000' // 1 USDC
);
```

## Example 9: Using with ethers.js

```typescript
import { DefiBrainClient } from '@defibrain/sdk';
import { ethers } from 'ethers';

const client = new DefiBrainClient({
  apiKey: process.env.DEFIBRAIN_API_KEY!,
});

// Get wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Optimize yield
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  amount: ethers.parseUnits('1', 6).toString(), // 1 USDC
  strategy: 'max_yield'
});

// Execute transaction
if (result.transaction) {
  const tx = await signer.sendTransaction({
    to: result.transaction.to,
    data: result.transaction.data,
    value: result.transaction.value || 0,
  });
  
  await tx.wait();
  console.log('Transaction confirmed!');
}
```

## Example 10: Batch Operations

```typescript
// Optimize yield for multiple assets in parallel
const assets = ['USDC', 'USDT', 'DAI'].map(name => ({
  address: TOKEN_ADDRESSES[name],
  amount: '1000000'
}));

const results = await Promise.all(
  assets.map(asset =>
    client.optimizeYield({
      asset: asset.address,
      amount: asset.amount,
      strategy: 'max_yield'
    })
  )
);

// Find best option across all assets
const best = results.reduce((prev, current) =>
  current.estimatedAPR > prev.estimatedAPR ? current : prev
);

console.log(`Best option: ${best.protocol} with ${best.estimatedAPR}% APR`);
```

---

**For API reference, see [API.md](./API.md)**

