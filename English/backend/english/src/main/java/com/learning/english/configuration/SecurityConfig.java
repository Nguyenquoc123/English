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

import tools.jackson.databind.ObjectMapper;

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
                .requestMatchers(HttpMethod.POST, "/register", "/login", "/xacminh").permitAll()
                .requestMatchers(HttpMethod.GET, "/hosocanhan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/hosocanhan").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/teacher-profile/register").hasAuthority("SCOPE_student")
                .requestMatchers(HttpMethod.PUT, "/teacher-profile/*/approve").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/tao-khoa-hoc").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST, "/khoa-hoc/*/approve").hasAuthority("SCOPE_admin")
                .requestMatchers(HttpMethod.GET, "/lesson/course/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher", "SCOPE_student")
                .requestMatchers(HttpMethod.POST, "/lesson/them-lesson", "/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.PUT,"/lesson/update-lesson").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/cau-hoi/*").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
                .requestMatchers(HttpMethod.POST,"/tu-vung/them-tu-vung").hasAnyAuthority("SCOPE_admin", "SCOPE_teacher")
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
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
}