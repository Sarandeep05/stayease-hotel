package com.stayease.model;

/**
 * Application roles. Spring Security authorities are derived as "ROLE_" + name().
 */
public enum Role {
    CUSTOMER,
    HOTEL_MANAGER,
    ADMIN
}
