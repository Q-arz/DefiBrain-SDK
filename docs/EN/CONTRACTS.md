# 📄 Contracts - DefiBrain SDK

This SDK includes the core smart contracts of DefiBrain so users can interact directly with the `DeFiRouter` in "managed" mode.

## 📂 Structure

```
sdk/
├── contracts/          # Contract source code (Solidity)
│   ├── core/
│   │   ├── DeFiRouter.sol
│   │   ├── PermissionManager.sol
│   │   └── AssetRegistry.sol
│   ├── adapters/      # Example adapters
│   │   └── AaveAdapter.sol
│   └── interfaces/
│       ├── IDeFiRouter.sol
│       ├── IPermissionManager.sol
│       └── IAssetRegistry.sol
└── abis/              # Generated ABIs (JSON)
    ├── DeFiRouter.json
    ├── PermissionManager.json
    ├── AssetRegistry.json
    ├── AaveAdapter.json
    └── index.ts
```

## 🔧 Using the ABIs

### Import ABIs in TypeScript

```typescript
import { DeFiRouterABI } from '@defibrain/sdk/abis';
import { Interface } from 'ethers';

// Create interface to interact with the contract
const routerInterface = new Interface(DeFiRouterABI);

// Encode call to executeAction
const data = routerInterface.encodeFunctionData("executeAction", [
  "aave",
  "supply",
  "0x..." // params encoded as bytes
]);
```

### Use with ethers.js

```typescript
import { DeFiRouterABI } from '@defibrain/sdk/abis';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("...");
const routerAddress = "0x..."; // Deployed DeFiRouter address

const router = new ethers.Contract(routerAddress, DeFiRouterABI, provider);

// Call a function
const adapter = await router.getAdapter("aave");
```

## 🔄 Updating Contracts

Contracts are automatically synchronized from the main repository. To update them manually:

```bash
# From the project root
npm run sync:contracts:sdk
```

This command:
1. Compiles contracts in the main repository
2. Copies updated contracts to the SDK
3. Generates updated ABIs
4. Saves them in `sdk/abis/`

## 📝 Included Contracts

### DeFiRouter
Main router that executes actions on different DeFi protocols.

**Main functions:**
- `executeAction(protocolId, action, params)` - Executes an action
- `executeBatch(actions[])` - Executes multiple actions in batch
- `registerAdapter(protocolId, adapterAddress)` - Registers an adapter
- `getAdapter(protocolId)` - Gets the adapter address

### PermissionManager
Permission management and access control based on roles.

**Main functions:**
- `assignRole(user, role)` - Assigns a role to a user
- `hasPermission(user, permission)` - Checks permissions
- `addToWhitelist(user)` / `addToBlacklist(user)` - Access control

### AssetRegistry
Centralized registry of supported assets.

**Main functions:**
- `registerAsset(asset)` - Registers a new asset
- `getAsset(tokenAddress, chainId)` - Gets asset information
- `getAssetsByProtocol(protocol)` - Lists assets by protocol

### AaveAdapter
Example adapter for interacting with Aave V3. Shows how to implement an adapter compatible with DeFiRouter.

**Main functions:**
- `execute(action, params)` - Executes an action on Aave (supply, withdraw, borrow, repay)

**Note:** This is an example implementation. You can create your own adapters following this pattern.

## 🔌 Creating Custom Adapters

To create a custom adapter, implement the `execute(string, bytes)` function:

```solidity
contract MyCustomAdapter {
    function execute(
        string calldata action,
        bytes calldata params
    ) external returns (bool success, bytes memory data) {
        // Your logic here
        // Decode params according to the action
        // Call the corresponding protocol
        // Return success and data
    }
}
```

Then register it in the DeFiRouter:
```solidity
router.registerAdapter("my-protocol", myAdapterAddress);
```

## 🚀 Deployment

Contracts must be deployed to the blockchain before using "managed" mode. See deployment documentation in the main repository.

## 📚 More Information

- **Source code**: `sdk/contracts/`
- **ABIs**: `sdk/abis/`
- **Documentation**: See main repository `docs/CONTRACTS_IMPLEMENTATION.md`
