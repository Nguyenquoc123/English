package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.dto.response.LessonResponse;
import com.learning.english.entity.CourseItem;

@Repository
public interface CourseItemRepository extends JpaRepository<CourseItem, Long> {
	
	Optional<CourseItem> findByLesson_LessonId(Long lessonId);
	Optional<CourseItem> findByExam_ExamId(Long examId);

	@Query("""
			    SELECT MAX(ci.itemOrder)
			    FROM CourseItem ci
			    WHERE ci.course.courseId = :courseId
			""")
	Integer findMaxItemOrderByCourseId(Long courseId);

	@Query("""
			    SELECT ci
			    FROM CourseItem ci
			    LEFT JOIN FETCH ci.lesson l
			    LEFT JOIN FETCH ci.exam e
			    WHERE ci.course.courseId = :courseId
			      AND (
			            (
			                ci.itemType = 'LESSON'
			                AND l IS NOT NULL
			                AND l.status <> 'HIDDEN'
			                AND (:status IS NULL OR l.status = :status)
			                AND (
			                    :keyword IS NULL
			                    OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			                )
			            )
			            OR
			            (
			                ci.itemType = 'EXAM'
			                AND e IS NOT NULL
			                AND e.status <> 'HIDDEN'
			                AND (:status IS NULL OR e.status = :status)
			                AND (
			                    :keyword IS NULL
			                    OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			                )
			            )
			          )
			    ORDER BY ci.itemOrder ASC
			""")
	List<CourseItem> findCourseContentsByCourseId(@Param("courseId") Long courseId, @Param("keyword") String keyword,
			@Param("status") String status);

	@Query("""
			    SELECT ci
			    FROM CourseItem ci
			    LEFT JOIN FETCH ci.lesson l
			    LEFT JOIN FETCH ci.exam e
			    WHERE ci.course.courseId = :courseId
			      AND (
			            (
			                ci.itemType = 'LESSON'
			                AND l IS NOT NULL
			                AND l.status = 'PUBLISHED'
			            )
			            OR
			            (
			                ci.itemType = 'EXAM'
			                AND e IS NOT NULL
			                AND e.status = 'PUBLISHED'
			            )
			          )
			    ORDER BY ci.itemOrder ASC
			""")
	List<CourseItem> findPublishedCourseContentsByCourseId(@Param("courseId") Long courseId);

	List<CourseItem> findByCourse_CourseIdOrderByItemOrderAsc(Long courseId);

	Optional<CourseItem> findByCourseItemIdAndCourse_CourseId(Long courseItemId, Long courseId);

	boolean existsByCourseItemIdAndCourse_CourseId(Long courseItemId, Long courseId);

	long countByCourse_CourseId(Long courseId);

	/**
	 * Bước 1: Đẩy itemOrder sang số âm để tránh lỗi unique(courseId, itemOrder) khi
	 * đổi thứ tự, ví dụ 1 đổi sang 2, 2 đổi sang 1.
	 */
	@Modifying
	@Query("""
			    UPDATE CourseItem ci
			    SET ci.itemOrder = ci.courseItemId + 1000000
			    WHERE ci.course.courseId = :courseId
			""")
	void moveOrdersToTemporaryLargeNumber(Long courseId);

	@Modifying
	@Query("""
			    UPDATE CourseItem ci
			    SET ci.itemOrder = :itemOrder
			    WHERE ci.course.courseId = :courseId
			      AND ci.courseItemId = :courseItemId
			""")
	int updateItemOrder(Long courseId, Long courseItemId, Integer itemOrder);

	boolean existsByCourseCourseIdAndLessonLessonIdAndIsFreePreviewTrue(Long courseId, Long lessonId);

	boolean existsByCourseCourseIdAndExamExamIdAndIsFreePreviewTrue(Long courseId, Long examId);

	@Query("""
			    SELECT new com.learning.english.dto.response.LessonResponse(
			        l.lessonId,
			        l.title,
			        l.description,
			        l.status,
			        ci.isFreePreview
			    )
			    FROM CourseItem ci
			    JOIN ci.lesson l
			    WHERE l.lessonId = :lessonId
			      AND ci.itemType = 'LESSON'
			""")
	Optional<LessonResponse> findLessonResponseByLessonId(@Param("lessonId") Long lessonId);
}