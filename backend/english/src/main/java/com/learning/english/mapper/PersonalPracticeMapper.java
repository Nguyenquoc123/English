package com.learning.english.mapper;

import org.mapstruct.Mapper;

import com.learning.english.dto.response.QuestionAIResponse;
import com.learning.english.entity.PersonalPractice;


@Mapper(componentModel = "spring")
public interface PersonalPracticeMapper {
	
	QuestionAIResponse toPersonalPracticeResponse(PersonalPractice personalPractice);
}
