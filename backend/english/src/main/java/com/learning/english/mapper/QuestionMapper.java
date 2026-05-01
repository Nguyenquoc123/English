package com.learning.english.mapper;


import com.learning.english.dto.request.QuestionRequest;
import com.learning.english.dto.response.QuestionResponse;
import com.learning.english.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {QuestionOptionMapper.class}
)
public interface QuestionMapper {

    @Mapping(target = "questionId", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "options", ignore = true)
    Question toQuestion(QuestionRequest request);

    @Mapping(source = "lesson.lessonId", target = "lessonId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "createdBy.userId", target = "createdBy")
    QuestionResponse toQuestionResponse(Question question);
}