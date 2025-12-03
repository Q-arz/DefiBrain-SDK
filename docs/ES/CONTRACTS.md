# 📄 Contratos - DefiBrain SDK

Este SDK incluye los contratos inteligentes core de DefiBrain para que los usuarios puedan interactuar directamente con el `DeFiRouter` en modo "managed".

## 📂 Estructura

```
sdk/
├── contracts/          # Código fuente de los contratos (Solidity)
│   ├── core/
│   │   ├── DeFiRouter.sol
│   │   ├── PermissionManager.sol
│   │   └── AssetRegistry.sol
│   ├── adapters/       # Adapters de ejemplo
│   │   └── AaveAdapter.sol
│   └── interfaces/
│       ├── IDeFiRouter.sol
│       ├── IPermissionManager.sol
│       └── IAssetRegistry.sol
└── abis/              # ABIs generados (JSON)
    ├── DeFiRouter.json
    ├── PermissionManager.json
    ├── AssetRegistry.json
    ├── AaveAdapter.json
    └── index.ts
```

## 🔧 Uso de los ABIs

### Importar ABIs en TypeScript

```typescript
import { DeFiRouterABI } from '@defibrain/sdk/abis';
import { Interface } from 'ethers';

// Crear interfaz para interactuar con el contrato
const routerInterface = new Interface(DeFiRouterABI);

// Codificar llamada a executeAction
const data = routerInterface.encodeFunctionData("executeAction", [
  "aave",
  "supply",
  "0x..." // params encoded as bytes
]);
```

### Usar con ethers.js

```typescript
import { DeFiRouterABI } from '@defibrain/sdk/abis';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider("...");
const routerAddress = "0x..."; // Dirección del DeFiRouter desplegado

const router = new ethers.Contract(routerAddress, DeFiRouterABI, provider);

// Llamar a una función
const adapter = await router.getAdapter("aave");
```

## 🔄 Actualizar Contratos

Los contratos se sincronizan automáticamente desde el repo principal. Para actualizarlos manualmente:

```bash
# Desde la raíz del proyecto
npm run sync:contracts:sdk
```

Este comando:
1. Compila los contratos en el repo principal
2. Copia los contratos actualizados al SDK
3. Genera los ABIs actualizados
4. Los guarda en `sdk/abis/`

## 📝 Contratos Incluidos

### DeFiRouter
Router principal que ejecuta acciones en diferentes protocolos DeFi.

**Funciones principales:**
- `executeAction(protocolId, action, params)` - Ejecuta una acción
- `executeBatch(actions[])` - Ejecuta múltiples acciones en batch
- `registerAdapter(protocolId, adapterAddress)` - Registra un adapter
- `getAdapter(protocolId)` - Obtiene la dirección del adapter

### PermissionManager
Gestión de permisos y control de acceso basado en roles.

**Funciones principales:**
- `assignRole(user, role)` - Asigna un rol a un usuario
- `hasPermission(user, permission)` - Verifica permisos
- `addToWhitelist(user)` / `addToBlacklist(user)` - Control de acceso

### AssetRegistry
Registro centralizado de assets soportados.

**Funciones principales:**
- `registerAsset(asset)` - Registra un nuevo asset
- `getAsset(tokenAddress, chainId)` - Obtiene información de un asset
- `getAssetsByProtocol(protocol)` - Lista assets por protocolo

### AaveAdapter
Adapter de ejemplo para interactuar con Aave V3. Muestra cómo implementar un adapter compatible con DeFiRouter.

**Funciones principales:**
- `execute(action, params)` - Ejecuta una acción en Aave (supply, withdraw, borrow, repay)

**Nota:** Este es un ejemplo de implementación. Puedes crear tus propios adapters siguiendo este patrón.

## 🔌 Crear Adapters Personalizados

Para crear un adapter personalizado, implementa la función `execute(string, bytes)`:

```solidity
contract MyCustomAdapter {
    function execute(
        string calldata action,
        bytes calldata params
    ) external returns (bool success, bytes memory data) {
        // Tu lógica aquí
        // Decodifica params según la acción
        // Llama al protocolo correspondiente
        // Retorna success y data
    }
}
```

Luego regístralo en el DeFiRouter:
```solidity
router.registerAdapter("my-protocol", myAdapterAddress);
```

## 🚀 Deployment

Los contratos deben desplegarse en la blockchain antes de usar el modo "managed". Ver documentación de deployment en el repo principal.

## 📚 Más Información

- **Código fuente**: `sdk/contracts/`
- **ABIs**: `sdk/abis/`
- **Documentación**: Ver repo principal `docs/CONTRACTS_IMPLEMENTATION.md`


