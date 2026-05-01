package com.learning.english.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.english.entity.Level;

@Repository
public interface LevelRepository extends JpaRepository<Level, Long>{
	Optional<Level> findByLevelName(String levelName);
}
