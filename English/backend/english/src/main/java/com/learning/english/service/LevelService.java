package com.learning.english.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.learning.english.repository.LevelRepository;

@Service
public class LevelService {
	@Autowired
	LevelRepository levelRepository;
}
