package com.learning.english.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_practice_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPracticeConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "configid")
	private Long configId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lessonid", nullable = false)
	private Lesson lesson;

	@Column(name = "practicetype", nullable = false, length = 50)
	private String practiceType;

	@Column(name = "isenabled", nullable = false)
	private Boolean isEnabled;

	@Column(name = "createdat", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updatedat", nullable = false)
	private LocalDateTime updatedAt;
}