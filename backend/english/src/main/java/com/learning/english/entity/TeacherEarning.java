package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_earnings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherEarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "earningid")
    private Long earningId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherid", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseid", nullable = false)
    private Course course;

    @Column(name = "sourcetype", nullable = false, length = 50)
    private String sourceType;

    @Column(name = "sourceid", nullable = false)
    private Long sourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transactionid", nullable = false)
    private Transaction transaction;

    @Column(name = "grossamount", nullable = false, precision = 18, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "platformfee", nullable = false, precision = 18, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "netamount", nullable = false, precision = 18, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}