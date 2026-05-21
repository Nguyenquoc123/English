package com.learning.english.mapper;

import java.time.LocalDateTime;
import java.util.List;

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
    
    default VideoResponse toVideoResponseWithProgress(Object[] row) {
        VideoResponse response = new VideoResponse();

        response.setVideoId(toLong(row[0]));
        response.setLessonId(toLong(row[1]));
        response.setTitle((String) row[2]);
        response.setVideoUrl((String) row[3]);
        response.setDurationSeconds(toInteger(row[4]));
        response.setThumbnailUrl((String) row[5]);
        response.setDisplayOrder(toInteger(row[6]));
        response.setCreatedAt(toLocalDateTime(row[7]));
        response.setUpdatedAt(toLocalDateTime(row[8]));
        response.setStatus(row[9] == null ? null : row[9].toString());
        response.setIsCompleted(toBoolean(row[10]));
        response.setWatchedSeconds(toInteger(row[11]));

        return response;
    }

    default List<VideoResponse> toVideoResponseWithProgressList(List<Object[]> rows) {
        if (rows == null) {
            return List.of();
        }

        return rows.stream()
                .map(this::toVideoResponseWithProgress)
                .toList();
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.valueOf(value.toString());
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        return Integer.valueOf(value.toString());
    }

    private Boolean toBoolean(Object value) {
        if (value == null) {
            return false;
        }

        if (value instanceof Boolean bool) {
            return bool;
        }

        if (value instanceof Number number) {
            return number.intValue() == 1;
        }

        return Boolean.valueOf(value.toString());
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }

        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        return LocalDateTime.parse(value.toString());
    }
}