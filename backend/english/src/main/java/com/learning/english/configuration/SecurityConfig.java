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
                .requestMatchers(HttpMethod.POST, "/register", "/login", "/xacminh").permitAll()
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-public", "/images/**", "/videos/**", "/level/*", "/audios/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/webhooks/sepay").permitAll()
                .requestMatchers(HttpMethod.GET, "/thumbnails/**", "/certificates/**", "/uploads/**", "/files/**").permitAll()

                // Student
                .requestMatchers(HttpMethod.GET, "/hosocanhan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/hosocanhan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/doi-mat-khau").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/teacher-profile/register").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/teacher-profile/profile-register", "/teacher-profile/profile-registered").hasAuthority("SCOPE_student")

                // Admin — teacher approval & course approval
                .requestMatchers(HttpMethod.PUT, "/teacher-profile/*/approve").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/tao-khoa-hoc").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc-teacher").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/danh-sach-khoa-hoc").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/chi-tiet-khoa-hoc/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/duyet", "/khoa-hoc/*/tu-choi").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.PUT, "/khoa-hoc/*/gui-duyet").hasAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/khoa-hoc/chi-tiet-khoa-hoc-student/*", "/khoa-hoc/*/tao-thanh-toan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/tao-thanh-toan").hasAuthority("SCOPE_student")

                // Lessons
                .requestMatchers(HttpMethod.GET, "/lesson/course/*", "/lesson/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/lesson/*/admin").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.GET, "/lesson/all-lesson/*", "/lesson/*/student-detail").hasAnyAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/lesson/them-lesson", "/lesson/*/teacher/*", "/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT,"/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")

                // Questions, vocabulary, grammar, video
                .requestMatchers(HttpMethod.POST,"/questions/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/tu-vung/them-tu-vung", "/tu-vung/them-nhieu-tu-vung", "/tu-vung/lessons/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/grammar/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/grammar/*/lessons", "/grammar/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/grammar/*/admin").hasAnyAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST,"/video/*/lessons").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.GET, "/video/*/lessons", "/video/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/video/*/admin").hasAnyAuthority("SCOPE_admin")

                // Practice & exams
                .requestMatchers(HttpMethod.GET, "/practice-configs/*", "/practice-configs/{lessonId}/practice/{practiceType}/student", "/practice-attempts/*/result").hasAnyAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/practice-attempts/submit").hasAnyAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi").hasAnyAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.GET, "/exams/all-bai-thi-teacher", "/exams/create").hasAnyAuthority("SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/exams/create").hasAnyAuthority("SCOPE_teacher")

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
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
}
