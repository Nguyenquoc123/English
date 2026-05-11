package com.learning.english.mapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.response.LessonListItemResponse;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.dto.response.StudentLessonDetailResponse;
import com.learning.english.dto.response.StudentLessonResponse;
import com.learning.english.entity.Lesson;

@Mapper(componentModel = "spring")
public interface LessonMapper {
	@Mapping(source = "lessonId", target = "lessonId")
	@Mapping(source = "course.courseId", target = "courseId")
	@Mapping(source = "course.title", target = "courseTitle")
	LessonResponse toLessonResponse(Lesson lesson);

	@Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "isLocked", ignore = true)
    StudentLessonResponse toStudentLessonResponse(Lesson lesson);
	
	@Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "courseTitle", source = "course.title")
    StudentLessonDetailResponse toStudentLessonDetailResponse(Lesson lesson);

	default LessonListItemResponse toLessonListItemResponse(Object[] row) {
		if (row == null) {
			return null;
		}

		return LessonListItemResponse.builder().lessonId(toLong(row[0])).lessonOrder(toInteger(row[1]))
				.title(toStringValue(row[2])).description(toStringValue(row[3])).status(toStringValue(row[4]))
				.videoCount(toLong(row[5])).vocabularyCount(toLong(row[6])).grammarCount(toLong(row[7]))
				.practiceCount(toLong(row[8])).createdAt(toLocalDateTime(row[9])).build();
	}

	private String toStringValue(Object value) {
		return value == null ? null : value.toString();
	}

	private Long toLong(Object value) {
		if (value == null) {
			return 0L;
		}

		if (value instanceof Number number) {
			return number.longValue();
		}

		return Long.parseLong(value.toString());
	}

	private Integer toInteger(Object value) {
		if (value == null) {
			return 0;
		}

		if (value instanceof Number number) {
			return number.intValue();
		}

		return Integer.parseInt(value.toString());
	}

	private LocalDateTime toLocalDateTime(Object value) {
		if (value == null) {
			return null;
		}

		if (value instanceof LocalDateTime localDateTime) {
			return localDateTime;
		}

		if (value instanceof Timestamp timestamp) {
			return timestamp.toLocalDateTime();
		}

		return null;
	}
}
