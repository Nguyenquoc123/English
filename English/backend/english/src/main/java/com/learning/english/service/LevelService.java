package com.learning.english.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.learning.english.dto.response.LevelResponse;
import com.learning.english.mapper.LevelMapper;
import com.learning.english.repository.LevelRepository;

@Service
public class LevelService {
	@Autowired
	LevelRepository levelRepository;
	
	@Autowired
	LevelMapper levelMapper;
	
	public List<LevelResponse> getAllLevel(){
		return levelRepository.findAll().stream().map(levelMapper::toLevelResponse).toList();
	}
}
