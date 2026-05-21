package com.learning.english.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
