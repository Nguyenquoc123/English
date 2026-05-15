package com.learning.english.mapper;

import com.learning.english.dto.response.CourseReviewResponse;
import com.learning.english.entity.CourseReview;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CourseReviewMapper {

    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    CourseReviewResponse toCourseReviewResponse(CourseReview review);
}