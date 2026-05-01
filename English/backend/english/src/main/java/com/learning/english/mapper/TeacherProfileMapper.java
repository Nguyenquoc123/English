package com.learning.english.mapper;

import com.learning.english.dto.response.TeacherProfileResponse;
import com.learning.english.entity.TeacherProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {TeacherCertificateMapper.class})
public interface TeacherProfileMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "certificates", target = "certificates")
    TeacherProfileResponse toTeacherProfileResponse(TeacherProfile teacherProfile);
}