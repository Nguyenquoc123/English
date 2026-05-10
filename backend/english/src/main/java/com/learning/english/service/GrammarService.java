package com.learning.english.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.learning.english.dto.request.GrammarRequest;
import com.learning.english.dto.response.GrammarResponse;
import com.learning.english.entity.Grammar;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.User;
import com.learning.english.mapper.GrammarMapper;
import com.learning.english.repository.GrammarRepository;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class GrammarService {

    @Autowired
    private GrammarRepository grammarRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private GrammarMapper grammarMapper;

    @Autowired
    UserRepository userRepository;
    
    @Transactional
    public GrammarResponse themNguPhap(Long lessonId, GrammarRequest request) {
        if (lessonId == null) {
            throw new RuntimeException("lessonId không được để trống");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề ngữ pháp không được để trống");
        }

        if (request.getContentHtml() == null || request.getContentHtml().isBlank()) {
            throw new RuntimeException("Nội dung ngữ pháp không được để trống");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));

        LocalDateTime now = LocalDateTime.now();

        Grammar grammar = Grammar.builder()
                .lesson(lesson)
                .title(request.getTitle().trim())
                .contentHtml(request.getContentHtml().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Grammar savedGrammar = grammarRepository.save(grammar);

        return grammarMapper.toGrammarResponse(savedGrammar);
    }

    public List<GrammarResponse> layDanhSachNguPhapTheoLesson(Long lessonId) {
        return grammarRepository.findAllByLessonLessonIdOrderByCreatedAtAsc(lessonId)
                .stream()
                .map(grammarMapper::toGrammarResponse)
                .toList();
    }
    
    public GrammarResponse layChiTietNguPhapTheoId(Long grammarId) {
        if (grammarId == null) {
            throw new RuntimeException("grammarId không được để trống");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        Grammar grammar = grammarRepository.findGrammarOfTeacher(grammarId, username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngữ pháp hoặc bạn không có quyền xem"));

        return grammarMapper.toGrammarResponse(grammar);
    }
    
    public GrammarResponse layChiTietNguPhapTheoIdByAdmin(Long grammarId) {
    	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        if(!"admin".equals(user.getRole().getRoleName()))
        	throw new RuntimeException("Bạn không có quyền truy cập!");

        Grammar grammar = grammarRepository.findGrammarOfTeacherByAdmin(grammarId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngữ pháp hoặc bạn không có quyền xem"));

        return grammarMapper.toGrammarResponse(grammar);
    }
}