# DefiBrain SDK

Official TypeScript/JavaScript SDK for the DefiBrain API - A unified DeFi router that integrates multiple protocols (Pendle, Curve, 1inch, Aave V3, Morpho Blue) into a single intelligent API.

## Installation

```bash
npm install @defibrain/sdk
```

## 📄 Smart Contracts

This SDK includes the core smart contracts of DefiBrain:

- **DeFiRouter** - Main router for executing batch actions
- **PermissionManager** - Permission and access control
- **AssetRegistry** - Registry of supported assets
- **AaveAdapter** - Example adapter implementation

Contracts are available in:
- **Source code**: `contracts/` (Solidity)
- **ABIs**: `abis/` (JSON)

See [docs/CONTRACTS.md](./docs/CONTRACTS.md) for detailed information on how to use the contracts.

## Quick Start

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

// Initialize client
const client = new DefiBrainClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://backend-production-a565a.up.railway.app/v1', // Optional, defaults to production
  chainId: 1, // Optional, defaults to Ethereum mainnet
});

// Optimize yield automatically
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000', // 1 USDC
  strategy: 'max_yield',
});

console.log(`Best protocol: ${result.protocol}`);
console.log(`Estimated APR: ${result.estimatedAPR}%`);

// Execute the transaction
const tx = await client.executeAction({
  protocol: result.protocol,
  action: result.action,
  params: result.params,
});
```

## Advanced Usage

### Wallet Integration

```typescript
import { WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();

// Connect wallet
const walletInfo = await wallet.connect();
console.log(`Connected: ${walletInfo.address}`);

// Get balance
const balance = await wallet.getBalance();
console.log(`Balance: ${balance} wei`);

// Get token balance
const usdcBalance = await wallet.getTokenBalance('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(`USDC: ${usdcBalance}`);
```

### Transaction Helper

```typescript
import { DefiBrainClient, TransactionHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());

// Optimize yield
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  amount: '1000000',
});

// Sign and send transaction
if (result.transaction) {
  const txHash = await txHelper.signAndSend(result.transaction);
  console.log(`Transaction sent: ${txHash}`);
  
  // Wait for confirmation
  const receipt = await txHelper.waitForConfirmation(txHash);
  console.log(`Confirmed in block: ${receipt.blockNumber}`);
  
  // Or do it all in one call
  // const receipt = await txHelper.signSendAndWait(result.transaction);
}
```

### Pendle Helper

```typescript
import { DefiBrainClient, PendleHelper, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
const pendleHelper = new PendleHelper(client, txHelper);

// Optimize yield with Pendle
const result = await pendleHelper.optimizeYieldWithPendle(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '1000000', // 1 USDC
  'max_yield'
);

// Swap PT to YT
const swapResult = await pendleHelper.swapPTtoYT(
  '0x...', // PT address
  '1000000',
  false // Don't execute, just prepare
);

// Redeem PT at maturity
const redeemResult = await pendleHelper.redeemPT(
  '0x...', // PT address
  '1000000',
  false
);
```

### Aave Helper

```typescript
import { DefiBrainClient, AaveHelper, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
const aaveHelper = new AaveHelper(client, txHelper);

// Supply to Aave
const supplyResult = await aaveHelper.supply(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '1000000', // 1 USDC
  false // Don't execute, just prepare
);

// Withdraw from Aave
const withdrawResult = await aaveHelper.withdraw(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '1000000',
  false
);
```

### Automatic Retry

```typescript
const client = new DefiBrainClient({
  apiKey: 'your-key',
  retryOptions: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  },
});

// All API calls automatically retry on network errors
const result = await client.optimizeYield({ ... });
```

### Input Validation

```typescript
import { validateAddress, validateAmount, formatAmount, parseAmount } from '@defibrain/sdk';

// Validate address
validateAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'); // true

// Validate amount
validateAmount('1000000'); // true

// Format amount (wei to readable)
formatAmount('1000000000000000000', 18); // "1"

// Parse amount (readable to wei)
parseAmount('1.5', 18); // "1500000000000000000"
```

## Why DefiBrain?

### For End Users
- **Auto-Optimization**: Automatically finds the best yield across multiple protocols
- **Simple API**: One unified interface for all DeFi protocols
- **Batch Operations**: Execute multiple actions in a single transaction
- **Gas Optimization**: Built-in gas estimation and optimization

### For Developers
- **Easy Integration**: Add new protocols with ~70% less code
- **Reusable Infrastructure**: No need to rebuild common functionality
- **Type Safety**: Full TypeScript support with strong typing
- **Protocol Helpers**: Simple, protocol-specific APIs (AaveHelper, PendleHelper, etc.)

**See [How to Integrate a Protocol](../docs/EN/HOW_TO_INTEGRATE_PROTOCOL.md) for details.**

## Documentation

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Examples](./docs/EXAMPLES.md)** - Usage examples and code samples
- **[Configuration](./docs/CONFIGURATION.md)** - Setup and configuration guide
- **[How to Integrate a Protocol](../docs/EN/HOW_TO_INTEGRATE_PROTOCOL.md)** - Guide for adding new protocols
- **[Documentation Index](./docs/README.md)** - Full documentation index

Full documentation also available at: https://defibrain.oxg.fi/docs.html

## License

MIT License - This SDK is open source.

## Support

- Documentation: https://defibrain.oxg.fi/docs.html
- Discord: https://discord.gg/TU724DzWpV
- Website: https://defibrain.oxg.fi
