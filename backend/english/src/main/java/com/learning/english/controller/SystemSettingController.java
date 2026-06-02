package com.learning.english.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.request.UpdateSystemSettingRequest;
import com.learning.english.dto.response.SystemSettingResponse;
import com.learning.english.service.SystemSettingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/system-settings")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    public ResponseEntity<List<SystemSettingResponse>> getAllSettings() {
        return ResponseEntity.ok(systemSettingService.getAllSettings());
    }

    @PutMapping("/{settingId}")
    public ResponseEntity<SystemSettingResponse> updateSetting(
            @PathVariable Long settingId,
            @Valid @RequestBody UpdateSystemSettingRequest request
    ) {
        return ResponseEntity.ok(systemSettingService.updateSetting(settingId, request));
    }

    @PutMapping("/key/{settingKey}")
    public ResponseEntity<SystemSettingResponse> updateSettingByKey(
            @PathVariable String settingKey,
            @Valid @RequestBody UpdateSystemSettingRequest request
    ) {
        return ResponseEntity.ok(systemSettingService.updateSettingByKey(settingKey, request));
    }
}