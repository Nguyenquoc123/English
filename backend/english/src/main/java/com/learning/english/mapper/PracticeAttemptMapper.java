package com.learning.english.mapper;

import com.learning.english.dto.response.PracticeSubmitDetailResponse;
import com.learning.english.dto.response.PracticeSubmitResponse;
import com.learning.english.entity.Attempt;
import com.learning.english.entity.AttemptDetail;
import com.learning.english.entity.QuestionOption;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PracticeAttemptMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "lessonTitle", source = "lesson.title")
    @Mapping(target = "details", ignore = true)
    PracticeSubmitResponse toPracticeSubmitResponse(Attempt attempt);

    @Mapping(target = "questionId", source = "question.questionId")
    @Mapping(target = "questionType", source = "question.questionType")
    @Mapping(target = "content", source = "question.content")
    @Mapping(target = "selectedOptionId", source = "selectedOption.optionId")
    @Mapping(target = "selectedOptionText", source = "selectedOption.optionText")
    @Mapping(target = "correctAnswer", expression = "java(getCorrectAnswer(detail))")
    @Mapping(target = "explanation", source = "question.explanation")
    PracticeSubmitDetailResponse toPracticeSubmitDetailResponse(AttemptDetail detail);

    List<PracticeSubmitDetailResponse> toPracticeSubmitDetailResponses(
            List<AttemptDetail> details
    );

    default String getCorrectAnswer(AttemptDetail detail) {
        if (detail == null || detail.getQuestion() == null) {
            return null;
        }

        String questionType = detail.getQuestion().getQuestionType();

        if ("MULTIPLE_CHOICE".equalsIgnoreCase(questionType)
                || "LISTENING_CHOICE".equalsIgnoreCase(questionType)) {

            if (detail.getQuestion().getOptions() == null) {
                return null;
            }

            return detail.getQuestion().getOptions()
                    .stream()
                    .filter(option -> Boolean.TRUE.equals(option.getIsCorrect()))
                    .map(QuestionOption::getOptionText)
                    .findFirst()
                    .orElse(null);
        }

        return detail.getQuestion().getCorrectText();
    }
}