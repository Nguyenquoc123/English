package com.learning.english.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.ReorderCourseItemsRequest;
import com.learning.english.dto.request.ReorderCourseItemsRequest.CourseItemOrderEntry;
import com.learning.english.entity.User;
import com.learning.english.repository.CourseItemRepository;
import com.learning.english.repository.CourseRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class CourseItemService {

    @Autowired
    private CourseItemRepository courseItemRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void capNhatThuTuNoiDungKhoaHoc(Long courseId, ReorderCourseItemsRequest request) {
        User teacher = getCurrentUser();

        boolean ownsCourse = courseRepository.existsByCourseIdAndTeacherUserId(
                courseId,
                teacher.getUserId()
        );
        if (!ownsCourse) {
            throw new RuntimeException("Bạn không sở hữu khóa học này");
        }

        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách thứ tự không được để trống");
        }

        Set<Long> seenIds = new HashSet<>();
        for (CourseItemOrderEntry entry : request.getItems()) {
            if (entry.getCourseItemId() == null || entry.getItemOrder() == null) {
                throw new RuntimeException("courseItemId và itemOrder không được để trống");
            }
            if (!seenIds.add(entry.getCourseItemId())) {
                throw new RuntimeException("courseItemId bị trùng trong danh sách");
            }
            if (!courseItemRepository.existsByCourseItemIdAndCourse_CourseId(
                    entry.getCourseItemId(),
                    courseId
            )) {
                throw new RuntimeException("Nội dung khóa học không hợp lệ: " + entry.getCourseItemId());
            }
        }

        courseItemRepository.moveOrdersToTemporaryLargeNumber(courseId);

        for (CourseItemOrderEntry entry : request.getItems()) {
            int updated = courseItemRepository.updateItemOrder(
                    courseId,
                    entry.getCourseItemId(),
                    entry.getItemOrder()
            );
            if (updated == 0) {
                throw new RuntimeException("Không thể cập nhật thứ tự cho courseItemId: " + entry.getCourseItemId());
            }
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }
}
