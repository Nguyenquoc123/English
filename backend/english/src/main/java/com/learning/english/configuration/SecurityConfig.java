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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${jwt.signerKey}")
    String signerKey;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(request -> request
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/register", "/login", "/xacminh", "/forgot-password", "/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-public", "/images/**", "/videos/**", "/level/*", "/audio/**", "/files/**", "/webhooks/sepay/sse").permitAll()
                .requestMatchers(HttpMethod.POST, "/webhooks/sepay", "/webhooks/sepay/chuyen-khoan", "/webhooks/sepay/hoan-tien").permitAll()
                .requestMatchers(HttpMethod.GET, "/thumbnails/**", "/certificates/verify/**", "/uploads/**", "/files/**", "/khoa-hoc/chi-tiet-khoa-hoc-student/*", "/khoa-hoc/certificate-api-health", "/danh-gia/ds-danh-gia/*").permitAll()

                // Student
                .requestMatchers(HttpMethod.GET, "/hosocanhan", "/hosocanhan/bank-accounts", "/hosocanhan/bank-accounts/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/hosocanhan/bank-accounts")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/hosocanhan", "/hosocanhan/bank-accounts/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PATCH, "/hosocanhan/bank-accounts/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.DELETE, "/hosocanhan/bank-accounts/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/doi-mat-khau").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/teacher-profile/register", "/teacher-profile/update").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/teacher-profile/update").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/teacher-profile/profile-registered").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/teacher-profile/profile-register").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/check-mua").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/video-progress").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                
                
                // Admin — teacher approval & course approval
                .requestMatchers(HttpMethod.PUT, "/teacher-profile/*/approve").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/tao-khoa-hoc").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-teacher", "/khoa-hoc/danh-sach-khoa-hoc-teacher-combobox").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/chi-tiet-khoa-hoc/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/duyet", "/khoa-hoc/*/tu-choi").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/gui-duyet", "/khoa-hoc/cap-nhat-khoa-hoc/*").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/*/tao-thanh-toan", "/khoa-hoc/danh-sach-khoa-hoc-da-mua").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/tao-thanh-toan", "/khoa-hoc/tao-thanh-toan", "/khoa-hoc/dang-ky-khoa-hoc-free/*").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/yeu-cau-hoan-tien").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/refund-status", "/khoa-hoc/*/refund-eligibility").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/*/certificate/status", "/khoa-hoc/*/certificate")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/certificate")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/refund-reasons").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/*/tao-thanh-toan").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                
                

                // Lessons
                .requestMatchers(HttpMethod.GET, "/lesson/course/*", "/lesson/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/lesson/*/admin").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.GET, "/lesson/all-lesson/*", "/lesson/*/student-detail").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/lesson/them-lesson", "/lesson/*/teacher/*", "/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT,"/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                // Questions, vocabulary, grammar, video
                .requestMatchers(HttpMethod.POST,"/questions/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/tu-vung/them-tu-vung", "/tu-vung/them-nhieu-tu-vung", "/tu-vung/lessons/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/grammar/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/grammar/*/lessons", "/grammar/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/grammar/*/admin").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST,"/video/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT,"/video/*/lessons/edit").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/video/*/lessons", "/video/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/video/*/publish").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/video/*/admin").hasAnyAuthority("SCOPE_admin")

                // Practice & exams
                .requestMatchers(HttpMethod.GET, "/practice-configs/*", "/practice-configs/{lessonId}/practice/{practiceType}/student", "/practice-attempts/*/result").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/practice-attempts/submit").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi", "/exams/*/chi-tiet").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi-teacher", "/exams/*", "/exams/{examId}/questions/teacher").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exams/create").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/exams/update").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exam-questions/exams/*").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exam-questions/exams/*/attach").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/exam-questions/*/ds").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exam-questions/exam-submit").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                
                .requestMatchers(HttpMethod.GET, "/lich-su-lam-bai/*").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                
                .requestMatchers(HttpMethod.POST, "/danh-gia/them-danh-gia/*").hasAuthority("SCOPE_student")
                
                .requestMatchers(HttpMethod.POST, "/chatbot/ask", "/chatbot/recommend-courses", "/chatbot/history", "/chatbot/course-history").hasAuthority("SCOPE_student")
                
                
                
                .requestMatchers(HttpMethod.POST, "/gio-hang/them/*", "/gio-hang/xoa/*").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/gio-hang/khoa-hoc").hasAuthority("SCOPE_student")
                
                // bank
                .requestMatchers(HttpMethod.POST, "/bank-account/*").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/bank-account/*").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/bank-account/*").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.DELETE, "/bank-account/*").hasAuthority("SCOPE_teacher")
                
                // dashboard
                .requestMatchers(HttpMethod.GET, "/teacher/dashboard/**", "/teacher/earnings", "/teacher/withdrawals").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/withdraw/create").hasAuthority("SCOPE_teacher")
                
                .requestMatchers(HttpMethod.POST, "/withdraw/approve").hasAuthority("SCOPE_admin")
                
                
                .requestMatchers(HttpMethod.POST, "/danh-gia/them-danh-gia/*").hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                        .requestMatchers(HttpMethod.POST, "/chatbot/ask", "/chatbot/recommend-courses")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                .requestMatchers(HttpMethod.POST, "/personal-practices/ai-generate")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                .requestMatchers(HttpMethod.GET, "/personal-practices", "/personal-practices/*")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                .requestMatchers(HttpMethod.POST, "/student-feedbacks")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                // Notifications
                .requestMatchers(HttpMethod.GET, "/notifications/my", "/notifications/unread-count")
                    .hasAnyAuthority("SCOPE_admin", "SCOPE_student", "SCOPE_teacher")

                .requestMatchers(HttpMethod.PUT, "/notifications/**")
                    .hasAnyAuthority("SCOPE_admin", "SCOPE_student", "SCOPE_teacher")

                // Cart
                .requestMatchers(HttpMethod.POST, "/gio-hang/them/*", "/gio-hang/xoa/*")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                .requestMatchers(HttpMethod.GET, "/gio-hang/khoa-hoc")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                // Bank account
                .requestMatchers(HttpMethod.GET, "/bank-account", "/bank-account/**")
                    .hasAuthority("SCOPE_teacher")

                .requestMatchers(HttpMethod.POST, "/bank-account", "/bank-account/**")
                    .hasAuthority("SCOPE_teacher")

                .requestMatchers(HttpMethod.PUT, "/bank-account/**")
                    .hasAuthority("SCOPE_teacher")

                .requestMatchers(HttpMethod.PATCH, "/bank-account/**")
                    .hasAuthority("SCOPE_teacher")

                .requestMatchers(HttpMethod.GET, "/teacher/dashboard").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/teacher/withdrawals", "/teacher/withdrawals/**").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/teacher/withdrawals").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.DELETE, "/bank-account/**")
                    .hasAuthority("SCOPE_teacher")

                // Teacher dashboard / earnings / withdrawals
                .requestMatchers(
                    HttpMethod.GET,
                    "/teacher/dashboard",
                    "/teacher/earnings",
                    "/teacher/withdrawals",
                    "/teacher/withdrawals/history"
                )
                    .hasAuthority("SCOPE_teacher")
                // STK nhận hoàn tiền — học viên
                .requestMatchers(HttpMethod.GET, "/student-bank-account", "/student-bank-account/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/student-bank-account")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/student-bank-account/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PATCH, "/student-bank-account/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")
                .requestMatchers(HttpMethod.DELETE, "/student-bank-account/**")
                    .hasAnyAuthority("SCOPE_student", "SCOPE_teacher")

                // Admin area
                .requestMatchers(HttpMethod.GET, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.PUT, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST, "/admin/**").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.DELETE, "/admin/**").hasAuthority("SCOPE_admin")

                .anyRequest().authenticated()
            );

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource((CorsConfigurationSource) corsConfigurationSource()))
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("http://localhost:5173");
        corsConfiguration.addAllowedOrigin("http://localhost:5174");
        corsConfiguration.addAllowedOrigin("http://localhost:5175");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
}