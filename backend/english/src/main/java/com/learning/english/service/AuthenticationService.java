package com.learning.english.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.UserLoginRequest;
import com.learning.english.dto.request.UserRequest;
import com.learning.english.dto.request.XacMinhOTPRequest;
import com.learning.english.dto.response.AuthenticationResponse;
import com.learning.english.entity.Role;
import com.learning.english.entity.User;
import com.learning.english.repository.RoleRepository;
import com.learning.english.repository.UserRepository;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;

import jakarta.transaction.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthenticationService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JavaMailSender mailSender;

    @Value("${jwt.signerKey}")
    String signerKey;

    // key = email, value = thông tin OTP
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public AuthenticationResponse dangKy(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail()))
            throw new RuntimeException("Email đã tồn tại!");

        if (userRepository.existsByUsername(userRequest.getUsername()))
            throw new RuntimeException("Username đã tồn tại!");

        Optional<Role> role = roleRepository.findByRoleName("Student");
        if (role.isEmpty())
            throw new RuntimeException("Role không tồn tại");

        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setEmail(userRequest.getEmail());
        user.setStatus("pending");
        user.setRole(role.get());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        otpStorage.put(user.getEmail(), OtpData.builder()
                .otp(otp)
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build());

        sendRegisterMail(user.getEmail(), "Mã xác minh tài khoản", "Mã xác minh của bạn là: " + otp);

        String token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .status(user.getStatus())
                .role(user.getRole().getRoleName())
                .fullname(user.getFullName())
                .build();
    }

    public AuthenticationResponse dangNhap(UserLoginRequest request) {
        Optional<User> user = userRepository.findByUsernameOrEmail(request.getTaiKhoan(), request.getTaiKhoan());
        if (user.isEmpty())
            throw new RuntimeException("Tài khoản không tồn tại!");

        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword()))
            throw new RuntimeException("Mật khẩu không đúng!");

        if ("pending".equals(user.get().getStatus()))
            throw new RuntimeException("Xác minh tài khoản");

        if ("banned".equals(user.get().getStatus()))
            throw new RuntimeException("Tài khoản đã bị khóa!");

        String token = generateToken(user.get());
        return AuthenticationResponse.builder()
                .token(token)
                .status(user.get().getStatus())
                .role(user.get().getRole().getRoleName())
                .fullname(user.get().getFullName())
                .build();
    }

    @Transactional
    public AuthenticationResponse xacMinhOTP(XacMinhOTPRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        OtpData otpData = otpStorage.get(request.getEmail());

        if (otpData == null) {
            throw new RuntimeException("OTP không tồn tại hoặc đã hết hạn");
        }

        if (otpData.isUsed()) {
            throw new RuntimeException("OTP đã được sử dụng");
        }

        if (otpData.getExpiredAt() == null || otpData.getExpiredAt().isBefore(LocalDateTime.now())) {
            otpStorage.remove(request.getEmail());
            throw new RuntimeException("OTP đã hết hạn");
        }

        if (!otpData.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("OTP không đúng");
        }

        otpData.setUsed(true);
        otpStorage.remove(request.getEmail());

        user.setStatus("active");
        user = userRepository.save(user);

        String token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .status(user.getStatus())
                .role(user.getRole().getRoleName())
                .fullname(user.getFullName())
                .build();
    }

    private void sendRegisterMail(String email, String title, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("ncquocdev@gmail.com");
        message.setTo(email);
        message.setSubject(title);
        message.setText(content);

        mailSender.send(message);
    }

    public String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        String role = user.getRole().getRoleName();

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("english.com")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()))
                .claim("scope", role)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }
}