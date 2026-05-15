package com.learning.english.mapper;

import com.learning.english.dto.response.TeacherCertificateResponse;
import com.learning.english.entity.TeacherCertificate;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TeacherCertificateMapper {

    TeacherCertificateResponse toTeacherCertificateResponse(TeacherCertificate teacherCertificate);

    List<TeacherCertificateResponse> toTeacherCertificateResponseList(List<TeacherCertificate> certificates);
}