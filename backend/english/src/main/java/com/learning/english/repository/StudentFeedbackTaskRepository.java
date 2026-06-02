package com.learning.english.repository;

import com.learning.english.entity.StudentFeedbackTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentFeedbackTaskRepository extends JpaRepository<StudentFeedbackTask, Long> {

    long countByStatus(String status);

    List<StudentFeedbackTask> findAllByOrderByCreatedAtDesc();

    List<StudentFeedbackTask> findByStatusOrderByCreatedAtDesc(String status);
}
