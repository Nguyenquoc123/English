package com.learning.english.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminChangePasswordRequest {

    private String oldPassword;

    private String newPassword;

    private String confirmPassword;
}
