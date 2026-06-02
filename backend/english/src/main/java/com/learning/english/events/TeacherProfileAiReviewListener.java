package com.learning.english.events;




import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import com.learning.english.service.TeacherAiReviewService;

import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class TeacherProfileAiReviewListener {

    private final TeacherAiReviewService teacherAiReviewService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeacherProfileAiReview(TeacherProfileAiReviewEvent event) {
        teacherAiReviewService.reviewTeacherProfileByAi(event.teacherProfileId());
    }
}