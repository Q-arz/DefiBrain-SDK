# DefiBrain SDK Documentation

Complete documentation for the DefiBrain SDK.

## 📚 Documentation Index

- **[API Reference](./API.md)** - Complete API documentation
- **[Examples](./EXAMPLES.md)** - Usage examples and code samples
- **[Configuration](./CONFIGURATION.md)** - Setup and configuration guide

## 🚀 Quick Start

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

const client = new DefiBrainClient({
  apiKey: 'your-api-key',
});

const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000',
  strategy: 'max_yield'
});
```

## 📖 What is DefiBrain?

DefiBrain is a unified DeFi router that integrates multiple protocols (Pendle, Curve, 1inch, Aave V3, Morpho Blue) into a single intelligent API.

**Key Benefits:**
- ✅ One API call replaces 15+ integrations
- ✅ Automatic yield optimization
- ✅ Optimal swap routing
- ✅ Multi-protocol strategies

## 🔗 Resources

- **Main Documentation**: https://docs.defibrain.io
- **GitHub Repository**: https://github.com/Q-arz/DefiBrain-SDK
- **Support**: support@defibrain.io
- **Discord**: https://discord.gg/defibrain

## 📝 License

MIT License - This SDK is open source.

---

**Last Updated**: [Date]

