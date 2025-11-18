# DefiBrain SDK - Configuration

Configuration guide for the DefiBrain SDK.

## Environment Variables

Create a `.env` file in your project root:

```bash
DEFIBRAIN_API_KEY=your-api-key-here
DEFIBRAIN_API_URL=https://backend-production-a565a.up.railway.app/v1
DEFIBRAIN_CHAIN_ID=1
```

## Initialization Options

### Basic Configuration

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

const client = new DefiBrainClient({
  apiKey: 'your-api-key',
});
```

### Full Configuration

```typescript
const client = new DefiBrainClient({
  apiKey: process.env.DEFIBRAIN_API_KEY!,
  apiUrl: 'https://backend-production-a565a.up.railway.app/v1', // Optional, defaults to production
  chainId: 1, // Optional, defaults to Ethereum mainnet (1)
});
```

## Configuration Options

### `apiKey` (required)
Your DefiBrain API key. Get one at https://defibrain.oxg.fi/api-register.html

### `apiUrl` (optional)
API endpoint URL. Defaults to `https://backend-production-a565a.up.railway.app/v1`

**Available endpoints:**
- Production: `https://backend-production-a565a.up.railway.app/v1`
- Local: `http://localhost:3000/v1` (for development)

### `chainId` (optional)
Blockchain network ID. Defaults to `1` (Ethereum Mainnet)

**Supported chains:**
- `1` - Ethereum Mainnet
- `137` - Polygon (coming soon)
- `42161` - Arbitrum (coming soon)
- `8453` - Base (coming soon)

## Getting an API Key

1. Visit https://defibrain.oxg.fi/api-register.html
2. Fill in your details (name, email, company)
3. Get your free API key instantly (100 API calls/day)
4. Copy and store securely

## Security Best Practices

1. **Never commit API keys to Git**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   ```

2. **Use environment variables**
   ```typescript
   // Good
   const client = new DefiBrainClient({
     apiKey: process.env.DEFIBRAIN_API_KEY!,
   });

   // Bad - Never do this
   const client = new DefiBrainClient({
     apiKey: 'sk_live_1234567890abcdef',
   });
   ```

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys that are no longer used

4. **Use different keys for different environments**
   - Development key for testing
   - Production key for live applications

## Error Configuration

The SDK throws errors that you should handle:

```typescript
try {
  const result = await client.optimizeYield({...});
} catch (error: any) {
  // Handle different error types
  if (error.message.includes('401')) {
    // Invalid API key
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
  } else if (error.message.includes('500')) {
    // Server error
  }
}
```

## TypeScript Configuration

The SDK includes full TypeScript definitions. No additional configuration needed.

```typescript
import { DefiBrainClient, OptimizeYieldResponse } from '@defibrain/sdk';

// Types are automatically available
const result: OptimizeYieldResponse = await client.optimizeYield({...});
```

## Browser vs Node.js

### Node.js
Works out of the box:

```typescript
import { DefiBrainClient } from '@defibrain/sdk';
// Ready to use
```

### Browser
If using in browser, ensure fetch is available (modern browsers have it):

```typescript
// For older browsers, you might need a polyfill
import 'whatwg-fetch'; // If needed
import { DefiBrainClient } from '@defibrain/sdk';
```

## Next Steps

- See [API.md](./API.md) for complete API reference
- See [EXAMPLES.md](./EXAMPLES.md) for usage examples
- Visit https://defibrain.oxg.fi/docs.html for full documentation

