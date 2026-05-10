package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Lesson;
import com.learning.english.entity.Question;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
	List<Lesson> findByCourse_CourseId(Long courseId);

	List<Lesson> findByCourse_CourseIdAndStatus(Long courseId, String status);

	@Query("""
			    SELECT MAX(l.lessonOrder)
			    FROM Lesson l
			    WHERE l.course.courseId = :courseId
			      AND l.status <> 'Deleted'
			""")
	Integer findMaxLessonOrderByCourseId(@Param("courseId") Long courseId);

	@Query(value = """
			SELECT
			    l.lessonId,
			    l.lessonOrder,
			    l.title,
			    l.description,
			    l.status,

			    ISNULL(videoStats.videoCount, 0) AS videoCount,
			    ISNULL(vocabStats.vocabularyCount, 0) AS vocabularyCount,
			    ISNULL(grammarStats.grammarCount, 0) AS grammarCount,
			    ISNULL(questionStats.practiceCount, 0) AS practiceCount,

			    l.createdAt

			FROM lessons l

			LEFT JOIN (
			    SELECT
			        lessonId,
			        COUNT(*) AS videoCount
			    FROM videos
			    GROUP BY lessonId
			) videoStats
			    ON l.lessonId = videoStats.lessonId

			LEFT JOIN (
			    SELECT
			        lessonId,
			        COUNT(*) AS vocabularyCount
			    FROM vocabularies
			    GROUP BY lessonId
			) vocabStats
			    ON l.lessonId = vocabStats.lessonId

			LEFT JOIN (
			    SELECT
			        lessonId,
			        COUNT(*) AS grammarCount
			    FROM grammars
			    GROUP BY lessonId
			) grammarStats
			    ON l.lessonId = grammarStats.lessonId

			LEFT JOIN (
			    SELECT
			        lessonId,
			        COUNT(*) AS practiceCount
			    FROM lesson_questions
			    GROUP BY lessonId
			) questionStats
			    ON l.lessonId = questionStats.lessonId

			WHERE l.courseId = :courseId
			  AND l.status <> 'Deleted'
			  AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
			  AND (:status IS NULL OR l.status = :status)

			ORDER BY l.lessonOrder ASC
			""", nativeQuery = true)
	List<Object[]> searchLessonListRaw(@Param("courseId") Long courseId, @Param("keyword") String keyword,
			@Param("status") String status);

	@Query("""
			    SELECT l
			    FROM Lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE l.lessonId = :lessonId
			      AND c.courseId = :courseId
			      AND l.status <> 'Deleted'
			      AND c.status <> 'Deleted'
			      AND t.username = :username
			""")
	Optional<Lesson> findTeacherLessonDetail(@Param("courseId") Long courseId, @Param("lessonId") Long lessonId,
			@Param("username") String username);

	@Query("""
			    SELECT l
			    FROM Lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE l.lessonId = :lessonId
			      AND c.courseId = :courseId
			      AND l.status <> 'Deleted'
			      AND c.status <> 'Deleted'
			""")
	Optional<Lesson> findTeacherLessonDetailByAdmin(@Param("courseId") Long courseId, @Param("lessonId") Long lessonId);

	@Query("""
			    SELECT l
			    FROM Lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE l.lessonId = :lessonId
			      AND l.status <> 'Deleted'
			      AND c.status <> 'Deleted'
			      AND t.username = :username
			""")
	Optional<Lesson> findLessonOfTeacher(@Param("lessonId") Long lessonId, @Param("username") String username);

	@Query("""
			    SELECT l
			    FROM Lesson l
			    WHERE l.course.courseId = :courseId
			      AND l.status <> 'Deleted'
			    ORDER BY l.lessonOrder ASC
			""")
	List<Lesson> findLessonsForStudentByCourseId(@Param("courseId") Long courseId);

	@Query("""
			    SELECT COUNT(l)
			    FROM Lesson l
			    WHERE l.course.courseId = :courseId
			      AND l.status <> 'Deleted'
			""")
	Long countLessonsByCourseId(@Param("courseId") Long courseId);

	List<Lesson> findAllByCourseCourseIdAndStatusOrderByLessonOrderAsc(Long courseId, String status);
}
