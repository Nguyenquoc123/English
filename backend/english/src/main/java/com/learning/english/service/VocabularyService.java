package com.learning.english.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.english.dto.request.VocabularyManyRequest;
import com.learning.english.dto.request.VocabularyRequest;
import com.learning.english.dto.response.VocabularyResponse;
import com.learning.english.entity.Lesson;
import com.learning.english.entity.Vocabulary;
import com.learning.english.mapper.VocabularyMapper;
import com.learning.english.repository.LessonRepository;
import com.learning.english.repository.VocabularyRepository;

import jakarta.transaction.Transactional;
@Service
public class VocabularyService {
	@Autowired
	VocabularyRepository vocabularyRepository;
	
	@Autowired
	VocabularyMapper vocabularyMapper;
	
	@Autowired
	FileService fileService;
	
	@Autowired
	LessonRepository lessonRepository;
	
	@Transactional
	public VocabularyResponse themMotTuVungCoFile(
	        Long lessonId,
	        VocabularyRequest request,
	        MultipartFile audioFile,
	        MultipartFile imageFile
	) throws IOException {

	    if (lessonId == null) {
	        throw new RuntimeException("lessonId không được để trống");
	    }

	    request.setLessonId(lessonId);

	    if (request.getWord() == null || request.getWord().isBlank()) {
	        throw new RuntimeException("Từ vựng không được để trống");
	    }

	    if (request.getMeaning() == null || request.getMeaning().isBlank()) {
	        throw new RuntimeException("Nghĩa của từ không được để trống");
	    }

	    if (audioFile != null && !audioFile.isEmpty()) {
	        String audioUrl = fileService.saveFile(audioFile, "audios");
	        request.setAudioUrl(audioUrl);
	    }

	    if (imageFile != null && !imageFile.isEmpty()) {
	        String imageUrl = fileService.saveFile(imageFile, "images");
	        request.setImageUrl(imageUrl);
	    }

	    if (request.getDisplayOrder() == null) {
	        Integer nextDisplayOrder = getNextDisplayOrder(lessonId);
	        request.setDisplayOrder(nextDisplayOrder);
	    }

	    Vocabulary vocabulary = buildVocabulary(request);

	    Vocabulary savedVocabulary = vocabularyRepository.save(vocabulary);

	    return vocabularyMapper.toVocabularyResponse(savedVocabulary);
	}
	
	private Integer getNextDisplayOrder(Long lessonId) {
	    Integer maxDisplayOrder = vocabularyRepository.findMaxDisplayOrderByLessonId(lessonId);

	    if (maxDisplayOrder == null) {
	        return 1;
	    }

	    return maxDisplayOrder + 1;
	}
	
	@Transactional
    public List<VocabularyResponse> themNhieuTuVungCoFile(
            VocabularyManyRequest request,
            List<MultipartFile> audioFiles,
            List<MultipartFile> imageFiles
    ) throws IOException {
        if (request.getVocabularies() == null || request.getVocabularies().isEmpty()) {
            throw new RuntimeException("Danh sách từ vựng không được rỗng");
        }

        List<Vocabulary> vocabularies = new ArrayList<>();

        for (VocabularyRequest item : request.getVocabularies()) {

            if (item.getAudioFileIndex() != null) {
                if (audioFiles == null
                        || item.getAudioFileIndex() < 0
                        || item.getAudioFileIndex() >= audioFiles.size()) {
                    throw new RuntimeException("audioFileIndex không hợp lệ: " + item.getAudioFileIndex());
                }

                MultipartFile audioFile = audioFiles.get(item.getAudioFileIndex());

                if (audioFile != null && !audioFile.isEmpty()) {
                    String audioUrl = fileService.saveFile(audioFile, "audios");
                    item.setAudioUrl(audioUrl);
                }
            }

            if (item.getImageFileIndex() != null) {
                if (imageFiles == null
                        || item.getImageFileIndex() < 0
                        || item.getImageFileIndex() >= imageFiles.size()) {
                    throw new RuntimeException("imageFileIndex không hợp lệ: " + item.getImageFileIndex());
                }

                MultipartFile imageFile = imageFiles.get(item.getImageFileIndex());

                if (imageFile != null && !imageFile.isEmpty()) {
                    String imageUrl = fileService.saveFile(imageFile, "images");
                    item.setImageUrl(imageUrl);
                }
            }

            Vocabulary vocabulary = buildVocabulary(item);
            vocabularies.add(vocabulary);
        }

        List<Vocabulary> savedVocabularies = vocabularyRepository.saveAll(vocabularies);

        return savedVocabularies.stream()
                .map(vocabularyMapper::toVocabularyResponse)
                .toList();
    }

    public List<VocabularyResponse> layDanhSachTuVungTheoLesson(Long lessonId) {
        return vocabularyRepository.findAllByLessonLessonIdOrderByDisplayOrderAsc(lessonId)
                .stream()
                .map(vocabularyMapper::toVocabularyResponse)
                .toList();
    }

    private Vocabulary buildVocabulary(VocabularyRequest request) {
        if (request.getLessonId() == null) {
            throw new RuntimeException("lessonId không được để trống");
        }

        if (request.getWord() == null || request.getWord().isBlank()) {
            throw new RuntimeException("Từ vựng không được để trống");
        }

        if (request.getMeaning() == null || request.getMeaning().isBlank()) {
            throw new RuntimeException("Nghĩa của từ không được để trống");
        }

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lesson"));

        LocalDateTime now = LocalDateTime.now();

        return Vocabulary.builder()
                .lesson(lesson)
                .word(request.getWord())
                .pronunciation(request.getPronunciation())
                .meaning(request.getMeaning())
                .exampleSentence(request.getExampleSentence())
                .audioUrl(request.getAudioUrl())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder())
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}
