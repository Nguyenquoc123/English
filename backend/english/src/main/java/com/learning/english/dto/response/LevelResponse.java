package com.learning.english.dto.response;


import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelResponse {
	private Long levelId;
	private String levelName;
}
