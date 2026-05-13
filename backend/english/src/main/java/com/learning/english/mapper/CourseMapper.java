package com.learning.english.mapper;

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
    @Mapping(source = "level.levelId", target = "levelId")
    @Mapping(source = "level.levelName", target = "levelName")
    @Mapping(source = "reviewedBy.userId", target = "reviewedBy")
    CourseResponse toCourseResponse(Course course);
    
    @Mapping(target = "levelId", source = "level.levelId")
    @Mapping(target = "levelName", source = "level.levelName")
    @Mapping(target = "accessType", source = "courseType")
    @Mapping(target = "teacherId", source = "teacher.userId")
    @Mapping(target = "teacherName", source = "teacher.fullName")
    @Mapping(target = "teacherAvatarUrl", source = "teacher.avatarUrl")
    StudentCourseDetailResponse toStudentCourseDetailResponse(Course course);
    
    
    default CourseDetailResponse mapToCourseDetailResponse(Object[] row) {
        return CourseDetailResponse.builder()
                .courseId(toLong(row[0]))
                .title(toStringValue(row[1]))
                .description(toStringValue(row[2]))
                .thumbnailUrl(toStringValue(row[3]))
                .levelName(toStringValue(row[4]))
                .accessType(toStringValue(row[5]))
                .price(toBigDecimal(row[6]))
                .practicePrice(toBigDecimal(row[7]))
                .status(toStringValue(row[8]))
                .lessonCount(toLong(row[9]))
                .studentCount(toLong(row[10]))
                .examCount(toLong(row[11]))
                .rating(toDouble(row[12]))
                .revenue(toBigDecimal(row[13]))
                .createdAt(toLocalDateTime(row[14]))
                .updatedAt(toLocalDateTime(row[15]))
                .submittedAt(toLocalDateTime(row[16]))
                .approvedAt(toLocalDateTime(row[17]))
                .rejectReason(toStringValue(row[18]))
                .teacherName(toStringValue(row[19]))
                .levelId(toLong(row[20]))
                .build();
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