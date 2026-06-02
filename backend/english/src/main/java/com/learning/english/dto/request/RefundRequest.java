package com.learning.english.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    private String reasonCode;
    private String detailDescription;
    /** @deprecated dùng reasonCode + detailDescription */
    private String reason;
}
