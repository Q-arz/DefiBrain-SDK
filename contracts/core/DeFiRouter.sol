// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDeFiRouter.sol";
import "../interfaces/IPermissionManager.sol";
import "../interfaces/IAssetRegistry.sol";

/**
 * @title DeFiRouter
 * @notice Router principal que ejecuta acciones en diferentes protocolos DeFi
 * @dev Actúa como punto de entrada unificado para todos los protocolos
 */
contract DeFiRouter is IDeFiRouter {
    // Mapeo de protocolId => adapter address
    mapping(string => address) private adapters;

    // PermissionManager para control de acceso
    IPermissionManager public permissionManager;

    // AssetRegistry para validación de assets
    IAssetRegistry public assetRegistry;

    // Admin del contrato
    address public admin;

    // Modifier para verificar que solo el admin puede ejecutar
    modifier onlyAdmin() {
        require(msg.sender == admin, "DeFiRouter: Only admin");
        _;
    }

    // Modifier para verificar permisos
    modifier hasExecutePermission() {
        require(
            permissionManager.hasPermission(
                msg.sender,
                IPermissionManager.Permission.EXECUTE_ACTION
            ),
            "DeFiRouter: Insufficient permissions"
        );
        _;
    }

    /**
     * @notice Constructor
     * @param _permissionManager Dirección del PermissionManager
     * @param _assetRegistry Dirección del AssetRegistry
     */
    constructor(address _permissionManager, address _assetRegistry) {
        require(
            _permissionManager != address(0),
            "DeFiRouter: Invalid permission manager address"
        );
        require(
            _assetRegistry != address(0),
            "DeFiRouter: Invalid asset registry address"
        );

        admin = msg.sender;
        permissionManager = IPermissionManager(_permissionManager);
        assetRegistry = IAssetRegistry(_assetRegistry);
    }

    /**
     * @notice Ejecuta una acción en un protocolo específico
     * @param protocolId Identificador del protocolo
     * @param action Acción a ejecutar
     * @param params Parámetros codificados para la acción
     * @return success Indica si la acción se ejecutó exitosamente
     * @return data Datos de retorno de la acción
     */
    function executeAction(
        string calldata protocolId,
        string calldata action,
        bytes calldata params
    ) external hasExecutePermission returns (bool success, bytes memory data) {
        // Verificar que el protocolo está registrado
        address adapterAddress = adapters[protocolId];
        require(
            adapterAddress != address(0),
            "DeFiRouter: Protocol not registered"
        );

        // Llamar al adapter
        // Nota: Los adapters deben implementar una interfaz estándar
        // Por ahora, usamos una llamada genérica de bajo nivel
        (success, data) = adapterAddress.call(
            abi.encodeWithSignature(
                "execute(string,bytes)",
                action,
                params
            )
        );

        // Si la llamada falló, revertir
        if (!success) {
            // Intentar decodificar el mensaje de error
            if (data.length > 0) {
                assembly {
                    let returndata_size := mload(data)
                    revert(add(32, data), returndata_size)
                }
            } else {
                revert("DeFiRouter: Action execution failed");
            }
        }

        emit ActionExecuted(msg.sender, protocolId, action, params, success);
    }

    /**
     * @notice Ejecuta múltiples acciones en una sola transacción (FASE 6)
     * @param actions Array de acciones a ejecutar
     * @return successes Array de resultados de éxito para cada acción
     * @return results Array de datos de retorno para cada acción
     */
    function executeBatch(
        Action[] calldata actions
    ) external hasExecutePermission returns (bool[] memory successes, bytes[] memory results) {
        require(actions.length > 0, "DeFiRouter: Actions array cannot be empty");
        require(actions.length <= 20, "DeFiRouter: Maximum 20 actions per batch");

        successes = new bool[](actions.length);
        results = new bytes[](actions.length);
        uint256 successCount = 0;

        for (uint256 i = 0; i < actions.length; i++) {
            // Verificar que el protocolo está registrado
            address adapterAddress = adapters[actions[i].protocolId];
            if (adapterAddress == address(0)) {
                successes[i] = false;
                results[i] = abi.encode("DeFiRouter: Protocol not registered");
                emit ActionExecuted(
                    msg.sender,
                    actions[i].protocolId,
                    actions[i].action,
                    actions[i].params,
                    false
                );
                continue;
            }

            // Ejecutar acción
            (bool success, bytes memory data) = adapterAddress.call(
                abi.encodeWithSignature(
                    "execute(string,bytes)",
                    actions[i].action,
                    actions[i].params
                )
            );

            successes[i] = success;
            results[i] = data;

            if (success) {
                successCount++;
            }

            emit ActionExecuted(
                msg.sender,
                actions[i].protocolId,
                actions[i].action,
                actions[i].params,
                success
            );
        }

        emit BatchExecuted(msg.sender, actions.length, successCount);
    }

    /**
     * @notice Registra un adapter para un protocolo
     * @param protocolId Identificador del protocolo
     * @param adapterAddress Dirección del contrato adapter
     */
    function registerAdapter(
        string calldata protocolId,
        address adapterAddress
    ) external onlyAdmin {
        require(
            adapterAddress != address(0),
            "DeFiRouter: Invalid adapter address"
        );
        require(
            bytes(protocolId).length > 0,
            "DeFiRouter: Protocol ID is required"
        );

        // Verificar permisos para registrar adapters
        require(
            permissionManager.hasPermission(
                msg.sender,
                IPermissionManager.Permission.REGISTER_ADAPTER
            ) || msg.sender == admin,
            "DeFiRouter: Insufficient permissions to register adapter"
        );

        adapters[protocolId] = adapterAddress;

        emit AdapterRegistered(protocolId, adapterAddress);
    }

    /**
     * @notice Obtiene la dirección del adapter para un protocolo
     * @param protocolId Identificador del protocolo
     * @return adapterAddress Dirección del adapter, o address(0) si no está registrado
     */
    function getAdapter(
        string calldata protocolId
    ) external view returns (address adapterAddress) {
        return adapters[protocolId];
    }

    /**
     * @notice Verifica si un protocolo está registrado
     * @param protocolId Identificador del protocolo
     * @return isRegistered true si el protocolo está registrado
     */
    function isProtocolRegistered(
        string calldata protocolId
    ) external view returns (bool isRegistered) {
        return adapters[protocolId] != address(0);
    }

    /**
     * @notice Cambia el admin del contrato
     * @param newAdmin Nueva dirección del admin
     */
    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "DeFiRouter: Invalid admin address");
        admin = newAdmin;
    }
}

