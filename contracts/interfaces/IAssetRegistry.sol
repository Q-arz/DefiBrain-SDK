// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAssetRegistry
 * @notice Interface para registro de assets soportados
 */
interface IAssetRegistry {
    /**
     * @notice Tipos de assets
     */
    enum AssetType {
        STABLECOIN,  // 0
        BLUECHIP,    // 1
        LP_TOKEN,    // 2
        PT_TOKEN,    // 3 - Pendle Principal Token
        YT_TOKEN,    // 4 - Pendle Yield Token
        ATOKEN,      // 5 - Aave Token
        MORPHO_TOKEN, // 6
        OTHER        // 7
    }

    /**
     * @notice Estructura de información de un asset
     */
    struct Asset {
        address tokenAddress;
        string symbol;
        string name;
        uint8 decimals;
        AssetType assetType;
        uint256 chainId;
        string protocol; // Protocolo asociado (pendle, curve, aave, etc.)
        bool isActive;
    }

    /**
     * @notice Registra un nuevo asset
     * @param asset Información del asset a registrar
     */
    function registerAsset(Asset calldata asset) external;

    /**
     * @notice Obtiene información de un asset
     * @param tokenAddress Dirección del token
     * @param chainId ID de la cadena
     * @return asset Información del asset
     * @return exists true si el asset está registrado
     */
    function getAsset(
        address tokenAddress,
        uint256 chainId
    ) external view returns (Asset memory asset, bool exists);

    /**
     * @notice Verifica si un asset está registrado
     * @param tokenAddress Dirección del token
     * @param chainId ID de la cadena
     * @return isRegistered true si el asset está registrado
     */
    function isAssetRegistered(
        address tokenAddress,
        uint256 chainId
    ) external view returns (bool isRegistered);

    /**
     * @notice Obtiene assets por tipo
     * @param assetType Tipo de asset
     * @return assets Array de assets del tipo especificado
     */
    function getAssetsByType(
        AssetType assetType
    ) external view returns (Asset[] memory assets);

    /**
     * @notice Obtiene assets por protocolo
     * @param protocol Nombre del protocolo
     * @return assets Array de assets del protocolo especificado
     */
    function getAssetsByProtocol(
        string calldata protocol
    ) external view returns (Asset[] memory assets);

    /**
     * @notice Desactiva un asset
     * @param tokenAddress Dirección del token
     * @param chainId ID de la cadena
     */
    function deactivateAsset(address tokenAddress, uint256 chainId) external;

    /**
     * @notice Evento emitido cuando se registra un asset
     */
    event AssetRegistered(
        address indexed tokenAddress,
        uint256 chainId,
        AssetType assetType,
        string symbol
    );

    /**
     * @notice Evento emitido cuando se desactiva un asset
     */
    event AssetDeactivated(
        address indexed tokenAddress,
        uint256 chainId
    );
}

