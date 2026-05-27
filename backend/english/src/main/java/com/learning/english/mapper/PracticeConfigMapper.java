package com.learning.english.mapper;

import com.learning.english.dto.response.PracticeConfigResponse;
import com.learning.english.dto.response.PracticeQuestionOptionResponse;
import com.learning.english.dto.response.PracticeQuestionResponse;
import com.learning.english.entity.ExamQuestion;
import com.learning.english.entity.LessonQuestion;
import com.learning.english.entity.Question;
import com.learning.english.entity.QuestionOption;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PracticeConfigMapper {

	default PracticeConfigResponse toPracticeConfigResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return PracticeConfigResponse.builder().configId(toLong(row[0])).lessonId(toLong(row[1]))
				.practiceType(toStringValue(row[2])).isEnabled(toBoolean(row[3])).questionCount(toLong(row[4]))
				.lanCuoi(toLocalDateTime(row[5]))
				.soLanLam(toLong(row[6]))
				.diemCaoNhat(toBigDecimal(row[7]))
				.build();
	}

	default List<PracticeConfigResponse> toPracticeConfigResponses(List<Object[]> rows) {
		if (rows == null) {
			return List.of();
		}

		return rows.stream().map(this::toPracticeConfigResponse).toList();
	}
	
	private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;

        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }

        return new BigDecimal(value.toString());
    }

    private java.time.LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;

        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        if (value instanceof java.time.LocalDateTime localDateTime) {
            return localDateTime;
        }

        return null;
    }

	default Long toLong(Object value) {
		if (value == null) {
			return null;
		}

		if (value instanceof Long longValue) {
			return longValue;
		}

		if (value instanceof Integer integerValue) {
			return integerValue.longValue();
		}

		if (value instanceof Number numberValue) {
			return numberValue.longValue();
		}

		return Long.parseLong(value.toString());
	}

	default String toStringValue(Object value) {
		return value == null ? null : value.toString();
	}

	default Boolean toBoolean(Object value) {
		if (value == null) {
			return false;
		}

		if (value instanceof Boolean booleanValue) {
			return booleanValue;
		}

		if (value instanceof Number numberValue) {
			return numberValue.intValue() == 1;
		}

		String text = value.toString();

		return "true".equalsIgnoreCase(text) || "1".equals(text) || "yes".equalsIgnoreCase(text);
	}

	@Mapping(target = "questionId", source = "question.questionId")
	@Mapping(target = "questionType", source = "question.questionType")
	@Mapping(target = "content", source = "question.content")
	@Mapping(target = "mediaUrl", source = "question.mediaUrl")
	@Mapping(target = "defaultPoint", source = "question.defaultPoint")
	@Mapping(target = "options", source = "question.options")
	@Mapping(target = "words", ignore = true)
	PracticeQuestionResponse toPracticeQuestionResponse(LessonQuestion lessonQuestion);
	
	
	PracticeQuestionResponse toPracticeQuestionResponse(Question Question);
	
	@Mapping(target = "questionId", source = "question.questionId")
	@Mapping(target = "questionType", source = "question.questionType")
	@Mapping(target = "content", source = "question.content")
	@Mapping(target = "mediaUrl", source = "question.mediaUrl")
	@Mapping(target = "defaultPoint", source = "question.defaultPoint")
	@Mapping(target = "options", source = "question.options")
	@Mapping(target = "words", ignore = true)
	PracticeQuestionResponse toExamQuestionResponse(ExamQuestion examQuestion);

	PracticeQuestionOptionResponse toPracticeQuestionOptionResponse(QuestionOption option);

	List<PracticeQuestionResponse> toPracticeQuestionResponses(List<LessonQuestion> lessonQuestions);
	List<PracticeQuestionResponse> toExamQuestionResponses(List<ExamQuestion> examQuestions);

	
	@AfterMapping
	default void afterMapQuestion(LessonQuestion lessonQuestion, @MappingTarget PracticeQuestionResponse response) {
		if (lessonQuestion == null || lessonQuestion.getQuestion() == null) {
			return;
		}

		Question question = lessonQuestion.getQuestion();

		if ("ARRANGE_SENTENCE".equalsIgnoreCase(question.getQuestionType())) {
			response.setWords(buildShuffledWords(question.getCorrectText()));
		}

		
		if (response.getOptions() == null) {
			response.setOptions(List.of());
		}
	}

	default List<String> buildShuffledWords(String correctText) {
		if (correctText == null || correctText.isBlank()) {
			return List.of();
		}

		String[] parts = correctText.trim().split("\\s+");

		List<String> words = new ArrayList<>();

		for (String part : parts) {
			if (part != null && !part.isBlank()) {
				words.add(part);
			}
		}

		Collections.shuffle(words);

		return words;
	}
}
