package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_earnings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalEarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "withdrawalid", nullable = false)
    private Withdrawal withdrawal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherearningid", nullable = false)
    private TeacherEarning teacherEarning;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}