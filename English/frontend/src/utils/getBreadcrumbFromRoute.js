import {
  studentHome,
  studentCourses,
  studentCourseDetail,
  studentLesson,
  studentProfile,
  studentMyCourses,
  studentExams,
  teacherCourses,
  teacherCourseDetail,
  teacherLessons,
  teacherLessonDetail,
  teacherLessonVideos,
  teacherLessonGrammars,
  teacherLessonPractice,
  teacherExams,
  teacherExamDetail,
  adminCourses,
  adminCourseReview,
  adminLessons,
  adminLessonReview,
  adminLessonVideos,
  adminLessonGrammars,
  adminLessonPractice,
} from "./breadcrumbPaths";

const AUTH_PATHS = ["/dang-nhap", "/dang-ky", "/xac-minh", "/quen-mat-khau"];

const PRACTICE_LABELS = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  FILL_BLANK: "Điền từ",
  MATCHING: "Nối cặp",
  FLASHCARD: "Flashcard",
};

function labelForPractice(type) {
  if (!type) return "Ôn tập";
  return PRACTICE_LABELS[type] || type;
}

/** @param {string} pathname @param {Record<string, string>} params */
export function getBreadcrumbFromRoute(pathname, params = {}) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (AUTH_PATHS.includes(path)) return [];

  const c = params.courseId;
  const l = params.lessonId;
  const e = params.examId;

  if (path === "/") return [{ label: "Trang chủ" }];
  if (path === "/danh-sach-khoa-hoc")
    return [studentHome, { label: "Khóa học" }];

  if (path.match(/^\/khoa-hoc\/[^/]+\/lessons\/[^/]+\/practice-result\/[^/]+$/))
    return [
      studentHome,
      studentCourses,
      studentCourseDetail(c),
      studentLesson(c, l),
      { label: "Kết quả ôn tập" },
    ];
  if (path.match(/^\/khoa-hoc\/[^/]+\/lessons\/[^/]+\/practice\/[^/]+$/))
    return [
      studentHome,
      studentCourses,
      studentCourseDetail(c),
      studentLesson(c, l),
      { label: labelForPractice(params.practiceType) },
    ];
  if (path.match(/^\/khoa-hoc\/[^/]+\/lessons\/[^/]+$/))
    return [
      studentHome,
      studentCourses,
      studentCourseDetail(c),
      { label: "Bài học" },
    ];
  if (path.match(/^\/courses\/[^/]+\/purchase$/))
    return [
      studentHome,
      studentCourses,
      studentCourseDetail(c),
      { label: "Thanh toán" },
    ];
  if (path.match(/^\/khoa-hoc\/[^/]+$/))
    return [studentHome, studentCourses, { label: "Chi tiết khóa học" }];

  if (path.match(/^\/exams\/[^/]+\/?$/))
    return [studentHome, studentExams, { label: "Làm bài thi" }];
  if (path === "/exams") return [studentHome, { label: "Kỳ thi" }];

  if (path === "/student/profile/update")
    return [studentHome, studentProfile, { label: "Cập nhật hồ sơ" }];
  if (path === "/student/profile")
    return [studentHome, { label: "Hồ sơ cá nhân" }];
  if (path === "/student/change-password")
    return [studentHome, studentProfile, { label: "Đổi mật khẩu" }];
  if (path === "/student/khoa-hoc-da-mua")
    return [studentHome, studentProfile, { label: "Khóa học đã mua" }];
  if (path === "/student/teacher-register/result")
    return [studentHome, studentProfile, { label: "Kết quả đăng ký" }];
  if (path === "/student/teacher-register")
    return [studentHome, studentProfile, { label: "Đăng ký giáo viên" }];

  if (path.startsWith("/teacher")) {
    return getTeacherBreadcrumb(path, params);
  }
  if (path.startsWith("/admin")) {
    return getAdminBreadcrumb(path, params);
  }

  if (path === "*") return [studentHome, { label: "Không tìm thấy trang" }];
  return [studentHome, { label: "Trang hiện tại" }];
}

function getTeacherBreadcrumb(path, params) {
  const c = params.courseId;
  const l = params.lessonId;
  const e = params.examId;

  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/vocabularies\/create$/))
    return teacherLessonTrail(c, l, "Thêm từ vựng");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/grammar\/create$/))
    return teacherLessonTrail(c, l, "Thêm ngữ pháp");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/videos\/create$/))
    return teacherLessonTrail(c, l, "Đăng video");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/questions\/create$/))
    return teacherLessonTrail(c, l, "Thêm câu hỏi");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/videos\/[^/]+$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      teacherLessonDetail(c, l),
      teacherLessonVideos(c, l),
      { label: "Chi tiết video" },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/videos$/))
    return teacherLessonTrail(c, l, "Quản lý video");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/vocabularies$/))
    return teacherLessonTrail(c, l, "Quản lý từ vựng");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/grammars\/[^/]+$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      teacherLessonDetail(c, l),
      teacherLessonGrammars(c, l),
      { label: "Chi tiết ngữ pháp" },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/grammars$/))
    return teacherLessonTrail(c, l, "Quản lý ngữ pháp");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/practice\/[^/]+$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      teacherLessonDetail(c, l),
      teacherLessonPractice(c, l),
      { label: `Câu hỏi: ${labelForPractice(params.practiceType)}` },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+\/practice$/))
    return teacherLessonTrail(c, l, "Quản lý ôn tập");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/[^/]+$/))
    return teacherLessonListTrail(c, "Chi tiết bài học");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons\/create$/))
    return teacherLessonListTrail(c, "Thêm bài học");
  if (path.match(/^\/teacher\/courses\/[^/]+\/lessons$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      { label: "Danh sách bài học" },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+\/edit$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      { label: "Cập nhật khóa học" },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+\/exams$/))
    return [
      teacherCourses,
      teacherCourseDetail(c),
      { label: "Kỳ thi khóa học" },
    ];
  if (path.match(/^\/teacher\/courses\/[^/]+$/))
    return [teacherCourses, { label: "Chi tiết khóa học" }];
  if (path === "/teacher/courses/create")
    return [teacherCourses, { label: "Tạo khóa học" }];
  if (path === "/teacher/courses") return [teacherCourses, { label: "Danh sách" }];

  if (path === "/teacher/exams/create")
    return [teacherExams, { label: "Tạo kỳ thi" }];
  if (path.match(/^\/teacher\/exams\/[^/]+\/questions\/create$/))
    return [teacherExams, teacherExamDetail(e), { label: "Thêm câu hỏi" }];
  if (path.match(/^\/teacher\/exams\/[^/]+$/))
    return [teacherExams, { label: "Chi tiết kỳ thi" }];
  if (path === "/teacher/exams") return [teacherExams, { label: "Danh sách" }];

  const teacherPages = {
    "/teacher/revenue": "Doanh thu",
    "/teacher/profile": "Hồ sơ",
    "/teacher/bank": "Tài khoản ngân hàng",
    "/teacher/lessons": "Quản lý lesson",
    "/teacher/videos": "Upload video",
    "/teacher/vocabularies": "Từ vựng",
    "/teacher/grammar": "Ngữ pháp",
    "/teacher/practice-questions": "Câu hỏi ôn tập",
    "/teacher/exam-results": "Kết quả thi",
    "/teacher/withdrawals/create": "Tạo yêu cầu rút tiền",
    "/teacher/withdrawals": "Lịch sử rút tiền",
  };
  if (teacherPages[path])
    return [
      { label: "Giáo viên", to: "/teacher/courses" },
      { label: teacherPages[path] },
    ];
  if (path === "/teacher" || path.startsWith("/teacher"))
    return [
      { label: "Giáo viên", to: "/teacher/courses" },
      { label: "Trang hiện tại" },
    ];
  return [];
}

function getAdminBreadcrumb(path, params) {
  const c = params.courseId;
  const l = params.lessonId;
  const adminHome = { label: "Admin", to: "/admin/dashboard" };

  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/videos\/[^/]+$/))
    return [
      adminCourses,
      adminCourseReview(c),
      adminLessonReview(c, l),
      adminLessonVideos(c, l),
      { label: "Chi tiết video" },
    ];
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/videos$/))
    return adminLessonTrail(c, l, "Quản lý video");
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/grammars\/[^/]+$/))
    return [
      adminCourses,
      adminCourseReview(c),
      adminLessonReview(c, l),
      adminLessonGrammars(c, l),
      { label: "Chi tiết ngữ pháp" },
    ];
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/grammars$/))
    return adminLessonTrail(c, l, "Quản lý ngữ pháp");
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/practice\/[^/]+$/))
    return [
      adminCourses,
      adminCourseReview(c),
      adminLessonReview(c, l),
      adminLessonPractice(c, l),
      { label: `Câu hỏi: ${labelForPractice(params.practiceType)}` },
    ];
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/practice$/))
    return adminLessonTrail(c, l, "Quản lý ôn tập");
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons\/[^/]+\/review$/))
    return adminLessonListTrail(c, "Duyệt bài học");
  if (path.match(/^\/admin\/courses\/[^/]+\/lessons$/))
    return [
      adminCourses,
      adminCourseReview(c),
      { label: "Danh sách bài học" },
    ];
  if (path.match(/^\/admin\/courses\/[^/]+\/review$/))
    return [adminCourses, { label: "Review khóa học" }];
  if (path === "/admin/courses") return [adminCourses, { label: "Danh sách" }];

  const adminPages = {
    "/admin": "Tổng quan",
    "/admin/dashboard": "Tổng quan",
    "/admin/users": "Người dùng",
    "/admin/teachers": "Duyệt giáo viên",
    "/admin/course-approval": "Duyệt khóa học",
    "/admin/withdrawals": "Rút tiền",
    "/admin/lessons-free": "Lesson miễn phí",
    "/admin/exams": "Duyệt kỳ thi",
    "/admin/notifications": "Thông báo",
    "/admin/transactions": "Giao dịch",
    "/admin/reviews": "Đánh giá",
    "/admin/change-password": "Đổi mật khẩu",
    "/admin/profile": "Hồ sơ",
    "/admin/statistics": "Thống kê",
  };
  if (adminPages[path]) return [adminHome, { label: adminPages[path] }];
  return [adminHome, { label: "Trang hiện tại" }];
}

function teacherLessonTrail(courseId, lessonId, currentLabel) {
  return [
    teacherCourses,
    teacherCourseDetail(courseId),
    teacherLessonDetail(courseId, lessonId),
    { label: currentLabel },
  ];
}

function teacherLessonListTrail(courseId, currentLabel) {
  return [
    teacherCourses,
    teacherCourseDetail(courseId),
    teacherLessons(courseId),
    { label: currentLabel },
  ];
}

function adminLessonTrail(courseId, lessonId, currentLabel) {
  return [
    adminCourses,
    adminCourseReview(courseId),
    adminLessonReview(courseId, lessonId),
    { label: currentLabel },
  ];
}

function adminLessonListTrail(courseId, currentLabel) {
  return [
    adminCourses,
    adminCourseReview(courseId),
    adminLessons(courseId),
    { label: currentLabel },
  ];
}
