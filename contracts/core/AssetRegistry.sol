// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IAssetRegistry.sol";
import "../interfaces/IPermissionManager.sol";

/**
 * @title AssetRegistry
 * @notice Registro centralizado de assets soportados en el sistema
 */
contract AssetRegistry is IAssetRegistry {
    // Mapeo de (tokenAddress, chainId) => Asset
    mapping(address => mapping(uint256 => Asset)) private assets;

    // Lista de assets por tipo
    mapping(AssetType => address[]) private assetsByType;

    // Lista de assets por protocolo
    mapping(string => address[]) private assetsByProtocol;

    // Lista de todos los assets registrados
    address[] private allAssets;

    // PermissionManager para control de acceso
    IPermissionManager public permissionManager;

    // Modifier para verificar permisos
    modifier onlyAuthorized() {
        require(
            permissionManager.hasPermission(
                msg.sender,
                IPermissionManager.Permission.MANAGE_ASSETS
            ),
            "AssetRegistry: Insufficient permissions"
        );
        _;
    }

    /**
     * @notice Constructor
     * @param _permissionManager Dirección del PermissionManager
     */
    constructor(address _permissionManager) {
        require(
            _permissionManager != address(0),
            "AssetRegistry: Invalid permission manager address"
        );
        permissionManager = IPermissionManager(_permissionManager);
    }

    /**
     * @notice Registra un nuevo asset
     * @param asset Información del asset a registrar
     */
    function registerAsset(Asset calldata asset) external onlyAuthorized {
        require(
            asset.tokenAddress != address(0),
            "AssetRegistry: Invalid token address"
        );
        require(
            bytes(asset.symbol).length > 0,
            "AssetRegistry: Symbol is required"
        );
        require(
            bytes(asset.name).length > 0,
            "AssetRegistry: Name is required"
        );

        // Verificar si ya está registrado
        require(
            !assets[asset.tokenAddress][asset.chainId].isActive,
            "AssetRegistry: Asset already registered"
        );

        // Registrar asset
        assets[asset.tokenAddress][asset.chainId] = Asset({
            tokenAddress: asset.tokenAddress,
            symbol: asset.symbol,
            name: asset.name,
            decimals: asset.decimals,
            assetType: asset.assetType,
            chainId: asset.chainId,
            protocol: asset.protocol,
            isActive: true
        });

        // Indexar por tipo
        assetsByType[asset.assetType].push(asset.tokenAddress);

        // Indexar por protocolo (si tiene protocolo)
        if (bytes(asset.protocol).length > 0) {
            assetsByProtocol[asset.protocol].push(asset.tokenAddress);
        }

        // Añadir a lista general
        allAssets.push(asset.tokenAddress);

        emit AssetRegistered(
            asset.tokenAddress,
            asset.chainId,
            asset.assetType,
            asset.symbol
        );
    }

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
    ) external view returns (Asset memory asset, bool exists) {
        asset = assets[tokenAddress][chainId];
        exists = asset.isActive;
    }

    /**
     * @notice Verifica si un asset está registrado
     * @param tokenAddress Dirección del token
     * @param chainId ID de la cadena
     * @return isRegistered true si el asset está registrado
     */
    function isAssetRegistered(
        address tokenAddress,
        uint256 chainId
    ) external view returns (bool isRegistered) {
        return assets[tokenAddress][chainId].isActive;
    }

    /**
     * @notice Obtiene assets por tipo
     * @param assetType Tipo de asset
     * @return assetsArray Array de assets del tipo especificado
     */
    function getAssetsByType(
        AssetType assetType
    ) external view returns (Asset[] memory assetsArray) {
        address[] memory addresses = assetsByType[assetType];
        assetsArray = new Asset[](addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            // Necesitamos buscar en todos los chainIds posibles
            // Por simplicidad, asumimos chainId = 1 (Ethereum mainnet)
            // En producción, esto debería ser más sofisticado
            Asset memory asset = assets[addresses[i]][1];
            if (asset.isActive && asset.assetType == assetType) {
                assetsArray[i] = asset;
            }
        }
    }

    /**
     * @notice Obtiene assets por protocolo
     * @param protocol Nombre del protocolo
     * @return assetsArray Array de assets del protocolo especificado
     */
    function getAssetsByProtocol(
        string calldata protocol
    ) external view returns (Asset[] memory assetsArray) {
        address[] memory addresses = assetsByProtocol[protocol];
        assetsArray = new Asset[](addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            Asset memory asset = assets[addresses[i]][1]; // Asumiendo chainId = 1
            if (asset.isActive && 
                keccak256(bytes(asset.protocol)) == keccak256(bytes(protocol))) {
                assetsArray[i] = asset;
            }
        }
    }

    /**
     * @notice Desactiva un asset
     * @param tokenAddress Dirección del token
     * @param chainId ID de la cadena
     */
    function deactivateAsset(
        address tokenAddress,
        uint256 chainId
    ) external onlyAuthorized {
        require(
            assets[tokenAddress][chainId].isActive,
            "AssetRegistry: Asset not registered"
        );

        assets[tokenAddress][chainId].isActive = false;

        emit AssetDeactivated(tokenAddress, chainId);
    }

    /**
     * @notice Obtiene el número total de assets registrados
     * @return count Número de assets
     */
    function getAssetCount() external view returns (uint256 count) {
        return allAssets.length;
    }
}

