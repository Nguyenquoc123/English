package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "levelid")
    private Long levelId;

    @Column(name = "levelname", nullable = false, unique = true, columnDefinition = "NVARCHAR(100)")
    private String levelName;
}