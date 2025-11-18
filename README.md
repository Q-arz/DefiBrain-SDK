# DefiBrain SDK

Official TypeScript/JavaScript SDK for the DefiBrain API - A unified DeFi router that integrates multiple protocols (Pendle, Curve, 1inch, Aave V3, Morpho Blue) into a single intelligent API.

## Installation

```bash
npm install @defibrain/sdk
```

## Quick Start

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

// Initialize client
const client = new DefiBrainClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://api.defibrain.io/v1', // Optional, defaults to production
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

## Features

- ✅ **Automatic Yield Optimization** - Finds the best protocol automatically
- ✅ **Optimal Swap Routing** - Best routes for token swaps
- ✅ **Multi-Protocol Support** - Pendle, Curve, 1inch, Aave, Morpho
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Simple API** - One call replaces 15+ integrations

## Documentation

Full documentation available at: https://docs.defibrain.io

## License

MIT License - This SDK is open source.

## Support

- Documentation: https://docs.defibrain.io
- Discord: https://discord.gg/defibrain
- Email: support@defibrain.io

