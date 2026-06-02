package com.learning.english.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.CourseCertificate;

@Repository
public interface CourseCertificateRepository extends JpaRepository<CourseCertificate, Long> {

    Optional<CourseCertificate> findByUserUserIdAndCourseCourseId(Long userId, Long courseId);

    boolean existsByUserUserIdAndCourseCourseId(Long userId, Long courseId);

    boolean existsByCertificateCode(String certificateCode);

    Optional<CourseCertificate> findByCertificateCode(String certificateCode);
}
