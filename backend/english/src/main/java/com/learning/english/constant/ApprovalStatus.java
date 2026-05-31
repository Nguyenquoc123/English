package com.learning.english.constant;

public final class ApprovalStatus {

    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";

    private ApprovalStatus() {
    }

    public static boolean isPending(String status) {
        return status != null && PENDING.equalsIgnoreCase(status);
    }

    public static boolean isApproved(String status) {
        return status != null && APPROVED.equalsIgnoreCase(status);
    }

    public static boolean isRejected(String status) {
        return status != null && REJECTED.equalsIgnoreCase(status);
    }
}
