package com.learning.english.mapper;

import com.learning.english.dto.response.AttemptResponse;
import com.learning.english.dto.response.CartItemResponse;
import com.learning.english.entity.Attempt;
import com.learning.english.entity.CartItem;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
	@Mapping(source = "user.fullName", target = "teacherName")
	@Mapping(source = "course.level.levelName", target = "levelName")
	@Mapping(source = "course.thumbnailUrl", target = "thumbnailUrl")
	@Mapping(source = "course.courseId", target = "courseId")
	@Mapping(source = "course.title", target = "title")
	@Mapping(source = "course.shortDescription", target = "shortDescription")
	@Mapping(source = "course.price", target = "price")
	public CartItemResponse toCartItemResponse(CartItem cartItem);
}
