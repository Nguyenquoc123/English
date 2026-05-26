package com.learning.english.repository;

import com.learning.english.entity.LessonPracticeConfig;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeConfigRepository extends JpaRepository<LessonPracticeConfig, Long> {

	boolean existsByLesson_LessonIdAndPracticeType(Long lessonId, String practiceType);

//	

//    @Query("""
//			    SELECT
//			        lpc.configId AS configId,
//			        l.lessonId AS lessonId,
//			        lpc.practiceType AS practiceType,
//			        lpc.isEnabled AS isEnabled,
//			        COUNT(lq.lessonQuestionId) AS questionCount
//			    FROM LessonPracticeConfig lpc
//			    JOIN lpc.lesson l
//			    LEFT JOIN LessonQuestion lq
//			        ON lq.lesson.lessonId = l.lessonId
//			        AND lq.question.questionType = lpc.practiceType
//			        AND lq.question.status = 'Published'
//			    WHERE l.lessonId = :lessonId
//			      AND l.status = 'Published'
//			      AND l.course.status = 'Published'
//			    GROUP BY
//			        lpc.configId,
//			        l.lessonId,
//			        lpc.practiceType,
//			        lpc.isEnabled
//			    ORDER BY
//			        CASE lpc.practiceType
//			            WHEN 'MULTIPLE_CHOICE' THEN 1
//			            WHEN 'LISTENING_CHOICE' THEN 2
//			            WHEN 'LISTENING_FILL_BLANK' THEN 3
//			            WHEN 'ARRANGE_SENTENCE' THEN 4
//			            WHEN 'WRITING_SHORT' THEN 5
//			            ELSE 99
//			        END
//			""")
//    List<Object[]> findStudentPracticeConfigsByLessonId(@Param("lessonId") Long lessonId);
	
	@Query("""
		    SELECT
		        lpc.configId AS configId,
		        l.lessonId AS lessonId,
		        lpc.practiceType AS practiceType,
		        lpc.isEnabled AS isEnabled,
		        COUNT(DISTINCT lq.lessonQuestionId) AS questionCount,

		        MAX(a.submittedAt) AS lastSubmittedAt,
		        COUNT(DISTINCT a.attemptId) AS attemptCount,
		        MAX(a.score) AS highestScore

		    FROM LessonPracticeConfig lpc
		    JOIN lpc.lesson l

		    LEFT JOIN LessonQuestion lq
		        ON lq.lesson.lessonId = l.lessonId
		        AND lq.question.questionType = lpc.practiceType
		        AND lq.question.status = 'PUBLISHED'

		    LEFT JOIN Attempt a
		        ON a.user.userId = :userId
		        AND a.lesson.lessonId = l.lessonId
		        AND a.practiceType = lpc.practiceType
		        AND a.attemptType = 'PRACTICE'

		    WHERE l.lessonId = :lessonId
		      AND l.status = 'PUBLISHED'
		      AND l.course.status = 'PUBLISHED'

		    GROUP BY
		        lpc.configId,
		        l.lessonId,
		        lpc.practiceType,
		        lpc.isEnabled

		    ORDER BY
		        CASE lpc.practiceType
		            WHEN 'MULTIPLE_CHOICE' THEN 1
		            WHEN 'LISTENING_CHOICE' THEN 2
		            WHEN 'LISTENING_FILL_BLANK' THEN 3
		            WHEN 'ARRANGE_SENTENCE' THEN 4
		            WHEN 'WRITING_SHORT' THEN 5
		            ELSE 99
		        END
		""")
		List<Object[]> findStudentPracticeConfigsByLessonId(
		    @Param("lessonId") Long lessonId,
		    @Param("userId") Long userId
		);

    boolean existsByLessonLessonIdAndPracticeTypeAndIsEnabledTrue(
            Long lessonId,
            String practiceType
    );
}
