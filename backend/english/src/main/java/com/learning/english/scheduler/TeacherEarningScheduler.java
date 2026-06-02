package com.learning.english.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.learning.english.service.TeacherEarningsService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TeacherEarningScheduler {

    private final TeacherEarningsService teacherEarningService;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Ho_Chi_Minh")
    public void tuDongMoTienChoGiaoVien() {
    	System.out.println("update status teacher earning");
        teacherEarningService.capNhatTeacherEarningDenHan();
    }
}