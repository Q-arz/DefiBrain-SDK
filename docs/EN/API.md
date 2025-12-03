# DefiBrain SDK - API Reference

Complete API reference for the DefiBrain SDK.

## Installation

```bash
npm install @defibrain/sdk
```

## Initialization

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

const client = new DefiBrainClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://backend-production-a565a.up.railway.app/v1', // Optional
  chainId: 1, // Optional, defaults to Ethereum mainnet
});
```

## Methods

### `optimizeYield(request: OptimizeYieldRequest): Promise<OptimizeYieldResponse>`

Automatically finds the best protocol and strategy for yield optimization.

**Parameters:**
- `asset` (string): Token address (e.g., USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`)
- `amount` (string): Amount in smallest unit (e.g., `"1000000"` for 1 USDC)
- `strategy` (optional): `"max_yield"` | `"min_risk"` | `"balanced"` | `"low_gas"`
- `minAPR` (optional): Minimum APR threshold
- `maxRisk` (optional): `"low"` | `"medium"` | `"high"`

**Returns:**
```typescript
{
  protocol: string;           // Best protocol (e.g., "aave", "morpho")
  action: string;             // Action to execute
  params: Record<string, any>; // Action parameters
  estimatedAPR: number;        // Estimated APR percentage
  estimatedGas: string;       // Estimated gas cost
  riskLevel: "low" | "medium" | "high";
  confidence: number;         // Confidence score (0-1)
  transaction?: {             // Ready-to-sign transaction
    to: string;
    data: string;
    value?: string;
  };
}
```

**Example:**
```typescript
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000', // 1 USDC
  strategy: 'max_yield',
  maxRisk: 'medium'
});

console.log(`Best protocol: ${result.protocol}`);
console.log(`Estimated APR: ${result.estimatedAPR}%`);
```

---

### `findOptimalSwap(request: FindSwapRequest): Promise<FindSwapResponse>`

Finds the optimal swap route between two tokens.

**Parameters:**
- `tokenIn` (string): Input token address
- `tokenOut` (string): Output token address
- `amount` (string): Amount to swap
- `slippage` (optional): Maximum slippage percentage (default: 0.5)
- `preferProtocol` (optional): Preferred protocol (e.g., `"1inch"`, `"curve"`, `"uniswap"`)
- `oneInchApiKey` (optional): 1inch API key. If provided, the backend will try to use 1inch for this request. If omitted, 1inch will be skipped and internal DEX routes (Uniswap, Curve, etc.) will be used.

**Returns:**
```typescript
{
  protocol: string;
  route: {
    fromToken: string;
    toToken: string;
    amount: string;
    estimatedAmount: string;
    protocols: string[];
  };
  estimatedGas: string;
  transaction?: {
    to: string;
    data: string;
    value?: string;
  };
}
```

**Example:**
```typescript
const swap = await client.findOptimalSwap({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  amount: '1000000', // 1 USDC
  slippage: 0.5,
  // Optional: use 1inch only when the user provides an API key
  oneInchApiKey: process.env.ONEINCH_API_KEY, // or user-provided key
});
```

---

### `executeAction(request: ExecuteActionRequest): Promise<ExecuteActionResponse>`

Executes an action on a specific protocol.

**Parameters:**
- `protocol` (string): Protocol name (e.g., "aave", "curve", "pendle")
- `action` (string): Action to execute (e.g., "supply", "withdraw", "swap")
- `params` (Record<string, any>): Action-specific parameters

**Returns:**
```typescript
{
  transactionHash: string;
  protocol: string;
  action: string;
  status: "pending" | "confirmed" | "failed";
}
```

**Example:**
```typescript
const result = await client.executeAction({
  protocol: 'aave',
  action: 'supply',
  params: {
    asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '1000000'
  }
});
```

---

### `getAvailableProtocols(action: string): Promise<string[]>`

Gets list of available protocols for a specific action.

**Parameters:**
- `action` (string): Action type (e.g., "supply", "swap", "lend")

**Returns:**
```typescript
string[] // Array of protocol names
```

**Example:**
```typescript
const protocols = await client.getAvailableProtocols('supply');
// Returns: ['aave', 'morpho', 'pendle']
```

---

### `healthCheck(): Promise<HealthCheckResponse>`

Checks the health status of the API.

**Returns:**
```typescript
{
  status: "healthy" | "degraded" | "down";
  version: string;
  protocols: string[];
  uptime: number;
}
```

**Example:**
```typescript
const health = await client.healthCheck();
console.log(`API Status: ${health.status}`);
console.log(`Available protocols: ${health.protocols.join(', ')}`);
```

---

### `getUsageStats(): Promise<UsageStats>`

Gets API usage statistics for the current API key.

**Returns:**
```typescript
{
  callsToday: number;
  callsThisMonth: number;
  limit: number;
  resetDate: string;
}
```

**Example:**
```typescript
const stats = await client.getUsageStats();
console.log(`Calls today: ${stats.callsToday}/${stats.limit}`);
```

---

## Error Handling

All methods throw errors on failure:

```typescript
try {
  const result = await client.optimizeYield({
    asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    amount: '1000000'
  });
} catch (error) {
  console.error('Error:', error.message);
  // Handle error (rate limit, invalid API key, etc.)
}
```

## Supported Protocols

- **Pendle**: Yield derivatives (PT/YT)
- **Curve**: Stable liquidity pools
- **1inch**: Optimal swap routing
- **Aave V3**: Lending and borrowing
- **Morpho Blue**: Optimized lending

## Supported Chains

- Ethereum Mainnet (chainId: 1)
- More chains coming soon

## Rate Limits

Rate limits depend on your plan:
- **Free**: 100 calls/day
- **Professional**: 10,000 calls/day
- **Enterprise**: Unlimited

Check your usage with `getUsageStats()`.

---

---

## SDK Helpers

The SDK includes powerful helpers to simplify common operations.

### WalletHelper

Connect to MetaMask or other Web3 wallets and manage wallet state.

```typescript
import { WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();

// Connect wallet
const walletInfo = await wallet.connect();
console.log(`Connected: ${walletInfo.address}`);

// Get balances
const ethBalance = await wallet.getBalance();
const usdcBalance = await wallet.getTokenBalance('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
```

**Methods:**
- `connect(): Promise<WalletInfo>` - Connect to MetaMask or injected wallet
- `getWalletInfo(): Promise<WalletInfo | null>` - Get current wallet info without requesting connection
- `getBalance(): Promise<string>` - Get native token balance (ETH) in wei
- `getTokenBalance(tokenAddress: string): Promise<string>` - Get ERC-20 token balance
- `getProvider(): WalletProvider | null` - Get the wallet provider instance
- `getChainId(): number` - Get current chain ID

---

### TransactionHelper

Sign and send transactions directly to the blockchain without going through the backend.

```typescript
import { TransactionHelper, WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());

// Sign and send transaction
if (result.transaction) {
  const txHash = await txHelper.signAndSend(result.transaction);
  const receipt = await txHelper.waitForConfirmation(txHash);
}
```

**Methods:**
- `signAndSend(tx: TransactionRequest): Promise<string>` - Sign and send a transaction. Returns transaction hash.
- `waitForConfirmation(txHash: string, confirmations?: number): Promise<TransactionReceipt>` - Wait for transaction confirmation
- `signSendAndWait(tx: TransactionRequest, confirmations?: number): Promise<TransactionReceipt>` - Sign, send, and wait for confirmation in one call
- `estimateGas(tx: TransactionRequest): Promise<string>` - Estimate gas cost for a transaction
- `getGasPrice(): Promise<string>` - Get current gas price

---

### PendleHelper

Protocol-specific helpers for Pendle PT/YT operations.

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
  '1000000',
  'max_yield'
);
```

**Methods:**
- `optimizeYieldWithPendle(asset: string, amount: string, strategy?: string): Promise<OptimizeYieldResponse>` - Find best Pendle yield opportunities
- `swapPTtoYT(market: string, amount: string, execute?: boolean): Promise<any>` - Swap Principal Token (PT) to Yield Token (YT)
- `swapYTtoPT(market: string, amount: string, execute?: boolean): Promise<any>` - Swap Yield Token (YT) to Principal Token (PT)
- `redeemPT(market: string, amount: string, execute?: boolean): Promise<any>` - Redeem Principal Token (PT) at maturity
- `getPTInfo(ptAddress: string): Promise<PendlePTInfo>` - Get information about a Pendle PT token
- `getYTInfo(ytAddress: string): Promise<PendleYTInfo>` - Get information about a Pendle YT token

---

### AaveHelper

Protocol-specific helpers for Aave V3 lending and borrowing operations.

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
  '1000000',
  false // Don't execute, just prepare
);
```

**Methods:**
- `supply(asset: string, amount: string, execute?: boolean): Promise<any>` - Supply assets to Aave V3
- `withdraw(asset: string, amount: string, execute?: boolean): Promise<any>` - Withdraw assets from Aave V3
- `borrow(asset: string, amount: string, execute?: boolean): Promise<any>` - Borrow assets from Aave V3
- `repay(asset: string, amount: string, execute?: boolean): Promise<any>` - Repay borrowed assets to Aave V3

---

### Validation Helpers

Utility functions for validating addresses and amounts.

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

**Functions:**
- `validateAddress(address: string, name?: string): boolean` - Validate Ethereum address format
- `validateAmount(amount: string, name?: string): boolean` - Validate amount is a valid number string
- `formatAmount(amount: string, decimals: number): string` - Format amount from wei to readable format
- `parseAmount(amount: string, decimals: number): string` - Parse amount from readable format to wei

---

**For more examples, see [EXAMPLES.md](./EXAMPLES.md)**

