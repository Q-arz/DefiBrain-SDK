// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPermissionManager
 * @notice Interface para gestión de permisos y control de acceso
 */
interface IPermissionManager {
    /**
     * @notice Roles disponibles en el sistema
     */
    enum Role {
        GUEST,    // 0 - Solo lectura
        USER,     // 1 - Puede ejecutar acciones
        OPERATOR, // 2 - Puede ejecutar acciones y registrar adapters
        ADMIN     // 3 - Todos los permisos
    }

    /**
     * @notice Permisos disponibles
     */
    enum Permission {
        VIEW_ONLY,        // 0 - Solo lectura
        EXECUTE_ACTION,   // 1 - Ejecutar acciones
        REGISTER_ADAPTER, // 2 - Registrar adapters
        MANAGE_PERMISSIONS, // 3 - Gestionar permisos
        MANAGE_ASSETS     // 4 - Gestionar assets
    }

    /**
     * @notice Asigna un rol a una dirección
     * @param user Dirección del usuario
     * @param role Rol a asignar
     */
    function assignRole(address user, Role role) external;

    /**
     * @notice Obtiene el rol de un usuario
     * @param user Dirección del usuario
     * @return role Rol del usuario
     */
    function getUserRole(address user) external view returns (Role role);

    /**
     * @notice Verifica si un usuario tiene un permiso específico
     * @param user Dirección del usuario
     * @param permission Permiso a verificar
     * @return hasPermission true si el usuario tiene el permiso
     */
    function hasPermission(
        address user,
        Permission permission
    ) external view returns (bool hasPermission);

    /**
     * @notice Añade una dirección a la whitelist
     * @param user Dirección a añadir
     */
    function addToWhitelist(address user) external;

    /**
     * @notice Remueve una dirección de la whitelist
     * @param user Dirección a remover
     */
    function removeFromWhitelist(address user) external;

    /**
     * @notice Verifica si una dirección está en la whitelist
     * @param user Dirección a verificar
     * @return isWhitelisted true si está en la whitelist
     */
    function isWhitelisted(address user) external view returns (bool isWhitelisted);

    /**
     * @notice Añade una dirección a la blacklist
     * @param user Dirección a añadir
     */
    function addToBlacklist(address user) external;

    /**
     * @notice Remueve una dirección de la blacklist
     * @param user Dirección a remover
     */
    function removeFromBlacklist(address user) external;

    /**
     * @notice Verifica si una dirección está en la blacklist
     * @param user Dirección a verificar
     * @return isBlacklisted true si está en la blacklist
     */
    function isBlacklisted(address user) external view returns (bool isBlacklisted);

    /**
     * @notice Evento emitido cuando se asigna un rol
     */
    event RoleAssigned(address indexed user, Role role);

    /**
     * @notice Evento emitido cuando se añade a whitelist
     */
    event Whitelisted(address indexed user);

    /**
     * @notice Evento emitido cuando se remueve de whitelist
     */
    event WhitelistRemoved(address indexed user);

    /**
     * @notice Evento emitido cuando se añade a blacklist
     */
    event Blacklisted(address indexed user);

    /**
     * @notice Evento emitido cuando se remueve de blacklist
     */
    event BlacklistRemoved(address indexed user);
}

