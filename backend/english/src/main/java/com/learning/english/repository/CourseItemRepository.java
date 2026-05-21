package com.learning.english.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.CourseItem;

@Repository
public interface CourseItemRepository extends JpaRepository<CourseItem, Long> {

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
		List<CourseItem> findPublishedCourseContentsByCourseId(
		        @Param("courseId") Long courseId
		);
}