package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Grammar;
@Repository
public interface GrammarRepository extends JpaRepository<Grammar, Long> {

	List<Grammar> findByLesson_LessonIdOrderByGrammarIdAsc(Long lessonId);

	List<Grammar> findAllByLessonLessonIdOrderByCreatedAtAsc(Long lessonId);

	@Query("""
			    SELECT g
			    FROM Grammar g
			    JOIN FETCH g.lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE g.grammarId = :grammarId
			      AND t.username = :username
			""")
	Optional<Grammar> findGrammarOfTeacher(@Param("grammarId") Long grammarId, @Param("username") String username);

	@Query("""
			    SELECT g
			    FROM Grammar g
			    JOIN FETCH g.lesson l
			    JOIN FETCH l.course c
			    JOIN FETCH c.teacher t
			    WHERE g.grammarId = :grammarId
			""")
	Optional<Grammar> findGrammarOfTeacherByAdmin(@Param("grammarId") Long grammarId);

	Long countByLessonLessonId(Long lessonId);
}