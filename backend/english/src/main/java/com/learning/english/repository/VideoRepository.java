package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Video;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
	List<Video> findByLesson_LessonIdOrderByVideoIdAsc(Long lessonId);

	List<Video> findByLessonLessonId(Long lessonId);

	@Query("""
			    SELECT COUNT(v)
			    FROM Video v
			    WHERE v.lesson.lessonId = :lessonId and v.status = 'PUBLISHED'
			""")
	long countVideos(Long lessonId);

	@Query(value = """
			SELECT
			    v.videoId AS videoId,
			    v.lessonId AS lessonId,
			    v.title AS title,
			    v.videoUrl AS videoUrl,
			    v.durationSeconds AS durationSeconds,
			    v.thumbnailUrl AS thumbnailUrl,
			    v.displayOrder AS displayOrder,
			    v.createdAt AS createdAt,
			    v.updatedAt AS updatedAt,
			    v.status AS status,
			    CAST(ISNULL(vp.isCompleted, 0) AS bit) AS isCompleted,
			    ISNULL(vp.watchedSeconds, 0) AS watchedSeconds,
			    v.fileUrl as fileUrl
			FROM videos v
			LEFT JOIN video_progress vp
			    ON v.videoId = vp.videoId
			   AND vp.userId = :userId
			WHERE v.lessonId = :lessonId
			ORDER BY v.displayOrder ASC
			""", nativeQuery = true)
	List<Object[]> findVideosWithProgressByLessonId(@Param("lessonId") Long lessonId, @Param("userId") Long userId);

	@Query("""
			    SELECT MAX(v.displayOrder)
			    FROM Video v
			    WHERE v.lesson.lessonId = :lessonId
			""")
	Integer findMaxDisplayOrderByLessonId(@Param("lessonId") Long lessonId);

	@Query("""
			    SELECT v
			    FROM Video v
			    JOIN FETCH v.lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE v.videoId = :videoId
			      AND t.username = :username
			""")
	Optional<Video> findVideoOfTeacher(@Param("videoId") Long videoId, @Param("username") String username);

	@Query("""
			    SELECT v
			    FROM Video v
			    JOIN FETCH v.lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE v.videoId = :videoId
			""")
	Optional<Video> findVideoOfTeacherByAdmin(@Param("videoId") Long videoId);

	Long countByLessonLessonId(Long lessonId);
}
