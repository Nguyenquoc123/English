package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "course_items")
public class CourseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courseitemid")
    private Long courseItemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "courseid", nullable = false)
    private Course course;

    @Column(name = "itemtype", nullable = false, length = 50)
    private String itemType;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonid", unique = true)
    private Lesson lesson;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examid", unique = true)
    private Exam exam;

    @Column(name = "itemorder", nullable = false)
    private Integer itemOrder;
}
