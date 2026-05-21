package com.learning.english.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.learning.english.entity.Role;
import com.learning.english.repository.RoleRepository;

@Component
@Order(1)
public class DeclareRole implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRole("admin");
        seedRole("student");
        seedRole("teacher");
    }

    
    private void seedRole(String roleName) {
        if (!roleRepository.existsByRoleName(roleName)) {
            roleRepository.save(
                Role.builder()
                    .roleName(roleName)
                    .build()
            );
            System.out.println("[DeclareRole] Đã tạo role: " + roleName);
        }
    }
}
