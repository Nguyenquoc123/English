package com.learning.english.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.learning.english.dto.response.VideoResponse;
import com.learning.english.entity.Video;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface VideoMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    VideoResponse toVideoResponse(Video video);
}