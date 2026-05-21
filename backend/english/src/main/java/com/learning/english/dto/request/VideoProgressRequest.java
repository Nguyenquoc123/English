package com.learning.english.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoProgressRequest {

    private Long videoId;

    private Integer watchedSeconds;
}