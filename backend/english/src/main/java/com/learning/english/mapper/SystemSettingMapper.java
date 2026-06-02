package com.learning.english.mapper;

import org.mapstruct.Mapper;

import com.learning.english.dto.response.SystemSettingResponse;
import com.learning.english.entity.SystemSetting;

@Mapper(componentModel = "spring")
public interface SystemSettingMapper {

    SystemSettingResponse toResponse(SystemSetting systemSetting);
}