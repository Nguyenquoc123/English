package com.learning.english.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.response.StudentProfileResponse;
import com.learning.english.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
	@Mapping(source = "role.roleName", target = "role")
    StudentProfileResponse toStudentProfileResponse(User user);
}