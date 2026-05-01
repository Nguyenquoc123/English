package com.learning.english.mapper;

import com.learning.english.dto.response.CourseResponse;
import com.learning.english.entity.Course;
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
}