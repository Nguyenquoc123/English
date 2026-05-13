package com.learning.english.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.learning.english.dto.response.LessonGrammarResponse;
import com.learning.english.dto.response.LessonQuestionResponse;
import com.learning.english.dto.response.LessonVideoResponse;
import com.learning.english.dto.response.LessonVocabularyResponse;
import com.learning.english.dto.response.TeacherLessonDetailResponse;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Grammar;
import com.learning.english.entity.Video;
import com.learning.english.entity.Question;
import com.learning.english.entity.Vocabulary;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TeacherLessonDetailMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "courseId", source = "lesson.course.courseId")
    @Mapping(target = "courseTitle", source = "lesson.course.title")
    @Mapping(target = "title", source = "lesson.title")
    @Mapping(target = "description", source = "lesson.description")
    @Mapping(target = "lessonOrder", source = "lesson.lessonOrder")
    @Mapping(target = "status", source = "lesson.status")
    @Mapping(target = "createdAt", source = "lesson.createdAt")
    @Mapping(target = "updatedAt", source = "lesson.updatedAt")
    @Mapping(target = "videos", source = "videos")
    @Mapping(target = "vocabularies", source = "vocabularies")
    @Mapping(target = "grammars", source = "grammars")
    @Mapping(target = "questions", source = "questions")
    TeacherLessonDetailResponse toTeacherLessonDetailResponse(
            Lesson lesson,
            List<Video> videos,
            List<Vocabulary> vocabularies,
            List<Grammar> grammars,
            List<Question> questions
    );

    @Mapping(target = "videoId", source = "videoId")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "videoUrl", source = "videoUrl")
//    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "thumbnailUrl", source = "thumbnailUrl")
//    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "createdAt")
    LessonVideoResponse toVideoResponse(Video video);

    @Mapping(target = "vocabularyId", source = "vocabularyId")
    @Mapping(target = "word", source = "word")
    @Mapping(target = "pronunciation", source = "pronunciation")
    @Mapping(target = "meaning", source = "meaning")
    @Mapping(target = "exampleSentence", source = "exampleSentence")
    @Mapping(target = "audioUrl", source = "audioUrl")
    LessonVocabularyResponse toVocabularyResponse(Vocabulary vocabulary);

    @Mapping(target = "grammarId", source = "grammarId")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "content", source = "contentHtml")
//    @Mapping(target = "status", source = "status")
    LessonGrammarResponse toGrammarResponse(Grammar grammar);

    @Mapping(target = "questionId", source = "questionId")
    @Mapping(target = "questionType", source = "questionType")
    @Mapping(target = "content", source = "content")
    @Mapping(target = "status", source = "status")
    @Mapping(
            target = "optionCount",
            expression = "java(question.getOptions() == null ? 0L : (long) question.getOptions().size())"
    )
    LessonQuestionResponse toQuestionResponse(Question question);
}