package com.learning.english.mapper;

import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.TeacherProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {TeacherCertificateMapper.class})
public interface TeacherProfileMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.avatarUrl", target = "avatarUrl")
    @Mapping(source = "reviewedBy.fullName", target = "reviewedByName")
    @Mapping(target = "phone", expression = "java(resolvePhone(teacherProfile))")
    @Mapping(source = "certificates", target = "certificates")
    TeacherProfileResponse toTeacherProfileResponse(TeacherProfile teacherProfile);

    default String resolvePhone(TeacherProfile teacherProfile) {
        if (teacherProfile == null) {
            return null;
        }
        if (teacherProfile.getPhone() != null && !teacherProfile.getPhone().isBlank()) {
            return teacherProfile.getPhone();
        }
        if (teacherProfile.getUser() != null
                && teacherProfile.getUser().getPhone() != null
                && !teacherProfile.getUser().getPhone().isBlank()) {
            return teacherProfile.getUser().getPhone();
        }
        return null;
    }
}