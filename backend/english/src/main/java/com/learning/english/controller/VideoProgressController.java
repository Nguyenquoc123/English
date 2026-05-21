package com.learning.english.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.learning.english.dto.request.VideoProgressRequest;
import com.learning.english.dto.response.VideoProgressResponse;
import com.learning.english.service.LessonService;

@RestController
@RequestMapping("/video-progress")
public class VideoProgressController {

	@Autowired
	LessonService lessonService;

	@PostMapping
	public ResponseEntity<?> luuTienDoVideo(@RequestBody VideoProgressRequest request) {
		VideoProgressResponse result = lessonService.luuTienDoVideo(request.getVideoId(), request.getWatchedSeconds());

		return ResponseEntity.ok(result);
	}
}