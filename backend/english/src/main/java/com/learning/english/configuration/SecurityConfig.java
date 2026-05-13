package com.learning.english.configuration;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * SecurityConfig — Lớp cấu hình bảo mật trung tâm của toàn bộ ứng dụng.
 *
 * @Configuration:
 *   Đánh dấu class này là một lớp cấu hình Spring (tương đương file XML cấu hình).
 *   Spring sẽ đọc class này khi khởi động và đăng ký tất cả @Bean bên trong vào
 *   ApplicationContext (container quản lý các đối tượng của Spring).
 *
 * @EnableWebSecurity:
 *   Kích hoạt Spring Security cho toàn ứng dụng web.
 *   Nếu thiếu annotation này, mọi cấu hình bảo mật bên dưới sẽ không có hiệu lực.
 *   Annotation này cũng tự động import các cấu hình mặc định của Spring Security
 *   (như filter chain, session management, v.v.) để ta có thể tùy chỉnh thêm.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * @Value("${jwt.signerKey}"):
     *   Tiêm (inject) giá trị của property "jwt.signerKey" từ file application.yaml
     *   vào trường signerKey này.
     *
     *   Ví dụ trong application.yaml:
     *     jwt:
     *       signerKey: "mySecretKey1234567890abcdefghij"
     *
     *   Đây là khóa bí mật dùng để ký (sign) và xác thực (verify) JWT token theo
     *   thuật toán HMAC-SHA512. Khóa này phải đủ dài (>= 512 bit / 64 ký tự) và
     *   phải được giữ bí mật tuyệt đối — không commit lên Git.
     */
    @Value("${jwt.signerKey}")
    String signerKey;

    /**
     * BCryptPasswordEncoder — Bộ mã hóa mật khẩu sử dụng thuật toán BCrypt.
     *
     * BCrypt là thuật toán hash một chiều (one-way hashing) được thiết kế đặc biệt
     * để lưu trữ mật khẩu an toàn. Đặc điểm:
     *   - Có "salt" ngẫu nhiên tích hợp sẵn: cùng một mật khẩu sẽ tạo ra các hash
     *     khác nhau mỗi lần, ngăn chặn tấn công Rainbow Table.
     *   - "Cost factor" (work factor) có thể điều chỉnh: càng cao càng chậm, chống
     *     brute-force attack.
     *   - Không thể giải mã ngược (irreversible): không ai có thể lấy lại mật khẩu
     *     gốc từ hash, kể cả admin database.
     *
     * Tại sao cần hash mật khẩu?
     *   - Nếu database bị lộ, hacker chỉ thấy chuỗi hash vô nghĩa, không thể đăng nhập.
     *   - Tuân thủ best practice bảo mật và các tiêu chuẩn như OWASP.
     *
     * @Bean: Đăng ký đối tượng này vào Spring Container để các class khác (như
     * AuthenticationService) có thể @Autowired vào mà không cần tạo mới thủ công.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * ObjectMapper — Thư viện Jackson để chuyển đổi giữa Java object và JSON.
     * Được đăng ký là @Bean để dùng chung toàn ứng dụng, tránh tạo nhiều instance
     * (ObjectMapper khá nặng, nên dùng singleton).
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    /**
     * SecurityFilterChain — Chuỗi bộ lọc bảo mật chính của ứng dụng.
     *
     * Spring Security hoạt động theo mô hình Filter Chain: mỗi HTTP request đều phải
     * đi qua một chuỗi các filter (bộ lọc) trước khi đến Controller. Mỗi filter có
     * thể kiểm tra, chặn, hoặc cho phép request đi tiếp.
     *
     * Method này định nghĩa toàn bộ luật bảo mật: endpoint nào cần xác thực, endpoint
     * nào public, role nào được phép truy cập gì.
     *
     * @param http — HttpSecurity builder dùng để cấu hình từng khía cạnh bảo mật.
     * @return SecurityFilterChain đã được build và đăng ký vào Spring Context.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            /**
             * .csrf(disable) — Tắt bảo vệ CSRF (Cross-Site Request Forgery).
             *
             * CSRF là kiểu tấn công khai thác session cookie: trình duyệt tự động gửi
             * cookie theo mỗi request, nên hacker có thể dùng trang web độc hại để
             * "giả vờ" là người dùng hợp lệ.
             *
             * Tại sao disable được? Vì ứng dụng này là REST API stateless dùng JWT:
             *   - Không dùng session cookie để xác thực (dùng JWT trong Authorization header).
             *   - JWT phải được gửi chủ động từ code frontend (không bị trình duyệt
             *     tự động gửi như cookie).
             *   - Do đó, tấn công CSRF không thể xảy ra — disable CSRF là đúng đắn
             *     và phổ biến với mọi REST API dùng JWT.
             */
            .csrf(AbstractHttpConfigurer::disable)

            /**
             * .formLogin(disable) — Tắt trang đăng nhập mặc định của Spring Security.
             *
             * Mặc định, Spring Security cung cấp trang HTML /login để đăng nhập bằng
             * form. Ta không cần vì:
             *   - Ứng dụng dùng JWT: frontend gọi POST /login → nhận JWT → lưu
             *     vào localStorage/memory → gửi theo mọi request sau đó.
             *   - Không có giao diện server-side rendering (SSR); frontend là React SPA
             *     (Single Page Application) riêng biệt.
             */
            .formLogin(AbstractHttpConfigurer::disable)

            /**
             * .httpBasic(disable) — Tắt xác thực HTTP Basic (username:password trong header).
             *
             * HTTP Basic gửi username:password dạng Base64 trong mỗi request — không
             * an toàn và không phù hợp với mô hình JWT. Disable để tránh lỗ hổng.
             */
            .httpBasic(AbstractHttpConfigurer::disable)

            /**
             * .authorizeHttpRequests — Định nghĩa các quy tắc phân quyền cho từng endpoint.
             *
             * Quy tắc được kiểm tra theo thứ tự từ trên xuống dưới (first-match wins):
             * request khớp với rule đầu tiên sẽ áp dụng rule đó, các rule sau bị bỏ qua.
             */
            .authorizeHttpRequests(request -> request

                /**
                 * .permitAll() — Cho phép truy cập tự do, không cần đăng nhập.
                 *
                 * POST /register: Đăng ký tài khoản mới.
                 * POST /login: Đăng nhập, lấy JWT token.
                 * POST /xacminh: Xác minh email/OTP sau đăng ký.
                 * → Ba endpoint này phải public vì người dùng chưa có token để xác thực.
                 */
                .requestMatchers(HttpMethod.POST, "/register", "/login", "/xacminh").permitAll()

                /**
                 * GET /khoa-hoc/danh-sach-khoa-hoc-public: Danh sách khóa học công khai
                 *   cho khách vãng lai xem trước khi đăng nhập.
                 * GET /images/**, /videos/**: File media tĩnh (ảnh, video) không cần xác thực,
                 *   vì chúng được nhúng trong trang web công khai.
                 * GET /level/*: Danh sách cấp độ học (Beginner, Intermediate...) — công khai.
                 */
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-public", "/images/**", "/videos/**", "/level/*", "/audios/**").permitAll()

                /**
                 * POST /webhooks/sepay: Webhook nhận thông báo thanh toán từ cổng SePay.
                 * Phải public vì SePay server gọi vào backend, không có JWT của user.
                 * Bảo mật webhook này bằng cách xác thực chữ ký (signature) từ SePay,
                 * không phải bằng Spring Security.
                 */
                .requestMatchers(HttpMethod.POST, "/webhooks/sepay").permitAll()

                /**
                 * GET /thumbnails/**, /certificates/**, /uploads/**, /files/**:
                 * Các đường dẫn tĩnh phục vụ file upload (ảnh thumbnail khóa học,
                 * chứng chỉ giáo viên, v.v.). Public để frontend có thể hiển thị ảnh
                 * mà không cần token (ảnh được nhúng trong <img src="...">).
                 */
                .requestMatchers(HttpMethod.GET, "/thumbnails/**", "/certificates/**", "/uploads/**", "/files/**").permitAll()

                /**
                 * .hasAuthority("SCOPE_student") — Yêu cầu user phải có quyền "SCOPE_student".
                 *
                 * Tại sao có tiền tố "SCOPE_"?
                 *   - Khi Spring Security decode JWT, nó đọc claim "scope" (hoặc "scp")
                 *     trong token và tự động thêm tiền tố "SCOPE_" vào mỗi giá trị.
                 *   - Ví dụ: JWT có { "scope": "student" } → Spring tạo authority "SCOPE_student".
                 *   - Do đó, trong code ta phải viết "SCOPE_student" chứ không phải "student".
                 *
                 * GET /hosocanhan: Student xem hồ sơ cá nhân của chính mình.
                 * PUT /hosocanhan: Student cập nhật thông tin cá nhân.
                 */
                .requestMatchers(HttpMethod.GET, "/hosocanhan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/hosocanhan").hasAuthority("SCOPE_student")

                /**
                 * PUT /doi-mat-khau: Student đổi mật khẩu tài khoản của chính mình.
                 */
                .requestMatchers(HttpMethod.PUT, "/doi-mat-khau").hasAuthority("SCOPE_student")

                /**
                 * POST /teacher-profile/register: Student nộp đơn đăng ký trở thành giáo viên.
                 * Chỉ student mới có thể đăng ký (teacher và admin không cần).
                 */
                .requestMatchers(HttpMethod.POST, "/teacher-profile/register").hasAuthority("SCOPE_student")

                /**
                 * GET /teacher-profile/profile-register: Student xem hồ sơ đăng ký giáo viên của mình.
                 * GET /teacher-profile/profile-registered: Student kiểm tra đã đăng ký làm giáo viên chưa.
                 */
                .requestMatchers(HttpMethod.GET, "/teacher-profile/profile-register", "/teacher-profile/profile-registered").hasAuthority("SCOPE_student")

                /**
                 * PUT /teacher-profile/{id}/approve: Admin duyệt/từ chối đơn đăng ký giáo viên.
                 * Chỉ admin mới có quyền phê duyệt.
                 */
                .requestMatchers(HttpMethod.PUT, "/teacher-profile/*/approve").hasAuthority("SCOPE_admin")

                /**
                 * POST /khoa-hoc/tao-khoa-hoc: Tạo khóa học mới.
                 * .hasAnyAuthority(): Cho phép nhiều role — admin có thể tạo để test,
                 * teacher tạo để dạy.
                 */
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/tao-khoa-hoc").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                /**
                 * GET /khoa-hoc/danh-sach-khoa-hoc-teacher: Giáo viên xem danh sách
                 * các khóa học của chính họ (chỉ thấy khóa của mình, không thấy của người khác).
                 */
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-teacher").hasAnyAuthority("SCOPE_teacher")

                /**
                 * GET /khoa-hoc/danh-sach-khoa-hoc: Admin xem toàn bộ danh sách khóa học
                 * (kể cả pending, draft, bị từ chối) để quản lý hệ thống.
                 */
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc").hasAnyAuthority("SCOPE_admin")

                /**
                 * GET /khoa-hoc/chi-tiet-khoa-hoc/{id}: Xem chi tiết một khóa học
                 * (admin để kiểm duyệt, teacher để chỉnh sửa nội dung của họ).
                 */
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/chi-tiet-khoa-hoc/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                /**
                 * PUT /khoa-hoc/{id}/duyet: Admin duyệt (approve) khóa học.
                 * PUT /khoa-hoc/{id}/tu-choi: Admin từ chối (reject) khóa học với lý do.
                 */
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/duyet", "/khoa-hoc/*/tu-choi").hasAuthority("SCOPE_admin")

                /**
                 * PUT /khoa-hoc/{id}/gui-duyet: Teacher gửi khóa học lên để admin kiểm duyệt.
                 * Sau khi tạo và thêm nội dung xong, teacher "nộp" khóa học để chờ duyệt.
                 */
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/gui-duyet").hasAuthority("SCOPE_teacher")

                /**
                 * GET /khoa-hoc/chi-tiet-khoa-hoc-student/{id}: Student xem chi tiết khóa học
                 *   (chỉ thấy nếu đã đăng ký hoặc khóa học miễn phí).
                 * GET + POST /khoa-hoc/{id}/tao-thanh-toan: Student tạo yêu cầu thanh toán
                 *   để mua khóa học.
                 */
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/chi-tiet-khoa-hoc-student/*", "/khoa-hoc/*/tao-thanh-toan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/tao-thanh-toan").hasAuthority("SCOPE_student")

                /**
                 * GET /lesson/course/{id}, /lesson/{id}: Xem danh sách bài học và chi tiết
                 * bài học — cho cả 3 role (admin quản lý, teacher chỉnh sửa, student học).
                 */
                .requestMatchers(HttpMethod.GET, "/lesson/course/*", "/lesson/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")

                /**
                 * GET /lesson/{id}/admin: Xem bài học theo góc nhìn admin
                 * (có thể thấy thêm metadata ẩn, bài học draft, v.v.).
                 */
                .requestMatchers(HttpMethod.GET, "/lesson/*/admin").hasAnyAuthority("SCOPE_admin")

                /**
                 * GET /lesson/all-lesson/{courseId}: Student lấy toàn bộ bài học của khóa học
                 * mà họ đã đăng ký (để hiển thị sidebar/danh sách bài học).
                 * GET /lesson/{lessonId}/student-detail: Student xem chi tiết bài học.
                 */
                .requestMatchers(HttpMethod.GET, "/lesson/all-lesson/*", "/lesson/*/student-detail").hasAnyAuthority("SCOPE_student")

                /**
                 * POST/PUT cho lesson: Thêm mới hoặc cập nhật bài học.
                 * Chỉ admin và teacher mới có quyền tạo/sửa nội dung.
                 */
                .requestMatchers(HttpMethod.POST, "/lesson/them-lesson", "/lesson/*/teacher/*", "/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT,"/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                /**
                 * POST /questions/{lessonId}: Thêm câu hỏi trắc nghiệm vào bài học.
                 * Chỉ admin và teacher mới được tạo câu hỏi.
                 */
                .requestMatchers(HttpMethod.POST,"/questions/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                /**
                 * POST /tu-vung/...: Thêm từ vựng (đơn lẻ hoặc hàng loạt) vào bài học.
                 * Chỉ admin và teacher mới được thêm nội dung từ vựng.
                 */
                .requestMatchers(HttpMethod.POST,"/tu-vung/them-tu-vung", "/tu-vung/them-nhieu-tu-vung", "/tu-vung/lessons/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                /**
                 * POST /grammar/{id}/lessons: Thêm bài ngữ pháp vào lesson.
                 * GET /grammar/{id}/lessons, /grammar/{id}: Xem bài ngữ pháp (cả 3 role).
                 * GET /grammar/{id}/admin: Admin xem chi tiết ngữ pháp bao gồm draft.
                 */
                .requestMatchers(HttpMethod.POST,"/grammar/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/grammar/*/lessons", "/grammar/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/grammar/*/admin").hasAnyAuthority("SCOPE_admin")

                /**
                 * POST /video/{id}/lessons: Upload hoặc liên kết video vào lesson.
                 * GET /video/{id}/lessons, /video/{id}: Xem video (cả 3 role).
                 * GET /video/{id}/admin: Admin xem tất cả video bao gồm ẩn/draft.
                 */
                .requestMatchers(HttpMethod.POST,"/video/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/video/*/lessons", "/video/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/video/*/admin").hasAnyAuthority("SCOPE_admin")

                /**
                 * GET /practice-configs/*: Student xem cấu hình luyện tập của bài học.
                 * GET /practice-attempts/{id}/result: Student xem kết quả luyện tập.
                 * POST /practice-attempts/submit: Student nộp bài luyện tập.
                 */
                .requestMatchers(HttpMethod.GET, "/practice-configs/*", "/practice-configs/{lessonId}/practice/{practiceType}/student", "/practice-attempts/*/result").hasAnyAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/practice-attempts/submit").hasAnyAuthority("SCOPE_student")

                /**
                 * GET /exams/all-bai-thi: Student xem danh sách kỳ thi có thể tham gia.
                 */
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi").hasAnyAuthority("SCOPE_student")

                /**
                 * GET /exams/all-bai-thi-teacher, /exams/create: Teacher xem và tạo kỳ thi.
                 * POST /exams/create: Teacher tạo kỳ thi mới.
                 */
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi-teacher", "/exams/create").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exams/create").hasAnyAuthority("SCOPE_teacher")

                /**
                 * /admin/**: Toàn bộ các endpoint quản trị hệ thống.
                 * Áp dụng cho mọi HTTP method: GET (xem), PUT (sửa), POST (thêm), DELETE (xóa).
                 * Wildcard ** bao phủ tất cả sub-path: /admin/users, /admin/reports, v.v.
                 * Chỉ SCOPE_admin mới được truy cập toàn bộ khu vực này.
                 */
                .requestMatchers(HttpMethod.GET, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.PUT, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.DELETE, "/admin/**").hasAuthority("SCOPE_admin")

                /**
                 * .anyRequest().authenticated(): Fallback rule — mọi request khác không
                 * khớp các rule trên đều yêu cầu phải đăng nhập (có JWT hợp lệ).
                 * Đây là "lưới an toàn" — không có endpoint nào bị bỏ sót phân quyền.
                 */
                .anyRequest().authenticated()
            );

        http
            // Disable CSRF lần thứ hai trong block cấu hình CORS và OAuth2
            // (thực tế cùng một HttpSecurity builder — gộp chung để đảm bảo nhất quán)
            .csrf(AbstractHttpConfigurer::disable)

            /**
             * .cors(...): Kích hoạt CORS (Cross-Origin Resource Sharing) với cấu hình tùy chỉnh.
             *
             * Tại sao cần CORS?
             *   Trình duyệt có "Same-Origin Policy": JavaScript chỉ được gọi API cùng
             *   domain/port/protocol. Frontend React chạy ở localhost:5173 gọi backend
             *   ở localhost:8080 → khác port → trình duyệt chặn.
             *   CORS header cho phép trình duyệt biết backend "chấp nhận" request từ
             *   các origin khác được liệt kê trong allowedOrigins.
             */
            .cors(cors -> cors.configurationSource((CorsConfigurationSource) corsConfigurationSource()))

            /**
             * .oauth2ResourceServer(...).jwt(...): Cấu hình ứng dụng hoạt động như
             * OAuth2 Resource Server xác thực bằng JWT.
             *
             * Luồng xác thực:
             *   1. Client gửi request với header: Authorization: Bearer <jwt_token>
             *   2. Spring Security lấy token ra khỏi header.
             *   3. JwtDecoder (được cấu hình bên dưới) decode và verify chữ ký token.
             *   4. Nếu token hợp lệ → trích xuất claims (subject, scope, exp...) →
             *      tạo Authentication object → cho request đi tiếp.
             *   5. Nếu token không hợp lệ hoặc hết hạn → trả về 401 Unauthorized.
             */
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

        return http.build();
    }

    /**
     * JwtDecoder — Bean dùng để giải mã và xác thực JWT token.
     *
     * Cơ chế hoạt động:
     *   1. SecretKeySpec: Tạo khóa bí mật từ chuỗi signerKey dưới dạng byte array.
     *      Tham số "HS512" chỉ định thuật toán (ở đây chỉ là tên key type, thuật toán
     *      thực sự được set ở bước 3).
     *
     *   2. NimbusJwtDecoder: Thư viện Nimbus JOSE+JWT — implementation phổ biến nhất
     *      trong Java để xử lý JWT. Spring Security sử dụng Nimbus làm mặc định.
     *
     *   3. .macAlgorithm(MacAlgorithm.HS512): Chỉ định thuật toán MAC (Message
     *      Authentication Code) là HMAC-SHA512.
     *      - HMAC: Hash-based Message Authentication Code — dùng khóa bí mật + SHA512
     *        để tạo chữ ký, đảm bảo token không bị giả mạo.
     *      - HS512 vs HS256: HS512 dùng SHA-512 (64 byte hash), bảo mật hơn HS256
     *        (32 byte hash), phù hợp cho ứng dụng có yêu cầu bảo mật cao.
     *
     *   Quy trình verify: Lấy header + payload của JWT → tính lại HMAC-SHA512 với
     *   signerKey → so sánh với signature trong token → nếu khớp thì token hợp lệ.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    /**
     * corsConfigurationSource — Định nghĩa cấu hình CORS chi tiết.
     *
     * CORS (Cross-Origin Resource Sharing) là cơ chế trình duyệt dùng để kiểm soát
     * request từ JavaScript sang domain khác. Backend phải khai báo rõ những origin
     * nào được phép, method nào, header nào.
     *
     * Cấu hình hiện tại:
     *   - addAllowedOrigin("http://localhost:5173"): Cho phép frontend dev server chính
     *     (Vite mặc định chạy ở port 5173) — môi trường development.
     *   - addAllowedOrigin("http://localhost:5174"): Cho phép frontend dev server thứ hai
     *     (port 5174 khi chạy instance thứ 2, ví dụ: test song song 2 cửa sổ Vite).
     *   - addAllowedHeader("*"): Cho phép mọi HTTP header (Authorization, Content-Type,
     *     X-Requested-With, v.v.) — cần thiết để gửi JWT trong Authorization header.
     *   - addAllowedMethod("*"): Cho phép mọi HTTP method (GET, POST, PUT, DELETE,
     *     OPTIONS). OPTIONS là method preflight mà trình duyệt gửi trước để hỏi CORS.
     *
     * Lưu ý production:
     *   Khi deploy lên production, cần thay "http://localhost:5173" bằng domain thực
     *   của frontend (ví dụ: "https://englishapp.vn") để bảo mật.
     *
     * UrlBasedCorsConfigurationSource.registerCorsConfiguration("/**", ...):
     *   Áp dụng cấu hình CORS trên cho mọi URL path của backend (/** = tất cả).
     */
    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("http://localhost:5173");  // Vite dev server (instance 1)
        corsConfiguration.addAllowedOrigin("http://localhost:5174");  // Vite dev server (instance 2)
        corsConfiguration.addAllowedHeader("*");                       // Cho phép mọi header (bao gồm Authorization)
        corsConfiguration.addAllowedMethod("*");                       // Cho phép mọi HTTP method

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);   // Áp dụng cho tất cả endpoints
        return source;
    }
}
