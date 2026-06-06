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
    
    @Column(name = "namebank", nullable = true)
    private String nameBank;
    
    
    @Column(name = "accountbank", nullable = true)
    private String accountBank;

    @Column(name = "reason", nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String reason;

    @Column(name = "reasoncode", length = 50)
    private String reasonCode;

    @Column(name = "detaildescription", columnDefinition = "NVARCHAR(2000)")
    private String detailDescription;

    @Column(name = "purchaseat")
    private LocalDateTime purchaseAt;

    @Column(name = "progresspercent", precision = 5, scale = 2)
    private BigDecimal progressPercent;
    
    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "completedlessons")
    private Integer completedLessons;

    @Column(name = "totallessons")
    private Integer totalLessons;

    @Column(name = "refunddeadlineat")
    private LocalDateTime refundDeadlineAt;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "rejectreason", columnDefinition = "NVARCHAR(1000)")
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
    
 
}
