package com.learning.english.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.response.LessonResponse;
import com.learning.english.entity.Lesson;

@Mapper(componentModel = "spring")
public interface LessonMapper {
	@Mapping(source = "lessonId", target = "lessonId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    LessonResponse toLessonResponse(Lesson lesson);
}
