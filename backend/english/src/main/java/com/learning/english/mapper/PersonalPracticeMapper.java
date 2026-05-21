package com.learning.english.mapper;

import org.mapstruct.Mapper;

import com.learning.english.dto.response.PersonalPracticeResponse;
import com.learning.english.entity.PersonalPractice;


@Mapper(componentModel = "spring")
public interface PersonalPracticeMapper {
	
	PersonalPracticeResponse toPersonalPracticeResponse(PersonalPractice personalPractice);
}
