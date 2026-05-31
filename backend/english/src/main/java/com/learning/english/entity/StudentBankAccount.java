package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_bank_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "studentbankaccountid")
    private Long studentBankAccountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentid", nullable = false)
    private User student;

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
