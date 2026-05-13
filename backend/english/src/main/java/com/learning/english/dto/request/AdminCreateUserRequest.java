package com.learning.english.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreateUserRequest {
    private String username;   // bắt buộc, unique
    private String email;      // bắt buộc, unique
    private String password;   // bắt buộc, min 6 ký tự
    private String fullName;   // tùy chọn
    private String roleName;   // "student" | "teacher" | "admin"
    private String status;     // "active" | "pending" — default "active"
}
