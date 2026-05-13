package com.learning.english.mapper;

import com.learning.english.dto.response.QuestionBankItemResponse;
import com.learning.english.dto.response.QuestionOptionResponse;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.entity.Question;
import com.learning.english.entity.QuestionOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface QuestionMapper {

    @Mapping(target = "createdById", source = "createdBy.userId")
    @Mapping(
            target = "optionCount",
            expression = "java(question.getOptions() == null ? 0L : (long) question.getOptions().size())"
    )
    QuestionResponse toQuestionResponse(Question question);

    QuestionOptionResponse toQuestionOptionResponse(QuestionOption option);

    @Mapping(
            target = "optionCount",
            expression = "java(question.getOptions() == null ? 0L : (long) question.getOptions().size())"
    )
    QuestionBankItemResponse toQuestionBankItemResponse(Question question);
}