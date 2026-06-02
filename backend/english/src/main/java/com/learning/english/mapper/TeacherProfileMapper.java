package com.learning.english.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.TeacherProfile;

@Mapper(componentModel = "spring")
public interface TeacherProfileMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.avatarUrl", target = "avatarUrl")
    @Mapping(source = "user.phone", target = "phone")
    TeacherProfileResponse toTeacherProfileResponse(TeacherProfile teacherProfile);

    default TeacherProfileResponse toResponse(TeacherProfile teacherProfile) {
        return toTeacherProfileResponse(teacherProfile);
    }
}