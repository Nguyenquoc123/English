package com.learning.english.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SePayWebhookResponse {

    private boolean success;

    private String message;
}