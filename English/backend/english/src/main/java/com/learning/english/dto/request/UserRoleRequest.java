package com.learning.english.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleRequest {
    private String roleName; // "student" | "teacher" | "admin"
}
