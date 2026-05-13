package com.learning.english.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.learning.english.entity.Role;
import com.learning.english.repository.RoleRepository;

/**
 * DeclareRole — Khởi tạo dữ liệu Role vào DB khi app khởi động.
 *
 * Chạy trước DeclareAdmin (@Order(1)) để đảm bảo bảng roles đã có dữ liệu
 * trước khi DeclareAdmin.run() gọi findByRoleName().
 *
 * 3 role cần thiết:
 *   - "admin"   → SCOPE_admin   trong JWT → quyền quản trị hệ thống
 *   - "student" → SCOPE_student trong JWT → quyền học viên
 *   - "teacher" → SCOPE_teacher trong JWT → quyền giáo viên
 *
 * Tên role PHẢI viết thường (lowercase) để khớp với SCOPE_ trong SecurityConfig.
 * Spring Security JwtAuthenticationConverter tự thêm tiền tố "SCOPE_" vào scope claim,
 * ví dụ: role "admin" → JWT scope "admin" → authority "SCOPE_admin".
 */
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

    /**
     * Tạo role nếu chưa tồn tại trong DB (idempotent — có thể chạy nhiều lần an toàn).
     *
     * @param roleName Tên role cần seed (phải lowercase để khớp với SCOPE_)
     */
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
