// Package khai báo — DTO request nằm trong tầng dto/request
package com.learning.english.dto.request;

// Import Lombok — tự động sinh getter, setter, constructor không tham số
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AdminChangePasswordRequest — DTO nhận dữ liệu đổi mật khẩu từ Admin Portal.
 *
 * Dùng trong endpoint: PUT /admin/change-password
 * Body JSON ví dụ:
 *   {
 *     "oldPassword": "MatKhauCu123",
 *     "newPassword": "MatKhauMoi456",
 *     "confirmPassword": "MatKhauMoi456"
 *   }
 *
 * Luồng xác thực:
 *   1. Backend nhận request body → deserialize thành AdminChangePasswordRequest
 *   2. Lấy username admin từ JWT (SecurityContext)
 *   3. Tìm user theo username, kiểm tra oldPassword bằng BCrypt.matches()
 *   4. Kiểm tra newPassword == confirmPassword
 *   5. Kiểm tra newPassword đủ độ dài/phức tạp (tùy chọn)
 *   6. Encode newPassword bằng BCrypt và lưu vào DB
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminChangePasswordRequest {

    // Mật khẩu hiện tại của admin — bắt buộc để xác thực danh tính trước khi đổi
    // Backend kiểm tra bằng: BCryptPasswordEncoder.matches(oldPassword, user.getPassword())
    private String oldPassword;

    // Mật khẩu mới — sẽ được BCrypt encode trước khi lưu vào database
    // Không lưu dạng plain text — luôn lưu hash để bảo mật
    private String newPassword;

    // Xác nhận mật khẩu mới — phải khớp với newPassword
    // Kiểm tra phía backend: newPassword.equals(confirmPassword)
    private String confirmPassword;
}
