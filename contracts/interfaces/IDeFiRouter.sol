// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDeFiRouter
 * @notice Interface para el DeFi Router que ejecuta acciones en diferentes protocolos
 */
interface IDeFiRouter {
    /**
     * @notice Ejecuta una acción en un protocolo específico
     * @param protocolId Identificador del protocolo (pendle, curve, 1inch, aave, morpho)
     * @param action Acción a ejecutar (supply, withdraw, borrow, repay, swap, etc.)
     * @param params Parámetros codificados para la acción
     * @return success Indica si la acción se ejecutó exitosamente
     * @return data Datos de retorno de la acción
     */
    function executeAction(
        string calldata protocolId,
        string calldata action,
        bytes calldata params
    ) external returns (bool success, bytes memory data);

    /**
     * @notice Registra un adapter para un protocolo
     * @param protocolId Identificador del protocolo
     * @param adapterAddress Dirección del contrato adapter
     */
    function registerAdapter(
        string calldata protocolId,
        address adapterAddress
    ) external;

    /**
     * @notice Obtiene la dirección del adapter para un protocolo
     * @param protocolId Identificador del protocolo
     * @return adapterAddress Dirección del adapter, o address(0) si no está registrado
     */
    function getAdapter(
        string calldata protocolId
    ) external view returns (address adapterAddress);

    /**
     * @notice Verifica si un protocolo está registrado
     * @param protocolId Identificador del protocolo
     * @return isRegistered true si el protocolo está registrado
     */
    function isProtocolRegistered(
        string calldata protocolId
    ) external view returns (bool isRegistered);

    /**
     * @notice Estructura para acciones en batch
     */
    struct Action {
        string protocolId;
        string action;
        bytes params;
    }

    /**
     * @notice Ejecuta múltiples acciones en una sola transacción (FASE 6)
     * @param actions Array de acciones a ejecutar
     * @return successes Array de resultados de éxito para cada acción
     * @return results Array de datos de retorno para cada acción
     */
    function executeBatch(
        Action[] calldata actions
    ) external returns (bool[] memory successes, bytes[] memory results);

    /**
     * @notice Evento emitido cuando se ejecuta una acción
     */
    event ActionExecuted(
        address indexed user,
        string indexed protocolId,
        string indexed action,
        bytes params,
        bool success
    );

    /**
     * @notice Evento emitido cuando se registra un adapter
     */
    event AdapterRegistered(
        string indexed protocolId,
        address indexed adapterAddress
    );

    /**
     * @notice Evento emitido cuando se ejecuta un batch de acciones
     */
    event BatchExecuted(
        address indexed user,
        uint256 actionCount,
        uint256 successCount
    );
}

