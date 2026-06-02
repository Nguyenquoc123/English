package com.learning.english.service;



import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.learning.english.dto.request.UpdateSystemSettingRequest;
import com.learning.english.dto.response.SystemSettingResponse;
import com.learning.english.entity.SystemSetting;
import com.learning.english.mapper.SystemSettingMapper;
import com.learning.english.repository.SystemSettingRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemSettingService{

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingMapper systemSettingMapper;

    private static final int DEFAULT_STUDENT_AI_DAILY_LIMIT = 20;
    private static final int DEFAULT_TEACHER_AI_DAILY_LIMIT = 50;
    private static final int DEFAULT_ADMIN_AI_DAILY_LIMIT = 100;


    public int getAiDailyLimitByRole(String roleName) {
        String settingKey = buildAiDailyLimitKey(roleName);

        return systemSettingRepository.findBySettingKey(settingKey)
                .map(SystemSetting::getSettingValue)
                .map(this::parseIntOrDefault)
                .orElseGet(() -> getDefaultLimitByRole(roleName));
    }
    
    public Double getPhiNenTang() {
        return systemSettingRepository
                .findBySettingKey("PLATFORM_FEE_PERCENT")
                .map(setting -> Double.parseDouble(setting.getSettingValue()))
                .orElse(0.0);
    }
    

    private String buildAiDailyLimitKey(String roleName) {
        String normalizedRole = normalizeRole(roleName);

        return "AI_DAILY_LIMIT_" + normalizedRole.toUpperCase();
    }

    private String normalizeRole(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "student";
        }

        return roleName.trim().toLowerCase();
    }

    private int parseIntOrDefault(String value) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return DEFAULT_STUDENT_AI_DAILY_LIMIT;
        }
    }

    private int getDefaultLimitByRole(String roleName) {
        String normalizedRole = normalizeRole(roleName);

        return switch (normalizedRole) {
            case "teacher" -> DEFAULT_TEACHER_AI_DAILY_LIMIT;
            case "admin" -> DEFAULT_ADMIN_AI_DAILY_LIMIT;
            case "student" -> DEFAULT_STUDENT_AI_DAILY_LIMIT;
            default -> DEFAULT_STUDENT_AI_DAILY_LIMIT;
        };
    }
    
    
    
    public List<SystemSettingResponse> getAllSettings() {
        return systemSettingRepository.findAll()
                .stream()
                .map(systemSettingMapper::toResponse)
                .toList();
    }

    
    @Transactional
    public SystemSettingResponse updateSetting(
            Long settingId,
            UpdateSystemSettingRequest request
    ) {
        SystemSetting setting = systemSettingRepository.findById(settingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình"));

        validateSettingValue(setting.getSettingKey(), request.getSettingValue());

        setting.setSettingValue(request.getSettingValue().trim());
        setting.setUpdatedAt(LocalDateTime.now());

        return systemSettingMapper.toResponse(systemSettingRepository.save(setting));
    }

    
    @Transactional
    public SystemSettingResponse updateSettingByKey(
            String settingKey,
            UpdateSystemSettingRequest request
    ) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(settingKey)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình"));

        validateSettingValue(setting.getSettingKey(), request.getSettingValue());

        setting.setSettingValue(request.getSettingValue().trim());
        setting.setUpdatedAt(LocalDateTime.now());

        return systemSettingMapper.toResponse(systemSettingRepository.save(setting));
    }

    
    public String getValueByKey(String settingKey) {
        return systemSettingRepository.findBySettingKey(settingKey)
                .map(SystemSetting::getSettingValue)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình: " + settingKey));
    }

    private void validateSettingValue(String settingKey, String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new RuntimeException("Giá trị cấu hình không được để trống");
        }

        String trimmedValue = value.trim();

        switch (settingKey) {
            case "PLATFORM_FEE_PERCENT" -> {
                int percent = parseInt(trimmedValue, "Phí hệ thống phải là số");
                if (percent < 0 || percent > 100) {
                    throw new RuntimeException("Phí hệ thống phải nằm trong khoảng 0 - 100%");
                }
            }

            case "MIN_WITHDRAW_AMOUNT" -> {
                long amount = parseLong(trimmedValue, "Số tiền rút tối thiểu phải là số");
                if (amount < 0) {
                    throw new RuntimeException("Số tiền rút tối thiểu không được âm");
                }
            }

            case "AI_DAILY_LIMIT_STUDENT",
                 "AI_DAILY_LIMIT_TEACHER",
                 "AI_DAILY_LIMIT_ADMIN" -> {
                int limit = parseInt(trimmedValue, "Giới hạn AI mỗi ngày phải là số");
                if (limit < 0) {
                    throw new RuntimeException("Giới hạn AI mỗi ngày không được âm");
                }
            }

            default -> {
                // Không validate đặc biệt.
            }
        }
    }

    private int parseInt(String value, String errorMessage) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new RuntimeException(errorMessage);
        }
    }

    private long parseLong(String value, String errorMessage) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new RuntimeException(errorMessage);
        }
    }
}