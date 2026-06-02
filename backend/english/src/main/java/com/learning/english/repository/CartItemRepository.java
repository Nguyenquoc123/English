package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.CartItem;
import com.learning.english.entity.Course;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long>{
	
	boolean existsByUser_UserIdAndCourse_CourseId(Long userId, Long courseId);
	Optional<CartItem> findByUser_UserIdAndCourse_CourseId(Long userId, Long courseId);
	
	@Query("""
	        SELECT ci
	        FROM CartItem ci
	        JOIN ci.course c
	        JOIN c.teacher t
	        LEFT JOIN c.level l
	        WHERE ci.user.userId = :studentId
	        ORDER BY ci.cartItemId DESC
	    """)
	    List<CartItem> dsKhoaHocInGioHang(@Param("studentId") Long studentId);
	
	void deleteByCourse_CourseId(Long courseId);
}
