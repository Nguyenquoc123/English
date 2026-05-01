package com.learning.english.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.learning.english.entity.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(String roleName);
    boolean existsByRoleName(String roleName);
}