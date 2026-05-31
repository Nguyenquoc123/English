package com.learning.english.constant;

import java.math.BigDecimal;

public final class RefundPolicyConstants {
    public static final long REFUND_WINDOW_SECONDS = 168L * 3600L;
    public static final BigDecimal MAX_PROGRESS_PERCENT = new BigDecimal("20.00");
    public static final int DETAIL_MIN_LENGTH_OTHER = 10;

    private RefundPolicyConstants() {
    }
}
