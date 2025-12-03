# DefiBrain SDK - Helpers Reference

The SDK includes several helper classes to simplify common tasks:

- Wallet & transactions
  - `WalletHelper`
  - `TransactionHelper`
- Protocol helpers
  - `PendleHelper`
  - `AaveHelper`
  - `UniswapHelper`
  - `OneInchHelper`
  - `CurveHelper`
  - `MorphoHelper`
- Utilities
  - Validation helpers
  - `PortfolioHelper` (experimental)

> Note: This document focuses on helpers. Core API methods are documented in `API.md`.

---

## WalletHelper

Connect to MetaMask or other injected wallets and manage wallet state.

```ts
import { WalletHelper } from '@defibrain/sdk';

const wallet = new WalletHelper();

// Connect wallet
const walletInfo = await wallet.connect();
console.log(`Connected: ${walletInfo.address}`);

// Get balances
const ethBalance = await wallet.getBalance();
const usdcBalance = await wallet.getTokenBalance('0xA0b8...eB48');
```

**Key methods:**

- `connect(): Promise<WalletInfo>` – Request connection to wallet.
- `getWalletInfo(): Promise<WalletInfo | null>` – Current wallet info without prompting.
- `getBalance(): Promise<string>` – Native token balance (ETH) in wei.
- `getTokenBalance(tokenAddress: string): Promise<string>` – ERC‑20 balance.
- `getProvider(): WalletProvider | null` – Underlying provider.
- `getChainId(): number` – Current chain ID.

---

## TransactionHelper

Sign and send transactions directly to the blockchain.

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

**Key methods:**

- `signAndSend(tx: TransactionRequest): Promise<string>` – Sign & send, returns tx hash.
- `waitForConfirmation(txHash: string, confirmations?: number): Promise<TransactionReceipt>`
- `signSendAndWait(tx: TransactionRequest, confirmations?: number): Promise<TransactionReceipt>`
- `estimateGas(tx: TransactionRequest): Promise<string>`
- `getGasPrice(): Promise<string>`

---

## PendleHelper

High‑level interface for Pendle PT/YT operations.

```ts
import { DefiBrainClient, PendleHelper, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
const pendleHelper = new PendleHelper(client, txHelper);

const result = await pendleHelper.optimizeYieldWithPendle(
  '0xA0b8...eB48', // USDC
  '1000000',
  'max_yield',
);
```

**Key methods:**

- `optimizeYieldWithPendle(asset, amount, strategy?)`
- `swapPTtoYT(market, amount, execute?)`
- `swapYTtoPT(market, amount, execute?)`
- `redeemPT(market, amount, execute?)`
- `getPTInfo(ptAddress)`
- `getYTInfo(ytAddress)`

---

## AaveHelper

Simplified access to Aave V3 lending/borrowing.

```ts
import { DefiBrainClient, AaveHelper, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
const aaveHelper = new AaveHelper(client, txHelper);

const supplyResult = await aaveHelper.supply(
  '0xA0b8...eB48', // USDC
  '1000000',
  false,
);
```

**Key methods:**

- `supply(asset, amount, execute?)`
- `withdraw(asset, amount, execute?)`
- `borrow(asset, amount, execute?)`
- `repay(asset, amount, execute?)`

---

## UniswapHelper

Helpers for swaps routed through **Uniswap v3**.

```ts
import { DefiBrainClient, UniswapHelper, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const client = new DefiBrainClient({ apiKey: 'your-key' });
const wallet = new WalletHelper();
await wallet.connect();

const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
const uniswap = new UniswapHelper(client, txHelper);

const swap = await uniswap.swap(
  tokenIn,
  tokenOut,
  '1000000',
  { slippage: 0.5, execute: true },
);
```

**Key methods:**

- `setTransactionHelper(txHelper)`
- `findOptimalSwap(tokenIn, tokenOut, amount, slippage?)`
- `swap(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

## OneInchHelper

Helpers for swaps routed through **1inch**.

Usage is analogous to `UniswapHelper`, but forcing `preferProtocol: "1inch"` under the hood.

**Key methods:**

- `setTransactionHelper(txHelper)`
- `findOptimalSwap(tokenIn, tokenOut, amount, slippage?)`
- `swap(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

## CurveHelper

Helpers for **Curve** stablecoin swaps.

```ts
import { CurveHelper, DefiBrainClient, TransactionHelper, WalletHelper } from '@defibrain/sdk';

const curve = new CurveHelper(client, txHelper);

const swap = await curve.swapStable(
  usdc,
  usdt,
  '1000000',
  { slippage: 0.5, execute: true },
);
```

**Key methods:**

- `setTransactionHelper(txHelper)`
- `findOptimalStableSwap(tokenIn, tokenOut, amount, slippage?)`
- `swapStable(tokenIn, tokenOut, amount, { slippage?, execute?, existingRoute? })`

---

## MorphoHelper

Thin wrapper over `DefiBrainClient` for **Morpho Blue** operations.

**Key operations (each with `execute?: boolean` to auto‑send tx using `TransactionHelper`):**

- `supply(marketId, assets, onBehalfOf?, execute?)`
- `withdraw(marketId, assets, receiver?, onBehalfOf?, execute?)`
- `borrow(marketId, assets, receiver?, onBehalfOf?, execute?)`
- `repay(marketId, assets, onBehalfOf?, execute?)`

See the source in `src/helpers/MorphoHelper.ts` for full parameter typings.

---

## Validation Helpers

Utility functions for addresses and amounts.

```ts
import { validateAddress, validateAmount, formatAmount, parseAmount } from '@defibrain/sdk';
```

**Functions:**

- `validateAddress(address, name?)`
- `validateAmount(amount, name?)`
- `formatAmount(amount, decimals)`
- `parseAmount(amount, decimals)`

---

## PortfolioHelper (experimental)

Aggregates balances and (in the future) exposure by protocol.

- `getTokenBalances(tokens: string[]): Promise<{ token: string; balance: string; }[]>`
- `getProtocolExposure(...)` – **NOT implemented yet**, throws if called (waiting for backend support).


