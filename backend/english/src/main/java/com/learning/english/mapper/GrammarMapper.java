package com.learning.english.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.learning.english.dto.response.GrammarResponse;
import com.learning.english.entity.Grammar;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface GrammarMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    GrammarResponse toGrammarResponse(Grammar grammar);
}