# DefiBrain SDK – Helpers (ES)

Esta página resume todos los *helpers* del SDK.  
La referencia completa en inglés está en `../EN/HELPERS.md`.

---

## Helpers de Wallet y Transacciones

### `WalletHelper`

Encargado de conectar la wallet (MetaMask u otra inyectada) y leer balances.

```ts
import { WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();

// Conectar wallet
const info = await wallet.connect();
console.log(info.address);

// Balances
const ethBalance = await wallet.getBalance();
const usdcBalance = await wallet.getTokenBalance('0x...USDC');
```

**Métodos principales:**

- `connect()` – Solicita conexión a la wallet.
- `getWalletInfo()` – Devuelve info de la wallet actual (o `null` si no está conectada).
- `getBalance()` – Balance de la moneda nativa (ETH) en wei.
- `getTokenBalance(token)` – Balance de un ERC‑20.
- `getProvider()` – Provider interno (para usar con otras libs).
- `getChainId()` – Chain ID actual.

---

### `TransactionHelper`

Envía transacciones directamente a la blockchain usando el provider de la wallet.

```ts
import { TransactionHelper, WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());

if (result.transaction) {
  const txHash = await txHelper.signAndSend(result.transaction);
  const receipt = await txHelper.waitForConfirmation(txHash);
}
```

**Métodos principales:**

- `signAndSend(tx)` – Firma y envía una tx, devuelve el hash.
- `waitForConfirmation(txHash, confirmations?)` – Espera confirmaciones.
- `signSendAndWait(tx, confirmations?)` – Firma, envía y espera en una sola llamada.
- `estimateGas(tx)` – Estima el gas de una tx.
- `getGasPrice()` – Lee el gas price actual.

---

## Helpers por Protocolo

Todos siguen el mismo patrón:

- Reciben un `DefiBrainClient` y un `TransactionHelper`.
- Tienen parámetros `execute?: boolean` para decidir si sólo preparar la tx o también enviarla.

### `PendleHelper`

Operaciones PT/YT de Pendle (optimizar yield, swaps, redeem).

**Métodos clave:**

- `optimizeYieldWithPendle(asset, amount, strategy?)`
- `swapPTtoYT(market, amount, execute?)`
- `swapYTtoPT(market, amount, execute?)`
- `redeemPT(market, amount, execute?)`

---

### `AaveHelper`

Lending/borrowing en Aave V3.

**Métodos clave:**

- `supply(asset, amount, execute?)`
- `withdraw(asset, amount, execute?)`
- `borrow(asset, amount, execute?)`
- `repay(asset, amount, execute?)`

---

### `UniswapHelper`

Swaps usando Uniswap v3 (forzando Uniswap como protocolo preferido).

**Métodos clave:**

- `findOptimalSwap(tokenIn, tokenOut, amount, slippage?)`
- `swap(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

### `OneInchHelper`

Swaps usando el agregador de 1inch.

**Métodos clave:**

- `findOptimalSwap(tokenIn, tokenOut, amount, slippage?)`
- `swap(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

### `CurveHelper`

Swaps de *stablecoins* con Curve.

**Métodos clave:**

- `findOptimalStableSwap(tokenIn, tokenOut, amount, slippage?)`
- `swapStable(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

### `MorphoHelper`

Operaciones en Morpho Blue: *supply, withdraw, borrow, repay* sobre un `marketId`.

**Métodos clave:**

- `supply(marketId, assets, onBehalfOf?, execute?)`
- `withdraw(marketId, assets, receiver?, onBehalfOf?, execute?)`
- `borrow(marketId, assets, receiver?, onBehalfOf?, execute?)`
- `repay(marketId, assets, onBehalfOf?, execute?)`

---

## Validation Helpers

Helpers de validación y formato de cantidades.

```ts
import { validateAddress, validateAmount, formatAmount, parseAmount } from '@defibrain/sdk';
```

- `validateAddress(address, name?)` – Valida formato de address.
- `validateAmount(amount, name?)` – Valida que la cantidad sea numérica.
- `formatAmount(amount, decimals)` – De wei → número legible.
- `parseAmount(amount, decimals)` – De número legible → wei.

---

## `PortfolioHelper` (experimental)

Permite agrupar balances de tokens de la wallet y, en el futuro, exposición por protocolo.

- `getTokenBalances(tokens[])` – Devuelve lista `{ token, balance }` para cada address de token.
- `getProtocolExposure(...)` – **No implementado todavía**, lanza error (requiere endpoints extra en backend). 


