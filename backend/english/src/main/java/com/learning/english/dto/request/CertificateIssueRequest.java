package com.learning.english.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CertificateIssueRequest {

    @NotBlank(message = "Vui lòng nhập họ và tên in trên chứng chỉ")
    @Size(min = 2, max = 255, message = "Họ và tên phải từ 2 đến 255 ký tự")
    private String studentNameOnCertificate;
}
