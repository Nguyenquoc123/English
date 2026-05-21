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

	List<Video> findAllByLessonLessonIdOrderByDisplayOrderAsc(Long lessonId);

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
