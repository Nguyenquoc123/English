package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_bank_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bankaccountid")
    private Long bankAccountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherid", nullable = false)
    private User teacher;

    @Column(name = "bankname", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String bankName;

    @Column(name = "accountnumber", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "accountname", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String accountName;

    @Column(name = "isdefault", nullable = false)
    private Boolean isDefault;

    @Column(name = "createdat", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat", nullable = false)
    private LocalDateTime updatedAt;
}