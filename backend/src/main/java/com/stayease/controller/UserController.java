package com.stayease.controller;

import com.stayease.dto.request.ChangePasswordRequest;
import com.stayease.dto.request.UpdateProfileRequest;
import com.stayease.dto.response.ApiMessage;
import com.stayease.dto.response.UserResponse;
import com.stayease.model.Role;
import com.stayease.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Profile management and admin user administration")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiMessage> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiMessage.ok("Password changed successfully."));
    }

    // --- Admin ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> setEnabled(@PathVariable String id,
                                                   @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(userService.setEnabled(id, Boolean.TRUE.equals(body.get("enabled"))));
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRoles(@PathVariable String id,
                                                    @RequestBody Map<String, Set<Role>> body) {
        return ResponseEntity.ok(userService.updateRoles(id, body.get("roles")));
    }
}
