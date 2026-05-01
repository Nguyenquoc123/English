package com.learning.english.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionManyRequest {

    private List<QuestionRequest> questions;
}