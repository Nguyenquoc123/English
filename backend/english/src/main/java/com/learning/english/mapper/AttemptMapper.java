package com.learning.english.mapper;


import com.learning.english.dto.response.AttemptResponse;
import com.learning.english.entity.Attempt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttemptMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "lesson.lessonId", target = "lessonId")
    @Mapping(source = "lesson.title", target = "lessonTitle")
    @Mapping(source = "exam.examId", target = "examId")
    @Mapping(source = "exam.title", target = "examTitle")
    AttemptResponse toAttemptResponse(Attempt attempt);
}