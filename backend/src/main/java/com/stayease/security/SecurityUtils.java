package com.stayease.security;

import com.stayease.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helper for reading the authenticated principal in service/controller code.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ForbiddenException("No authenticated user in context");
        }
        return principal;
    }

    public static String currentUserId() {
        return currentUser().getId();
    }

    public static boolean hasRole(String role) {
        return currentUser().getRoleNames().contains(role);
    }
}
