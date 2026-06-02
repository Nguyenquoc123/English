package com.learning.english.service;

import com.learning.english.dto.response.*;
import com.learning.english.entity.User;
import com.learning.english.repository.TeacherDashboardRepository;
import com.learning.english.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherDashboardService {

    private final TeacherDashboardRepository teacherDashboardRepository;
    private final UserRepository userRepository;

    
    public TeacherDashboardResponse getDashboard(String range) {
        return TeacherDashboardResponse.builder()
                .summary(getSummary(range))
                .charts(getCharts(range))
                .courses(getCourses(range))
                .build();
    }


    
    public TeacherDashboardSummaryResponse getSummary(String range) {
        Long teacherId = getCurrentTeacherId();
        DateRange dateRange = resolveDateRange(range);

        TeacherDashboardSummaryProjection data =
                teacherDashboardRepository.getTeacherDashboardSummary(
                        teacherId,
                        dateRange.start(),
                        dateRange.end()
                );

        return TeacherDashboardSummaryResponse.builder()
                .totalCourses(defaultLong(data.getTotalCourses()))
                .totalStudents(defaultLong(data.getTotalStudents()))
                .availableRevenue(defaultMoney(data.getAvailableRevenue()))
                .periodRevenue(defaultMoney(data.getPeriodRevenue()))
                .totalRevenue(defaultMoney(data.getTotalRevenue()))
                .pendingCourses(defaultLong(data.getPendingCourses()))
                .rejectedCourses(defaultLong(data.getRejectedCourses()))
                .pendingWithdrawals(defaultLong(data.getPendingWithdrawals()))
                .build();
    }

    
    public TeacherDashboardChartResponse getCharts(String range) {
        Long teacherId = getCurrentTeacherId();
        DateRange dateRange = resolveDateRange(range);

        boolean monthly = "THIS_YEAR".equalsIgnoreCase(range);

        List<TeacherChartPointProjection> revenueRaw = monthly
                ? teacherDashboardRepository.getRevenueMonthlyChart(teacherId, dateRange.start(), dateRange.end())
                : teacherDashboardRepository.getRevenueDailyChart(teacherId, dateRange.start(), dateRange.end());

        List<TeacherChartPointProjection> studentRaw = monthly
                ? teacherDashboardRepository.getStudentMonthlyChart(teacherId, dateRange.start(), dateRange.end())
                : teacherDashboardRepository.getStudentDailyChart(teacherId, dateRange.start(), dateRange.end());

        return TeacherDashboardChartResponse.builder()
                .revenueChart(monthly
                        ? fillMissingMonths(revenueRaw)
                        : fillMissingDays(revenueRaw, dateRange.start().toLocalDate(), dateRange.end().minusNanos(1).toLocalDate()))
                .studentChart(monthly
                        ? fillMissingMonths(studentRaw)
                        : fillMissingDays(studentRaw, dateRange.start().toLocalDate(), dateRange.end().minusNanos(1).toLocalDate()))
                .build();
    }

    
    public List<TeacherDashboardCourseResponse> getCourses(String range) {
        Long teacherId = getCurrentTeacherId();
        DateRange dateRange = resolveDateRange(range);

        return teacherDashboardRepository
                .findTeacherDashboardCourses(
                        teacherId,
                        dateRange.start(),
                        dateRange.end(),
                        PageRequest.of(0, 10)
                )
                .stream()
                .map(this::toCourseResponse)
                .toList();
    }

    private TeacherDashboardCourseResponse toCourseResponse(TeacherDashboardCourseProjection item) {
        return TeacherDashboardCourseResponse.builder()
                .courseId(item.getCourseId())
                .title(item.getTitle())
                .thumbnailUrl(item.getThumbnailUrl())
                .courseType(item.getCourseType())
                .price(defaultMoney(item.getPrice()))
                .status(item.getStatus())
                .totalStudents(defaultLong(item.getTotalStudents()))
                .totalRevenue(defaultMoney(item.getTotalRevenue()))
                .averageRating(item.getAverageRating() == null ? 0.0 : item.getAverageRating())
                .totalReviews(defaultLong(item.getTotalReviews()))
                .build();
    }

    private Long getCurrentTeacherId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Bạn chưa đăng nhập");
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return user.getUserId();
    }

    private DateRange resolveDateRange(String range) {
        LocalDate today = LocalDate.now();
        String normalizedRange = range == null ? "7D" : range.toUpperCase();

        LocalDate startDate;

        switch (normalizedRange) {
            case "30D" -> startDate = today.minusDays(29);
            case "THIS_MONTH" -> startDate = YearMonth.now().atDay(1);
            case "THIS_YEAR" -> startDate = Year.now().atDay(1);
            case "7D" -> startDate = today.minusDays(6);
            default -> startDate = today.minusDays(6);
        }

        LocalDateTime start = startDate.atStartOfDay();

        // dùng < endDate nên end là đầu ngày mai
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return new DateRange(start, end);
    }

    private List<TeacherDashboardChartItemResponse> fillMissingDays(
            List<TeacherChartPointProjection> rawData,
            LocalDate start,
            LocalDate end
    ) {
        Map<String, BigDecimal> valueMap = new HashMap<>();

        for (TeacherChartPointProjection item : rawData) {
            valueMap.put(item.getLabel(), defaultMoney(item.getValue()));
        }

        List<TeacherDashboardChartItemResponse> result = new ArrayList<>();

        LocalDate current = start;

        while (!current.isAfter(end)) {
            String dbKey = current.toString();
            String label = current.format(DateTimeFormatter.ofPattern("dd/MM"));

            result.add(TeacherDashboardChartItemResponse.builder()
                    .label(label)
                    .value(valueMap.getOrDefault(dbKey, BigDecimal.ZERO))
                    .build());

            current = current.plusDays(1);
        }

        return result;
    }

    private List<TeacherDashboardChartItemResponse> fillMissingMonths(
            List<TeacherChartPointProjection> rawData
    ) {
        Map<String, BigDecimal> valueMap = new HashMap<>();

        for (TeacherChartPointProjection item : rawData) {
            valueMap.put(item.getLabel(), defaultMoney(item.getValue()));
        }

        List<TeacherDashboardChartItemResponse> result = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            String label = "Tháng " + month;

            result.add(TeacherDashboardChartItemResponse.builder()
                    .label(label)
                    .value(valueMap.getOrDefault(label, BigDecimal.ZERO))
                    .build());
        }

        return result;
    }

    private Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record DateRange(
            LocalDateTime start,
            LocalDateTime end
    ) {
    }
}