package com.stayease.service;

import com.stayease.dto.request.ChangePasswordRequest;
import com.stayease.dto.request.UpdateProfileRequest;
import com.stayease.dto.response.UserResponse;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.Role;
import com.stayease.model.User;
import com.stayease.repository.UserRepository;
import com.stayease.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() {
        return UserResponse.from(loadCurrent());
    }

    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = loadCurrent();
        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        return UserResponse.from(userRepository.save(user));
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = loadCurrent();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // --- Admin operations ---

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse getUser(String id) {
        return UserResponse.from(findById(id));
    }

    public UserResponse setEnabled(String id, boolean enabled) {
        User user = findById(id);
        user.setEnabled(enabled);
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse updateRoles(String id, java.util.Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            throw new BadRequestException("At least one role is required");
        }
        User user = findById(id);
        user.setRoles(roles);
        return UserResponse.from(userRepository.save(user));
    }

    private User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private User loadCurrent() {
        String id = SecurityUtils.currentUserId();
        return findById(id);
    }
}
