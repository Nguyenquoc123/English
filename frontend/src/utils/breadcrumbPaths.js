/** Các segment breadcrumb dùng chung (student / teacher / admin). */

export const studentHome = { label: "Trang chủ", to: "/" };
export const studentCourses = { label: "Khóa học", to: "/danh-sach-khoa-hoc" };
export const studentCourseDetail = (courseId) => ({
  label: "Chi tiết khóa học",
  to: `/khoa-hoc/${courseId}`,
});
export const studentLesson = (courseId, lessonId) => ({
  label: "Bài học",
  to: `/khoa-hoc/${courseId}/lessons/${lessonId}`,
});
export const studentProfile = { label: "Hồ sơ cá nhân", to: "/student/profile" };
export const studentMyCourses = {
  label: "Khóa học đã mua",
  to: "/student/khoa-hoc-da-mua",
};
export const studentExams = { label: "Kỳ thi", to: "/exams" };

export const teacherCourses = {
  label: "Quản lý khóa học",
  to: "/teacher/courses",
};
export const teacherCourseDetail = (courseId) => ({
  label: "Chi tiết khóa học",
  to: `/teacher/courses/${courseId}`,
});
export const teacherLessons = (courseId) => ({
  label: "Danh sách bài học",
  to: `/teacher/courses/${courseId}/lessons`,
});
export const teacherLessonDetail = (courseId, lessonId) => ({
  label: "Chi tiết bài học",
  to: `/teacher/courses/${courseId}/lessons/${lessonId}`,
});
export const teacherLessonVideos = (courseId, lessonId) => ({
  label: "Danh sách video",
  to: `/teacher/courses/${courseId}/lessons/${lessonId}/videos`,
});
export const teacherLessonGrammars = (courseId, lessonId) => ({
  label: "Danh sách ngữ pháp",
  to: `/teacher/courses/${courseId}/lessons/${lessonId}/grammars`,
});
export const teacherLessonPractice = (courseId, lessonId) => ({
  label: "Quản lý ôn tập",
  to: `/teacher/courses/${courseId}/lessons/${lessonId}/practice`,
});
export const teacherExams = { label: "Quản lý kỳ thi", to: "/teacher/exams" };
export const teacherExamDetail = (examId) => ({
  label: "Chi tiết kỳ thi",
  to: `/teacher/exams/${examId}`,
});

export const adminCourses = { label: "Duyệt khóa học", to: "/admin/courses" };
export const adminCourseReview = (courseId) => ({
  label: "Review khóa học",
  to: `/admin/courses/${courseId}/review`,
});
export const adminLessons = (courseId) => ({
  label: "Danh sách bài học",
  to: `/admin/courses/${courseId}/lessons`,
});
export const adminLessonReview = (courseId, lessonId) => ({
  label: "Duyệt bài học",
  to: `/admin/courses/${courseId}/lessons/${lessonId}/review`,
});
export const adminLessonVideos = (courseId, lessonId) => ({
  label: "Danh sách video",
  to: `/admin/courses/${courseId}/lessons/${lessonId}/videos`,
});
export const adminLessonGrammars = (courseId, lessonId) => ({
  label: "Danh sách ngữ pháp",
  to: `/admin/courses/${courseId}/lessons/${lessonId}/grammars`,
});
export const adminLessonPractice = (courseId, lessonId) => ({
  label: "Quản lý ôn tập",
  to: `/admin/courses/${courseId}/lessons/${lessonId}/practice`,
});

export const teacherLessonTrail = (courseId, lessonId, currentLabel) => [
  teacherCourses,
  teacherCourseDetail(courseId),
  teacherLessonDetail(courseId, lessonId),
  { label: currentLabel },
];

export const teacherLessonListTrail = (courseId, currentLabel) => [
  teacherCourses,
  teacherCourseDetail(courseId),
  teacherLessons(courseId),
  { label: currentLabel },
];

export const adminLessonTrail = (courseId, lessonId, currentLabel) => [
  adminCourses,
  adminCourseReview(courseId),
  adminLessonReview(courseId, lessonId),
  { label: currentLabel },
];

export const adminLessonListTrail = (courseId, currentLabel) => [
  adminCourses,
  adminCourseReview(courseId),
  adminLessons(courseId),
  { label: currentLabel },
];
