package com.learning.english.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Lesson;
import com.learning.english.entity.Level;

@Repository
public interface LevelRepository extends JpaRepository<Level, Long> {
	Optional<Level> findByLevelName(String levelName);

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
}
