package com.learning.english.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transaction_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transactionitemid")
    private Long transactionItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transactionid", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseid", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherid", nullable = false)
    private User teacher;

    @Column(name = "itemtype", nullable = false, length = 50)
    private String itemType;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;
}