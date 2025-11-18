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
  apiUrl: 'https://api.defibrain.io/v1', // Optional
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
- `preferProtocol` (optional): Preferred protocol (e.g., "1inch", "curve")

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
  slippage: 0.5
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

**For more examples, see [EXAMPLES.md](./EXAMPLES.md)**

