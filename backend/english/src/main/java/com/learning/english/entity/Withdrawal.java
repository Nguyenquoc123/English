package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "withdrawals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Withdrawal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "withdrawalid")
    private Long withdrawalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherid", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bankaccountid", nullable = false)
    private TeacherBankAccount bankAccount;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "proofimageurl", length = 500)
    private String proofImageUrl;

    @Column(name = "requestedat", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewedat")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewedby")
    private User reviewedBy;

    @Column(name = "rejectreason", columnDefinition = "NVARCHAR(1000)")
    private String rejectReason;

    @Column(name = "paidat")
    private LocalDateTime paidAt;
    
    @Column(name = "qrPay", nullable = true)
    private String qrPay;
    
    @Column(name = "paymentcode", nullable = true)
    private String paymentcode;
    
    
    @OneToMany(mappedBy = "withdrawal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WithdrawalEarning> withdrawalEarnings = new ArrayList<>();
    
}