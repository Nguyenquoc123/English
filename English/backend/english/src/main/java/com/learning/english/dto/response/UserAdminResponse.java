package com.learning.english.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String roleName;
    private Long roleId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
