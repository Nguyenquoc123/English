package com.learning.english.mapper;

import com.learning.english.dto.response.VocabularyResponse;
import com.learning.english.entity.Vocabulary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VocabularyMapper {

    @Mapping(source = "lesson.lessonId", target = "lessonId")
    VocabularyResponse toVocabularyResponse(Vocabulary vocabulary);
}