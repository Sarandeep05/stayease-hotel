package com.stayease.dto.response;

import com.stayease.model.Role;
import com.stayease.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
public class UserResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Set<Role> roles;
    private boolean enabled;
    private Instant createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
