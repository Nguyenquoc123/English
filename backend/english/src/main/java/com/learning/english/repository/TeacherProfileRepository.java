package com.learning.english.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.TeacherProfile;
import com.learning.english.entity.User;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {

    Optional<TeacherProfile> findByUser(User user);

    boolean existsByUser(User user);

    long countByApprovalStatus(String approvalStatus);

    List<TeacherProfile> findByApprovalStatusOrderByCreatedAtDesc(String approvalStatus);

    List<TeacherProfile> findAllByOrderByCreatedAtDesc();
}