package com.learning.english.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.ForgotPasswordRequest;
import com.learning.english.dto.request.ResetPasswordRequest;
import com.learning.english.dto.request.UserLoginRequest;
import com.learning.english.dto.request.UserRequest;
import com.learning.english.dto.request.XacMinhOTPRequest;
import com.learning.english.dto.response.AuthenticationResponse;
import com.learning.english.dto.response.MessageResponse;
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

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public AuthenticationResponse dangKy(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail()))
            throw new RuntimeException("Email đã tồn tại!");

        if (userRepository.existsByUsername(userRequest.getUsername()))
            throw new RuntimeException("Username đã tồn tại!");

        Optional<Role> role = roleRepository.findByRoleName("student");
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
        System.out.println(otp);
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
                .expirationTime(new Date(Instant.now().plus(24, ChronoUnit.HOURS).toEpochMilli()))
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
    
    // ============
    
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        String otp = generateOtp();

        OtpData otpData = OtpData.builder()
                .otp(otp)
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpStorage.put(email, otpData);
        String content = "Xin chào,\n\n"
                + "Mã xác nhận đặt lại mật khẩu của bạn là: " + otp + "\n\n"
                + "Mã này có hiệu lực trong 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này."; 
        sendRegisterMail(user.getEmail(), "Mã xác nhận đặt lại mật khẩu",  content);
        System.out.println(otp);

        return MessageResponse.builder()
                .message("Mã xác nhận đã được gửi đến email của bạn.")
                .build();
    }

    
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = request.getOtp().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        OtpData otpData = otpStorage.get(email);

        if (otpData == null) {
            throw new RuntimeException("Bạn chưa yêu cầu mã xác nhận hoặc mã đã hết hạn");
        }

        if (otpData.isUsed()) {
            throw new RuntimeException("Mã OTP đã được sử dụng");
        }

        if (otpData.getExpiredAt().isBefore(LocalDateTime.now())) {
            otpStorage.remove(email);
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        if (!otpData.getOtp().equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpData.setUsed(true);
        otpStorage.put(email, otpData);

        otpStorage.remove(email);

        return MessageResponse.builder()
                .message("Đặt lại mật khẩu thành công.")
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
}
