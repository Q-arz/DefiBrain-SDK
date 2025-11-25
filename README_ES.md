# DefiBrain SDK

SDK oficial TypeScript/JavaScript para la API de DefiBrain - Un router DeFi unificado que integra múltiples protocolos (Pendle, Curve, 1inch, Aave V3, Morpho Blue) en una única API inteligente.

## Instalación

```bash
npm install @defibrain/sdk
```

## 📄 Contratos Inteligentes

Este SDK incluye los contratos inteligentes core de DefiBrain:

- **DeFiRouter** - Router principal para ejecutar acciones en batch
- **PermissionManager** - Control de permisos y acceso
- **AssetRegistry** - Registro de assets soportados
- **AaveAdapter** - Ejemplo de implementación de adapter

Los contratos están disponibles en:
- **Código fuente**: `contracts/` (Solidity)
- **ABIs**: `abis/` (JSON)

Ver [docs/CONTRACTS_ES.md](./docs/CONTRACTS_ES.md) para información detallada sobre cómo usar los contratos.

## Inicio Rápido

```typescript
import { DefiBrainClient } from '@defibrain/sdk';

// Inicializar cliente
const client = new DefiBrainClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://backend-production-a565a.up.railway.app/v1', // Opcional, por defecto producción
  chainId: 1, // Opcional, por defecto Ethereum mainnet
});

// Optimizar yield automáticamente
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000', // 1 USDC
  strategy: 'max_yield',
});

console.log(`Mejor protocolo: ${result.protocol}`);
console.log(`APR estimado: ${result.estimatedAPR}%`);

// Ejecutar la transacción
const tx = await client.executeAction({
  protocol: result.protocol,
  action: result.action,
  params: result.params,
});
```

## Uso Avanzado

### Integración de Wallet

```typescript
import { WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();

// Conectar wallet
const walletInfo = await wallet.connect();
console.log(`Conectado: ${walletInfo.address}`);

// Obtener balance
const balance = await wallet.getBalance();
console.log(`Balance: ${balance} wei`);

// Obtener balance de token
const usdcBalance = await wallet.getTokenBalance('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
console.log(`USDC: ${usdcBalance}`);
```

### Helper de Transacciones

```typescript
import { DefiBrainClient, TransactionHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());

// Optimizar yield
const result = await client.optimizeYield({
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  amount: '1000000',
});

// Firmar y enviar transacción
if (result.transaction) {
  const txHash = await txHelper.signAndSend(result.transaction);
  console.log(`Transacción enviada: ${txHash}`);
  
  // Esperar confirmación
  const receipt = await txHelper.waitForConfirmation(txHash);
  console.log(`Confirmada en bloque: ${receipt.blockNumber}`);
}
```

## Documentación Completa

Ver [docs/](./docs/) para documentación completa:
- [API.md](./docs/API.md) - Referencia de API
- [CONFIGURATION.md](./docs/CONFIGURATION.md) - Configuración
- [EXAMPLES.md](./docs/EXAMPLES.md) - Ejemplos de uso
- [CONTRACTS_ES.md](./docs/CONTRACTS_ES.md) - Documentación de contratos

## Licencia

MIT


