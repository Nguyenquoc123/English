package com.learning.english.constant;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum RefundReasonCode {
    CONTENT_MISMATCH("CONTENT_MISMATCH", "Nội dung khóa học không đúng như mô tả"),
    POOR_VIDEO_AUDIO("POOR_VIDEO_AUDIO", "Chất lượng video/âm thanh kém"),
    HARD_TO_UNDERSTAND("HARD_TO_UNDERSTAND", "Giảng viên giảng khó hiểu"),
    TOO_SHALLOW("TOO_SHALLOW", "Nội dung khóa học quá sơ sài"),
    MISSING_OR_BROKEN("MISSING_OR_BROKEN", "Khóa học bị lỗi hoặc thiếu bài học"),
    NOT_SUITABLE("NOT_SUITABLE", "Không phù hợp với nhu cầu học tập"),
    TECHNICAL_ISSUE("TECHNICAL_ISSUE", "Vấn đề kỹ thuật khi học"),
    OTHER("OTHER", "Lý do khác");

    private final String code;
    private final String label;

    RefundReasonCode(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public static Optional<RefundReasonCode> fromCode(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }
        return Arrays.stream(values())
                .filter(item -> item.code.equalsIgnoreCase(code.trim()))
                .findFirst();
    }
}
