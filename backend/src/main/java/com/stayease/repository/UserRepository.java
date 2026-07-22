package com.stayease.repository;

import com.stayease.model.Role;
import com.stayease.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    List<User> findByRolesContaining(Role role);

    long countByRolesContaining(Role role);
}
