package com.learning.english.repository;

import com.learning.english.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

	@Query("""
			SELECT e FROM Enrollment e
			JOIN FETCH e.course c
			LEFT JOIN FETCH c.level
			LEFT JOIN FETCH c.teacher
			WHERE e.user.userId = :userId AND e.hasCourseAccess = true
			ORDER BY e.createdAt DESC
			""")
	List<Enrollment> findPurchasedByUserId(@Param("userId") Long userId);

	boolean existsByUserUserIdAndCourseCourseIdAndHasCourseAccessTrue(Long userId, Long courseId);

	

	Optional<Enrollment> findByUserUserIdAndCourseCourseId(Long userId, Long courseId);

	List<Enrollment> findByCourseTransactionItem_Transaction_TransactionId(Long transactionId);

	Long countByCourseCourseIdAndHasCourseAccessTrue(Long courseId);

	@Query("""
            SELECT COUNT(e)
            FROM Enrollment e
            WHERE e.course.teacher.userId = :teacherId
              AND e.hasCourseAccess = true
            """)
    long countStudentsByTeacherId(@Param("teacherId") Long teacherId);

	

}