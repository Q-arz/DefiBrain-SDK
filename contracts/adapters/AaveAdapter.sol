// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AaveAdapter
 * @notice Adapter para interactuar con Aave V3
 * @dev Delega llamadas directamente al Aave Pool
 * 
 * Este adapter implementa la interfaz estándar para ser usado con DeFiRouter.
 * Los adapters deben implementar la función execute(string, bytes) que el router llama.
 */
contract AaveAdapter {
    // Aave V3 Pool address
    // Sepolia: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951 (Aave V3 Pool Sepolia)
    // Mainnet: 0x87870Bca3F3fD6335C3F4ce8392A6935B6a4e771
    address public immutable AAVE_POOL;
    
    constructor(address _aavePool) {
        require(_aavePool != address(0), "AaveAdapter: Invalid pool address");
        AAVE_POOL = _aavePool;
    }
    
    /**
     * @notice Ejecuta una acción en Aave
     * @param action Acción a ejecutar (supply, withdraw, borrow, repay)
     * @param params Parámetros codificados de la acción
     * @return success true si la ejecución fue exitosa
     * @return data Datos de retorno de la ejecución
     * 
     * @dev Esta función es llamada por el DeFiRouter cuando se ejecuta una acción.
     * Los adapters deben implementar esta interfaz estándar.
     */
    function execute(
        string calldata action,
        bytes calldata params
    ) external returns (bool success, bytes memory data) {
        bytes32 actionHash = keccak256(bytes(action));
        
        if (actionHash == keccak256(bytes("supply"))) {
            // supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
            (address asset, uint256 amount, address onBehalfOf) = 
                abi.decode(params, (address, uint256, address));
            
            (success, data) = AAVE_POOL.call(
                abi.encodeWithSignature(
                    "supply(address,uint256,address,uint16)",
                    asset,
                    amount,
                    onBehalfOf,
                    0
                )
            );
        } else if (actionHash == keccak256(bytes("withdraw"))) {
            // withdraw(address asset, uint256 amount, address to)
            (address asset, uint256 amount, address to) = 
                abi.decode(params, (address, uint256, address));
            
            (success, data) = AAVE_POOL.call(
                abi.encodeWithSignature(
                    "withdraw(address,uint256,address)",
                    asset,
                    amount,
                    to
                )
            );
        } else if (actionHash == keccak256(bytes("borrow"))) {
            // borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
            (address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) = 
                abi.decode(params, (address, uint256, uint256, address));
            
            (success, data) = AAVE_POOL.call(
                abi.encodeWithSignature(
                    "borrow(address,uint256,uint256,uint16,address)",
                    asset,
                    amount,
                    interestRateMode,
                    0,
                    onBehalfOf
                )
            );
        } else if (actionHash == keccak256(bytes("repay"))) {
            // repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)
            (address asset, uint256 amount, uint256 rateMode, address onBehalfOf) = 
                abi.decode(params, (address, uint256, uint256, address));
            
            (success, data) = AAVE_POOL.call(
                abi.encodeWithSignature(
                    "repay(address,uint256,uint256,address)",
                    asset,
                    amount,
                    rateMode,
                    onBehalfOf
                )
            );
        } else {
            revert("AaveAdapter: Unknown action");
        }
    }
}

