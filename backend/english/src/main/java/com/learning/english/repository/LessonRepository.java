package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learning.english.entity.CourseItem;
import com.learning.english.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findAllByCourseCourseId(Long courseId);

    List<Lesson> findByCourse_CourseId(Long courseId);

    List<Lesson> findByCourse_CourseIdAndStatus(Long courseId, String status);

    @Query("""
        SELECT l
        FROM Lesson l
        JOIN FETCH l.course c
        WHERE l.lessonId = :lessonId
          AND l.status = 'PUBLISHED'
          AND c.status = 'PUBLISHED'
    """)
    Optional<Lesson> findStudentLessonDetailByLessonId(@Param("lessonId") Long lessonId);
    
   

    @Query(value = """
        SELECT
            l.lessonId,
            ci.itemOrder,
            l.title,
            l.description,
            l.status,

            ISNULL(videoStats.videoCount, 0) AS videoCount,
            ISNULL(vocabStats.vocabularyCount, 0) AS vocabularyCount,
            ISNULL(grammarStats.grammarCount, 0) AS grammarCount,
            ISNULL(questionStats.practiceCount, 0) AS practiceCount,

            l.createdAt

        FROM course_items ci
        INNER JOIN lessons l
            ON ci.lessonId = l.lessonId

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

        WHERE ci.courseId = :courseId
          AND ci.itemType = 'LESSON'
          AND l.status <> 'HIDDEN'
          AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR l.status = :status)

        ORDER BY ci.itemOrder ASC
        """, nativeQuery = true)
    List<Object[]> searchLessonListRaw(
            @Param("courseId") Long courseId,
            @Param("keyword") String keyword,
            @Param("status") String status
    );

    @Query("""
        SELECT l
        FROM Lesson l
        JOIN FETCH l.course c
        JOIN FETCH c.teacher t
        WHERE l.lessonId = :lessonId
          AND c.courseId = :courseId
          AND l.status <> 'HIDDEN'
          AND c.status <> 'HIDDEN'
          AND t.username = :username
    """)
    Optional<Lesson> findTeacherLessonDetail(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("username") String username
    );

    @Query("""
        SELECT l
        FROM Lesson l
        JOIN FETCH l.course c
        JOIN FETCH c.teacher t
        WHERE l.lessonId = :lessonId
          AND c.courseId = :courseId
          AND l.status <> 'HIDDEN'
          AND c.status <> 'HIDDEN'
    """)
    Optional<Lesson> findTeacherLessonDetailByAdmin(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId
    );

    @Query("""
        SELECT l
        FROM Lesson l
        JOIN FETCH l.course c
        JOIN FETCH c.teacher t
        WHERE l.lessonId = :lessonId
          AND l.status <> 'HIDDEN'
          AND c.status <> 'HIDDEN'
          AND t.username = :username
    """)
    Optional<Lesson> findLessonOfTeacher(
            @Param("lessonId") Long lessonId,
            @Param("username") String username
    );

    @Query("""
        SELECT l
        FROM CourseItem ci
        JOIN ci.lesson l
        WHERE ci.course.courseId = :courseId
          AND ci.itemType = 'LESSON'
          AND l.status <> 'HIDDEN'
        ORDER BY ci.itemOrder ASC
    """)
    List<Lesson> findLessonsForStudentByCourseId(@Param("courseId") Long courseId);

    @Query("""
        SELECT COUNT(l)
        FROM Lesson l
        WHERE l.course.courseId = :courseId
          AND l.status <> 'HIDDEN'
    """)
    Long countLessonsByCourseId(@Param("courseId") Long courseId);

    @Query("""
        SELECT l
        FROM CourseItem ci
        JOIN ci.lesson l
        WHERE ci.course.courseId = :courseId
          AND ci.itemType = 'LESSON'
          AND l.status = :status
        ORDER BY ci.itemOrder ASC
    """)
    List<Lesson> findAllByCourseCourseIdAndStatusOrderByItemOrderAsc(
            @Param("courseId") Long courseId,
            @Param("status") String status
    );

    @Query("""
        SELECT l
        FROM Lesson l
        JOIN FETCH l.course c
        WHERE l.lessonId = :lessonId
          AND l.status = 'PUBLISHED'
          AND c.status = 'PUBLISHED'
    """)
    Optional<Lesson> findPublishedLessonWithCourseByLessonId(@Param("lessonId") Long lessonId);
}