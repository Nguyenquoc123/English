package com.learning.english.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.VideoRequest;
import com.learning.english.dto.response.VideoResponse;
import com.learning.english.service.VideoService;

@RestController
@RequestMapping("/video")
public class VideoController {

	@Autowired
	private VideoService videoService;

	@PostMapping("/{lessonId}/lessons")
	public VideoResponse themVideoChoLesson(@PathVariable Long lessonId, @RequestPart("data") VideoRequest request,
			@RequestPart("videoFile") MultipartFile videoFile,
			@RequestPart(value = "thumbnailFile", required = false) MultipartFile thumbnailFile) throws IOException {
		System.out.println("Đã chạy qua=======================================================");
		return videoService.themVideoChoLesson(lessonId, request, videoFile, thumbnailFile);
	}

	@GetMapping("/{lessonId}/lessons")
	public List<VideoResponse> layDanhSachVideoTheoLesson(@PathVariable Long lessonId) {
		return videoService.layDanhSachVideoTheoLesson(lessonId);
	}

	@GetMapping("/{videoId}")
	public VideoResponse layChiTietVideo(@PathVariable Long videoId) {
		return videoService.layChiTietVideoCuaTeacher(videoId);
	}
	
	@GetMapping("/{videoId}/admin")
	public VideoResponse layChiTietVideoByAdmin(@PathVariable Long videoId) {
		return videoService.layChiTietVideoCuaTeacherByAdmin(videoId);
	}
}