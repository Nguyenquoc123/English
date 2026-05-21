package com.learning.english.mapper;

import com.learning.english.dto.response.ExamListResponse;
import com.learning.english.dto.response.ExamResponse;
import com.learning.english.dto.response.StudentExamListResponse;
import com.learning.english.dto.response.TeacherExamDetailResponse;
import com.learning.english.dto.response.TeacherExamQuestionResponse;
import com.learning.english.entity.Exam;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ExamMapper {
	@Mapping(source = "course.courseId", target = "courseId")
	@Mapping(source = "course.title", target = "courseTitle")
	public ExamResponse toExamResponse(Exam exam);

	default TeacherExamDetailResponse toTeacherExamDetailResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return TeacherExamDetailResponse.builder().examId(toLong(row[0])).courseId(toLong(row[1]))
				.courseTitle(toStringValue(row[2])).title(toStringValue(row[3])).description(toStringValue(row[4]))
				.durationMinutes(toInteger(row[5])).maxAttempts(toInteger(row[6])).questionCount(toLong(row[7]))
				.totalPoint(toBigDecimal(row[8])).status(toStringValue(row[9])).startTime(toLocalDateTime(row[10]))
				.endTime(toLocalDateTime(row[11])).createdAt(toLocalDateTime(row[12]))
				.updatedAt(toLocalDateTime(row[13])).build();
	}

	default TeacherExamQuestionResponse toTeacherExamQuestionResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return TeacherExamQuestionResponse.builder().examQuestionId(toLong(row[0])).questionId(toLong(row[1]))
				.questionOrder(toInteger(row[2])).point(toBigDecimal(row[3])).questionType(toStringValue(row[4]))
				.content(toStringValue(row[5])).mediaUrl(toStringValue(row[6])).status(toStringValue(row[7]))
				.explanation(toStringValue(row[8])).build();
	}

	default List<TeacherExamQuestionResponse> toTeacherExamQuestionResponses(List<Object[]> rows) {
		if (rows == null) {
			return List.of();
		}

		return rows.stream().map(this::toTeacherExamQuestionResponse).toList();
	}

	default ExamListResponse toExamListResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return ExamListResponse.builder().examId(toLong(row[0])).courseId(toLong(row[1]))
				.courseTitle(toStringValue(row[2])).title(toStringValue(row[3])).description(toStringValue(row[4]))
				.durationMinutes(toInteger(row[5])).questionCount(toLong(row[6])).status(toStringValue(row[7]))
				.startTime(toLocalDateTime(row[8])).endTime(toLocalDateTime(row[9])).createdAt(toLocalDateTime(row[10]))
				.build();
	}

	default StudentExamListResponse toStudentExamListResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return StudentExamListResponse.builder().examId(toLong(row[0])).courseId(toLong(row[1]))
				.courseTitle(toStringValue(row[2])).title(toStringValue(row[3])).description(toStringValue(row[4]))
				.durationMinutes(toInteger(row[5])).maxAttempts(toInteger(row[6])).questionCount(toLong(row[7]))
				.totalPoint(toBigDecimal(row[8])).status(toStringValue(row[9])).startTime(toLocalDateTime(row[10]))
				.endTime(toLocalDateTime(row[11])).createdAt(toLocalDateTime(row[12])).build();
	}

	default List<StudentExamListResponse> toStudentExamListResponses(List<Object[]> rows) {
		if (rows == null) {
			return List.of();
		}

		return rows.stream().map(this::toStudentExamListResponse).toList();
	}

	default Long toLong(Object value) {
		if (value == null) {
			return 0L;
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

	default Integer toInteger(Object value) {
		if (value == null) {
			return 0;
		}

		if (value instanceof Integer integerValue) {
			return integerValue;
		}

		if (value instanceof Long longValue) {
			return longValue.intValue();
		}

		if (value instanceof Number numberValue) {
			return numberValue.intValue();
		}

		return Integer.parseInt(value.toString());
	}

	default BigDecimal toBigDecimal(Object value) {
		if (value == null) {
			return BigDecimal.ZERO;
		}

		if (value instanceof BigDecimal bigDecimalValue) {
			return bigDecimalValue;
		}

		if (value instanceof Number numberValue) {
			return BigDecimal.valueOf(numberValue.doubleValue());
		}

		return new BigDecimal(value.toString());
	}

	default String toStringValue(Object value) {
		return value == null ? null : value.toString();
	}

	default LocalDateTime toLocalDateTime(Object value) {
		if (value == null) {
			return null;
		}

		if (value instanceof LocalDateTime localDateTime) {
			return localDateTime;
		}

		if (value instanceof Timestamp timestamp) {
			return timestamp.toLocalDateTime();
		}

		return LocalDateTime.parse(value.toString());
	}
}