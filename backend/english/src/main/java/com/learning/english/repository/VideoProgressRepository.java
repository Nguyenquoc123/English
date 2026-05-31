package com.learning.english.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.VideoProgress;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
	Optional<VideoProgress> findByUserUserIdAndVideoVideoId(Long userId, Long videoId);

	@Query("""
			    SELECT COUNT(vp)
			    FROM VideoProgress vp
			    WHERE vp.user.userId = :userId
			    AND vp.video.lesson.lessonId = :lessonId
			    AND (
			        (1.0 * vp.watchedseconds)
			        / vp.video.durationSeconds
			    ) >= 0.7
			""")
	long countCompletedVideos(Long userId, Long lessonId);

    @Query("""
            SELECT COUNT(DISTINCT l.lessonId)
            FROM Lesson l
            WHERE l.course.courseId = :courseId
              AND l.status NOT IN ('Deleted', 'HIDDEN', 'Hidden')
              AND EXISTS (
                  SELECT vp FROM VideoProgress vp
                  WHERE vp.user.userId = :userId
                    AND vp.video.lesson.lessonId = l.lessonId
                    AND (
                        vp.iscompleted = true
                        OR (
                            vp.video.durationSeconds IS NOT NULL
                            AND vp.video.durationSeconds > 0
                            AND (1.0 * vp.watchedseconds / vp.video.durationSeconds) >= 0.7
                        )
                    )
              )
            """)
    long countCompletedLessonsByUserAndCourse(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId
    );
}
