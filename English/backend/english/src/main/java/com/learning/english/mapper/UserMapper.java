package com.learning.english.mapper;

import org.mapstruct.Mapper;
import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    StudentProfileResponse toStudentProfileResponse(User user);
}