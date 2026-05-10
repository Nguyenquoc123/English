package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.VideoRequest;
import com.learning.english.dto.response.VideoResponse;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.User;
import com.learning.english.entity.Video;
import com.learning.english.mapper.VideoMapper;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.UserRepository;
import com.learning.english.repository.VideoRepository;

import jakarta.transaction.Transactional;

@Service
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private VideoMapper videoMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    UserRepository userRepository;
    
    @Transactional
    public VideoResponse themVideoChoLesson(
            Long lessonId,
            VideoRequest request,
            MultipartFile videoFile,
            MultipartFile thumbnailFile
    ) throws IOException {

        if (lessonId == null) {
            throw new RuntimeException("lessonId không được để trống");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề video không được để trống");
        }

        if (videoFile == null || videoFile.isEmpty()) {
            throw new RuntimeException("File video không được để trống");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));

        String videoUrl = fileService.saveFile(videoFile, "videos");

        String thumbnailUrl = null;

        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailUrl = fileService.saveFile(thumbnailFile, "images");
        }

        Integer nextDisplayOrder = getNextDisplayOrder(lessonId);

        LocalDateTime now = LocalDateTime.now();

        Video video = Video.builder()
                .lesson(lesson)
                .title(request.getTitle().trim())
                .videoUrl(videoUrl)
                .durationSeconds(request.getDurationSeconds())
                .thumbnailUrl(thumbnailUrl)
                .displayOrder(nextDisplayOrder)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Video savedVideo = videoRepository.save(video);

        return videoMapper.toVideoResponse(savedVideo);
    }

    public List<VideoResponse> layDanhSachVideoTheoLesson(Long lessonId) {
        return videoRepository.findAllByLessonLessonIdOrderByDisplayOrderAsc(lessonId)
                .stream()
                .map(videoMapper::toVideoResponse)
                .toList();
    }

    private Integer getNextDisplayOrder(Long lessonId) {
        Integer maxDisplayOrder = videoRepository.findMaxDisplayOrderByLessonId(lessonId);

        if (maxDisplayOrder == null) {
            return 1;
        }

        return maxDisplayOrder + 1;
    }
    
    public VideoResponse layChiTietVideoCuaTeacher(Long videoId) {

        if (videoId == null) {
            throw new RuntimeException("videoId không được để trống");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();

        Video video = videoRepository.findVideoOfTeacher(videoId, username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy video hoặc bạn không có quyền xem"));

        return videoMapper.toVideoResponse(video);
    }
    
    public VideoResponse layChiTietVideoCuaTeacherByAdmin(Long videoId) {
    	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        if(!"admin".equals(user.getRole().getRoleName()))
        	throw new RuntimeException("Bạn không có quyền truy cập!");

        if (videoId == null) {
            throw new RuntimeException("videoId không được để trống");
        }

        
        Video video = videoRepository.findVideoOfTeacherByAdmin(videoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy video hoặc bạn không có quyền xem"));

        return videoMapper.toVideoResponse(video);
    }
}