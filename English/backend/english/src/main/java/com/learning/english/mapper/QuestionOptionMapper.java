package com.learning.english.mapper;

import com.learning.english.dto.request.QuestionOptionRequest;
import com.learning.english.dto.response.QuestionOptionResponse;
import com.learning.english.entity.QuestionOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestionOptionMapper {

    @Mapping(target = "optionId", ignore = true)
    @Mapping(target = "question", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    QuestionOption toQuestionOption(QuestionOptionRequest request);

    QuestionOptionResponse toQuestionOptionResponse(QuestionOption option);
}