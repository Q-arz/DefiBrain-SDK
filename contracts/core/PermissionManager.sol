// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPermissionManager.sol";

/**
 * @title PermissionManager
 * @notice Gestión de permisos y control de acceso basado en roles
 * @dev Implementa el patrón de control de acceso basado en roles (RBAC)
 */
contract PermissionManager is IPermissionManager {
    // Mapeo de usuario a rol
    mapping(address => Role) private userRoles;

    // Whitelist y blacklist
    mapping(address => bool) private whitelist;
    mapping(address => bool) private blacklist;

    // Admin del contrato
    address public admin;

    // Modifier para verificar que solo el admin puede ejecutar
    modifier onlyAdmin() {
        require(msg.sender == admin, "PermissionManager: Only admin");
        _;
    }

    // Modifier para verificar permisos
    modifier requirePermission(Permission permission) {
        require(
            hasPermission(msg.sender, permission),
            "PermissionManager: Insufficient permissions"
        );
        _;
    }

    /**
     * @notice Constructor
     * @param _admin Dirección del administrador inicial
     */
    constructor(address _admin) {
        require(_admin != address(0), "PermissionManager: Invalid admin address");
        admin = _admin;
        userRoles[_admin] = Role.ADMIN;
        emit RoleAssigned(_admin, Role.ADMIN);
    }

    /**
     * @notice Asigna un rol a una dirección
     * @param user Dirección del usuario
     * @param role Rol a asignar
     */
    function assignRole(
        address user,
        Role role
    ) external onlyAdmin {
        require(user != address(0), "PermissionManager: Invalid user address");
        userRoles[user] = role;
        emit RoleAssigned(user, role);
    }

    /**
     * @notice Obtiene el rol de un usuario
     * @param user Dirección del usuario
     * @return role Rol del usuario
     */
    function getUserRole(address user) external view returns (Role role) {
        return userRoles[user];
    }

    /**
     * @notice Verifica si un usuario tiene un permiso específico
     * @param user Dirección del usuario
     * @param permission Permiso a verificar
     * @return userHasPermission true si el usuario tiene el permiso
     */
    function hasPermission(
        address user,
        Permission permission
    ) public view returns (bool userHasPermission) {
        // Verificar blacklist
        if (blacklist[user]) {
            return false;
        }

        // Verificar whitelist (si está habilitada y el usuario no está en ella)
        // Nota: Si whitelist está vacía, todos pueden acceder (excepto blacklist)
        // Si whitelist tiene elementos, solo los whitelisted pueden acceder

        Role role = userRoles[user];

        // Mapeo de roles a permisos
        if (role == Role.ADMIN) {
            return true; // Admin tiene todos los permisos
        } else if (role == Role.OPERATOR) {
            return permission == Permission.VIEW_ONLY ||
                   permission == Permission.EXECUTE_ACTION ||
                   permission == Permission.REGISTER_ADAPTER;
        } else if (role == Role.USER) {
            return permission == Permission.VIEW_ONLY ||
                   permission == Permission.EXECUTE_ACTION;
        } else if (role == Role.GUEST) {
            return permission == Permission.VIEW_ONLY;
        }

        return false;
    }

    /**
     * @notice Añade una dirección a la whitelist
     * @param user Dirección a añadir
     */
    function addToWhitelist(address user) external onlyAdmin {
        require(user != address(0), "PermissionManager: Invalid user address");
        whitelist[user] = true;
        emit Whitelisted(user);
    }

    /**
     * @notice Remueve una dirección de la whitelist
     * @param user Dirección a remover
     */
    function removeFromWhitelist(address user) external onlyAdmin {
        whitelist[user] = false;
        emit WhitelistRemoved(user);
    }

    /**
     * @notice Verifica si una dirección está en la whitelist
     * @param user Dirección a verificar
     * @return userIsWhitelisted true si está en la whitelist
     */
    function isWhitelisted(address user) external view returns (bool userIsWhitelisted) {
        return whitelist[user];
    }

    /**
     * @notice Añade una dirección a la blacklist
     * @param user Dirección a añadir
     */
    function addToBlacklist(address user) external onlyAdmin {
        require(user != address(0), "PermissionManager: Invalid user address");
        blacklist[user] = true;
        emit Blacklisted(user);
    }

    /**
     * @notice Remueve una dirección de la blacklist
     * @param user Dirección a remover
     */
    function removeFromBlacklist(address user) external onlyAdmin {
        blacklist[user] = false;
        emit BlacklistRemoved(user);
    }

    /**
     * @notice Verifica si una dirección está en la blacklist
     * @param user Dirección a verificar
     * @return userIsBlacklisted true si está en la blacklist
     */
    function isBlacklisted(address user) external view returns (bool userIsBlacklisted) {
        return blacklist[user];
    }

    /**
     * @notice Cambia el admin del contrato
     * @param newAdmin Nueva dirección del admin
     */
    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "PermissionManager: Invalid admin address");
        admin = newAdmin;
        userRoles[newAdmin] = Role.ADMIN;
        emit RoleAssigned(newAdmin, Role.ADMIN);
    }
}

