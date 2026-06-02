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
    @Mapping(target = "levelId", source = "level.levelId")
    @Mapping(target = "levelName", source = "level.levelName")
    QuestionResponse toQuestionResponse(Question question);

    QuestionOptionResponse toQuestionOptionResponse(QuestionOption option);

    @Mapping(
            target = "optionCount",
            expression = "java(question.getOptions() == null ? 0L : (long) question.getOptions().size())"
    )
    @Mapping(target = "levelId", source = "level.levelId")
    @Mapping(target = "levelName", source = "level.levelName")
    QuestionBankItemResponse toQuestionBankItemResponse(Question question);
}