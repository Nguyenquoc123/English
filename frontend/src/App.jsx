import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import Login from "./pages/login/DangNhap.jsx";
import Register from "./pages/register/DangKy.jsx";
import XacMinh from "./pages/verifyotp/XacMinh.jsx";
import DSKhoaHoc from "./pages/courselist/DSKhoaHoc.jsx";

import TeacherLayout from "./layouts/teacher/TeacherLayout.jsx";
import TeacherCourseList from "./pages/teacher/TeacherCourseList.jsx";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail.jsx";
import TeacherCourseCreate from "./pages/teacher/TeacherCourseCreate.jsx";
import TeacherCourseUpdate from "./pages/teacher/TeacherCourseUpdate.jsx";
import TeacherLessonList from "./pages/teacher/TeacherLessonList.jsx";
import TeacherLessonCreate from "./pages/teacher/TeacherLessonCreate.jsx";
import TeacherLessonDetail from "./pages/teacher/TeacherLessonDetail.jsx";
import Navbar from "./components/layout/Navbar/Navbar.jsx";
import TeacherVocabularyCreate from "./pages/teacher/TeacherVocabularyCreate.jsx";
import TeacherGrammarCreate from "./pages/teacher/TeacherGrammarCreate.jsx";
import TeacherVideoCreate from "./pages/teacher/TeacherVideoCreate.jsx";
import TeacherQuestionCreate from "./pages/teacher/TeacherQuestionCreate.jsx";
import TeacherLessonVideoList from "./pages/teacher/TeacherLessonVideoList.jsx";
import TeacherLessonVideoDetail from "./pages/teacher/TeacherLessonVideoDetail.jsx";
import TeacherLessonVocabularyList from "./pages/teacher/TeacherLessonVocabularyList.jsx";
import TeacherLessonGrammarDetail from "./pages/teacher/TeacherLessonGrammarDetail.jsx";
import TeacherLessonPracticeOverview from "./pages/teacher/TeacherLessonPracticeOverview.jsx";
import TeacherLessonPracticeQuestionList from "./pages/teacher/TeacherLessonPracticeQuestionList.jsx";
import TeacherLessonGrammarList from "./pages/teacher/TeacherLessonGrammarList.jsx";

// Import các trang course review đã refactor
import CourseManagement from "./pages/admin/CourseManagement/CourseManagement";
import CourseReviewDetail from "./pages/admin/CourseReviewDetail/CourseReviewDetail";
import LessonReviewList from "./pages/admin/LessonReviewList/LessonReviewList";
import LessonReviewDetail from "./pages/admin/LessonReviewDetail/LessonReviewDetail";
import LessonVideoList from "./pages/admin/LessonVideoList/LessonVideoList";
import LessonVideoDetail from "./pages/admin/LessonVideoDetail/LessonVideoDetail";
import LessonGrammarList from "./pages/admin/LessonGrammarList/LessonGrammarList";
import LessonGrammarDetail from "./pages/admin/LessonGrammarDetail/LessonGrammarDetail";
import LessonPracticeOverview from "./pages/admin/LessonPracticeOverview/LessonPracticeOverview";
import LessonPracticeList from "./pages/admin/LessonPracticeList/LessonPracticeList";

import StudentCourseDetail from "./pages/student/StudentCourseDetail.jsx";
import StudentCoursePurchase from "./pages/student/StudentCoursePurchase.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentProfileUpdate from "./pages/student/StudentProfileUpdate.jsx";
import StudentChangePassword from "./pages/student/StudentChangePassword.jsx";
import StudentTeacherRegister from "./pages/student/StudentTeacherRegister.jsx";
import StudentTeacherRegisterResult from "./pages/student/StudentTeacherRegisterResult.jsx";
import StudentLessonDetail from "./pages/student/lesson/StudentLessonDetail.jsx";
import StudentPracticePage from "./pages/student/practice/StudentPracticePage.jsx";
import StudentPracticeResultPage from "./pages/student/practice/StudentPracticeResultPage.jsx";
import StudentExamListPage from "./pages/student/exam/StudentExamListPage.jsx";
import ExamListPage from "./pages/exam/ExamListPage.jsx";
import TeacherExamCreate from "./pages/exam/ExamCreate.jsx";

import OurAdminLayout from "./pages/admin/AdminLayout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import UserManagement from "./pages/admin/UserManagement/UserManagement";
import TeacherApproval from "./pages/admin/TeacherApproval/TeacherApproval";
import CourseApproval from "./pages/admin/CourseApproval/CourseApproval";
import Withdrawal from "./pages/admin/Withdrawal/Withdrawal";
import LessonFree from "./pages/admin/LessonFree/LessonFree";
import ExamApproval from "./pages/admin/ExamApproval/ExamApproval";
import NotificationManagement from "./pages/admin/NotificationManagement/NotificationManagement";
import TransactionManagement from "./pages/admin/TransactionManagement/TransactionManagement";
import ReviewManagement from "./pages/admin/ReviewManagement/ReviewManagement";
import ChangePassword from "./pages/admin/ChangePassword/ChangePassword";

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/xac-minh" element={<XacMinh />} />

        <Route
          path="/danh-sach-khoa-hoc"
          element={
            <>
              <Navbar />
              <DSKhoaHoc />
            </>
          }
        />

        <Route path="/khoa-hoc/:courseId" element={
          <>
            <Navbar />
            <StudentCourseDetail />
          </>
        } />

        <Route path="/courses/:courseId/purchase" element={
          <>
            <Navbar />
            <StudentCoursePurchase />
          </>
        } />

        {/* Student lesson & practice routes */}
        <Route path="/khoa-hoc/:courseId/lessons/:lessonId" element={
          <><Navbar /><StudentLessonDetail /></>
        } />
        <Route path="/khoa-hoc/:courseId/lessons/:lessonId/practice/:practiceType" element={
          <><Navbar /><StudentPracticePage /></>
        } />
        <Route path="/khoa-hoc/:courseId/lessons/:lessonId/practice-result/:attemptId" element={
          <><Navbar /><StudentPracticeResultPage /></>
        } />

        {/* Student exam */}
        <Route path="/exams" element={<><Navbar /><StudentExamListPage /></>} />

        {/* Student profile & settings */}
        <Route path="/student/profile" element={<><Navbar /><StudentProfile /></>} />
        <Route path="/student/profile/update" element={<><Navbar /><StudentProfileUpdate /></>} />
        <Route path="/student/change-password" element={<><Navbar /><StudentChangePassword /></>} />
        <Route path="/student/teacher-register" element={<><Navbar /><StudentTeacherRegister /></>} />
        <Route path="/student/teacher-register/result" element={<><Navbar /><StudentTeacherRegisterResult /></>} />

        <Route path="/quen-mat-khau" element={<h1>Trang quên mật khẩu</h1>} />

        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/courses" replace />} />
          <Route path="courses" element={<TeacherCourseList />} />
          <Route path="courses/create" element={<TeacherCourseCreate />} />
          <Route path="courses/:courseId" element={<TeacherCourseDetail />} />
          <Route path="courses/:courseId/edit" element={<TeacherCourseUpdate />} />
          <Route path="courses/:courseId/lessons" element={<TeacherLessonList />} />
          <Route path="courses/:courseId/lessons/create" element={<TeacherLessonCreate />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<TeacherLessonDetail />} />
          <Route
            path="courses/:courseId/lessons/:lessonId/vocabularies/create"
            element={<TeacherVocabularyCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammar/create"
            element={<TeacherGrammarCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos/create"
            element={<TeacherVideoCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/questions/create"
            element={<TeacherQuestionCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos"
            element={<TeacherLessonVideoList />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos/:videoId"
            element={<TeacherLessonVideoDetail />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/vocabularies"
            element={<TeacherLessonVocabularyList />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammars"
            element={<TeacherLessonGrammarList />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammars/:grammarId"
            element={<TeacherLessonGrammarDetail />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/practice"
            element={<TeacherLessonPracticeOverview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/practice/:practiceType"
            element={<TeacherLessonPracticeQuestionList />}
          />
          <Route path="exams" element={<ExamListPage />} />
          <Route path="courses/:courseId/exams" element={<ExamListPage />} />
          <Route path="exams/create" element={<TeacherExamCreate />} />

          <Route path="profile" element={<h1>Hồ sơ giáo viên</h1>} />
          <Route path="bank" element={<h1>Tài khoản ngân hàng</h1>} />
          <Route path="lessons" element={<h1>Quản lý lesson</h1>} />
          <Route path="videos" element={<h1>Upload video bài học</h1>} />
          <Route path="vocabularies" element={<h1>Quản lý từ vựng</h1>} />
          <Route path="grammar" element={<h1>Quản lý ngữ pháp</h1>} />
          <Route path="practice-questions" element={<h1>Quản lý câu hỏi ôn tập</h1>} />
          <Route path="exams" element={<h1>Quản lý kỳ thi</h1>} />
          <Route path="exam-results" element={<h1>Kết quả thi học viên</h1>} />
          <Route path="revenue" element={<h1>Dashboard doanh thu</h1>} />
          <Route path="withdrawals/create" element={<h1>Tạo yêu cầu rút tiền</h1>} />
          <Route path="withdrawals" element={<h1>Lịch sử rút tiền</h1>} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <OurAdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="teachers" element={<TeacherApproval />} />

          {/* Danh sách và review khóa học */}
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/:courseId/review" element={<CourseReviewDetail />} />
          <Route path="courses/:courseId/lessons" element={<LessonReviewList />} />
          <Route path="courses/:courseId/lessons/:lessonId/review" element={<LessonReviewDetail />} />
          <Route path="courses/:courseId/lessons/:lessonId/videos" element={<LessonVideoList />} />
          <Route path="courses/:courseId/lessons/:lessonId/videos/:videoId" element={<LessonVideoDetail />} />
          <Route path="courses/:courseId/lessons/:lessonId/grammars" element={<LessonGrammarList />} />
          <Route path="courses/:courseId/lessons/:lessonId/grammars/:grammarId" element={<LessonGrammarDetail />} />
          <Route path="courses/:courseId/lessons/:lessonId/practice" element={<LessonPracticeOverview />} />
          <Route path="courses/:courseId/lessons/:lessonId/practice/:practiceType" element={<LessonPracticeList />} />

          {/* Duyệt khóa học (chờ duyệt) */}
          <Route path="course-approval" element={<CourseApproval />} />

          <Route path="withdrawals" element={<Withdrawal />} />
          <Route path="lessons-free" element={<LessonFree />} />
          <Route path="exams" element={<ExamApproval />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
