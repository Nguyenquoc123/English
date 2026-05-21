package com.learning.english.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "video_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long videoprogressid;

	@ManyToOne
	@JoinColumn(name = "userid")
	private User user;

	@ManyToOne
	@JoinColumn(name = "videoid")
	private Video video;

	private Integer watchedseconds;

	private Boolean iscompleted;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
}