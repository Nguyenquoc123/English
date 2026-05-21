package com.learning.english.mapper;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.response.LessonListItemResponse;
import com.learning.english.dto.response.LessonListResponse;
import com.learning.english.dto.response.LessonResponse;
import com.learning.english.dto.response.StudentLessonDetailResponse;
import com.learning.english.dto.response.StudentLessonResponse;
import com.learning.english.entity.CourseItem;
import com.learning.english.entity.Exam;
import com.learning.english.entity.Lesson;

@Mapper(componentModel = "spring")
public interface LessonMapper {
	@Mapping(source = "lessonId", target = "lessonId")
	@Mapping(source = "course.courseId", target = "courseId")
	@Mapping(source = "course.title", target = "courseTitle")
	LessonResponse toLessonResponse(Lesson lesson);

	public default StudentLessonResponse toLessonResponse(
            CourseItem courseItem,
            Boolean completed,
            Boolean locked,
            Boolean current,
            String lockReason
    ) {
        Lesson lesson = courseItem.getLesson();

        return StudentLessonResponse.builder()
                .courseItemId(courseItem.getCourseItemId())
                .id(lesson.getLessonId())
                .type("LESSON")
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .itemOrder(courseItem.getItemOrder())
                .status(lesson.getStatus())
                .completed(completed)
                .locked(locked)
                .current(current)
                .lockReason(lockReason)
                .createdAt(lesson.getCreatedAt())
                .build();
    }

    public default StudentLessonResponse toExamResponse(
            CourseItem courseItem,
            Boolean completed,
            Boolean locked,
            Boolean current,
            String lockReason
    ) {
        Exam exam = courseItem.getExam();

        return StudentLessonResponse.builder()
                .courseItemId(courseItem.getCourseItemId())
                .id(exam.getExamId())
                .type("EXAM")
                .title(exam.getTitle())
                .description(exam.getDescription())
                .itemOrder(courseItem.getItemOrder())
                .status(exam.getStatus())
                .completed(completed)
                .locked(locked)
                .current(current)
                .freePreview(false)
                .lockReason(lockReason)
                .createdAt(exam.getCreatedAt())
                .build();
    }
	
	@Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "courseTitle", source = "course.title")
    StudentLessonDetailResponse toStudentLessonDetailResponse(Lesson lesson);

	public default LessonListResponse toLessonListResponse(CourseItem courseItem) {
        if (courseItem == null) {
            return null;
        }

        if ("LESSON".equalsIgnoreCase(courseItem.getItemType())) {
            return mapLesson(courseItem);
        }

        if ("EXAM".equalsIgnoreCase(courseItem.getItemType())) {
            return mapExam(courseItem);
        }

        return null;
    }

	private LessonListResponse mapLesson(CourseItem courseItem) {
        Lesson lesson = courseItem.getLesson();

        if (lesson == null) {
            return null;
        }

        return LessonListResponse.builder()
                .courseItemId(courseItem.getCourseItemId())
                .id(lesson.getLessonId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .type("LESSON")
                .status(lesson.getStatus())
                .itemOrder(courseItem.getItemOrder())
                .createdAt(lesson.getCreatedAt())
                .build();
    }

    private LessonListResponse mapExam(CourseItem courseItem) {
        Exam exam = courseItem.getExam();

        if (exam == null) {
            return null;
        }

        return LessonListResponse.builder()
                .courseItemId(courseItem.getCourseItemId())
                .id(exam.getExamId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .type("EXAM")
                .status(exam.getStatus())
                .itemOrder(courseItem.getItemOrder())
                .createdAt(exam.getCreatedAt())
                .build();
    }

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
