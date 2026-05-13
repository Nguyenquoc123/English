package com.learning.english.mapper;

import org.mapstruct.Mapper;

import com.learning.english.dto.response.LevelResponse;
import com.learning.english.entity.Level;

@Mapper(componentModel = "spring")
public interface LevelMapper {
	LevelResponse toLevelResponse(Level level);
}
