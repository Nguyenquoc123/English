package com.learning.english.mapper;

import com.learning.english.dto.response.CourseComboboxResponse;
import com.learning.english.dto.response.CourseDetailResponse;
import com.learning.english.dto.response.CourseResponse;
import com.learning.english.dto.response.StudentCourseDetailResponse;
import com.learning.english.entity.Course;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(source = "teacher.userId", target = "teacherId")
    @Mapping(source = "teacher.fullName", target = "teacherName")
    @Mapping(source = "teacher.avatarUrl", target = "avatarUrl")
    @Mapping(source = "level.levelId", target = "levelId")
    @Mapping(source = "level.levelName", target = "levelName")
    @Mapping(source = "reviewedBy.userId", target = "reviewedBy")
    CourseResponse toCourseResponse(Course course);
    
    CourseComboboxResponse toComboboxResponse(Course course);
    
    @Mapping(target = "levelId", source = "level.levelId")
    @Mapping(target = "levelName", source = "level.levelName")
    @Mapping(target = "accessType", source = "courseType")
    @Mapping(target = "teacherId", source = "teacher.userId")
    @Mapping(target = "teacherName", source = "teacher.fullName")
    @Mapping(target = "teacherAvatarUrl", source = "teacher.avatarUrl")
    StudentCourseDetailResponse toStudentCourseDetailResponse(Course course);
    
    
    default CourseDetailResponse toCourseDetailResponse(Object[] row) {
        if (row == null) {
            return null;
        }

        return CourseDetailResponse.builder()
                .courseId(toLong(row[0]))
                .title(toString(row[1]))
                .description(toString(row[2]))
                .thumbnailUrl(toString(row[3]))
                .levelName(toString(row[4]))
                .accessType(toString(row[5]))
                .price(toBigDecimal(row[6]))
                .status(toString(row[7]))
                .lessonCount(toLong(row[8]))
                .studentCount(toLong(row[9]))
                .rating(toDouble(row[10]))
                .revenue(toBigDecimal(row[11]))
                .createdAt(toLocalDateTime(row[12]))
                .updatedAt(toLocalDateTime(row[13]))
                .submittedAt(toLocalDateTime(row[14]))
                .approvedAt(toLocalDateTime(row[15]))
                .rejectReason(toString(row[16]))
                .teacherName(toString(row[17]))
                .levelId(toLong(row[18]))
                .shortDescription(toString(row[19]))
                .build();
    }
    
    private String toString(Object value) {
        return value == null ? null : value.toString();
    }

    private String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private Long toLong(Object value) {
        if (value == null) return 0L;

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(value.toString());
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        return Double.parseDouble(value.toString());
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
}