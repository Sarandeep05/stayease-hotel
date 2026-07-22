package com.stayease.service;

import com.stayease.dto.request.*;
import com.stayease.dto.response.AuthResponse;
import com.stayease.dto.response.UserResponse;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ConflictException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.model.Role;
import com.stayease.model.User;
import com.stayease.repository.UserRepository;
import com.stayease.security.JwtService;
import com.stayease.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ConflictException("An account with this email already exists");
        }

        Role role = request.getRole() == null ? Role.CUSTOMER : request.getRole();
        // Prevent self-registration as ADMIN.
        if (role == Role.ADMIN) {
            throw new BadRequestException("ADMIN accounts cannot be self-registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(role))
                .enabled(true)
                .build();

        user = userRepository.save(user);

        notificationService.sendEmail(user.getEmail(), "Welcome to StayEase",
                "Hi " + user.getFullName() + ", your StayEase account is ready. Happy travels!");

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(), request.getPassword()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        try {
            String userId = jwtService.extractUserId(refreshToken);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            UserPrincipal principal = new UserPrincipal(user);
            if (!jwtService.isTokenValid(refreshToken, principal)) {
                throw new BadRequestException("Refresh token is invalid or expired");
            }
            return buildAuthResponse(user);
        } catch (Exception ex) {
            throw new BadRequestException("Refresh token is invalid or expired");
        }
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        // Do not reveal whether the email exists.
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
            userRepository.save(user);
            notificationService.sendPasswordResetLink(user.getEmail(), token);
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expired");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(principal))
                .refreshToken(jwtService.generateRefreshToken(principal))
                .tokenType("Bearer")
                .user(UserResponse.from(user))
                .build();
    }
}
