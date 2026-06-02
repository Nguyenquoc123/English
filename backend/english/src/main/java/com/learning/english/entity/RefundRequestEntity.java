package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refundrequestid")
    private Long refundRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transactionitemid", nullable = false)
    private TransactionItem transactionItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseid")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentid", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentbankaccountid")
    private StudentBankAccount studentBankAccount;

    @Column(name = "reason", nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String reason;

    @Column(name = "reason_code", length = 50)
    private String reasonCode;

    @Column(name = "detail_description", columnDefinition = "NVARCHAR(2000)")
    private String detailDescription;

    @Column(name = "internal_note", columnDefinition = "NVARCHAR(2000)")
    private String internalNote;

    @Column(name = "purchase_at")
    private LocalDateTime purchaseAt;

    @Column(name = "progress_percent", precision = 5, scale = 2)
    private BigDecimal progressPercent;

    @Column(name = "completed_lessons")
    private Integer completedLessons;

    @Column(name = "total_lessons")
    private Integer totalLessons;

    @Column(name = "refund_deadline_at")
    private LocalDateTime refundDeadlineAt;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "reviewnote", columnDefinition = "NVARCHAR(1000)")
    private String reviewNote;

    @Column(name = "reject_reason", columnDefinition = "NVARCHAR(1000)")
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewedby")
    private User reviewedBy;

    @Column(name = "reviewedat")
    private LocalDateTime reviewedAt;

    @Column(name = "paidat")
    private LocalDateTime paidAt;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "refundreason", columnDefinition = "NVARCHAR(1000)")
    private String refundReason;

    @Column(name = "refundrequestat")
    private LocalDateTime refundRequestedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refundreviewedby")
    private User refundReviewedBy;

    @Column(name = "refundreviewedat")
    private LocalDateTime refundReviewedAt;

    @Column(name = "refundrejectreason", columnDefinition = "NVARCHAR(1000)")
    private String refundRejectReason;
}
