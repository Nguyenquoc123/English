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
import AdminLayout from "./layouts/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCourseList from "./pages/admin/AdminCourseList.jsx";
import AdminCourseReviewDetail from "./pages/admin/AdminCourseReviewDetail.jsx";
import AdminCourseLessonReviewList from "./pages/admin/AdminCourseLessonReviewList.jsx";
import AdminLessonReviewDetail from "./pages/admin/AdminLessonReviewDetail.jsx";
import AdminLessonVideoListReview from "./pages/admin/AdminLessonVideoListReview.jsx";
import AdminLessonVideoDetailReview from "./pages/admin/AdminLessonVideoDetailReview.jsx";
import AdminLessonGrammarListReview from "./pages/admin/AdminLessonGrammarListReview.jsx";
import AdminLessonGrammarDetailReview from "./pages/admin/AdminLessonGrammarDetailReview.jsx";
import AdminLessonPracticeQuestionList from "./pages/admin/AdminLessonPracticeQuestionList.jsx";
import AdminLessonPracticeQuestionOverview from "./pages/admin/AdminLessonPracticeQuestionOverview.jsx";
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
        <Route
          path="/khoa-hoc/:courseId/lessons/:lessonId"
          element={
            <>
              <Navbar />
              <StudentLessonDetail />
            </>
          }
        />
        <Route
          path="/khoa-hoc/:courseId/lessons/:lessonId/practice/:practiceType"
          element={
            <>
              <Navbar />
              <StudentPracticePage />
            </>
          }
        />

        <Route
          path="/khoa-hoc/:courseId/lessons/:lessonId/practice-result/:attemptId"
          element={
            <>
              <Navbar />
              <StudentPracticeResultPage />
            </>
          }
        />

        <Route path="/courses/:courseId/purchase" element={
          <>
            <Navbar />
            <StudentCoursePurchase />
          </>
        } />

        <Route path="/exams" element={
          <>
            <Navbar />
            <StudentExamListPage />
          </>
        } />

        <Route path="/student/profile" element={<>
          <Navbar />
          <StudentProfile />
        </>} />

        <Route path="/student/profile/update" element={
          <>
            <Navbar />
            <StudentProfileUpdate />
          </>
        } />

        <Route path="/student/change-password" element={<>
          <Navbar />
          <StudentChangePassword />
        </>} />

        <Route path="/student/teacher-register" element={<>
          <Navbar />
          <StudentTeacherRegister />
        </>} />

        <Route
          path="/student/teacher-register/result"
          element={<>
            <Navbar />
            <StudentTeacherRegisterResult />
          </>}
        />

        

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

        {/* /*** admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<h1>Danh sách user</h1>} />
          <Route path="users/:userId" element={<h1>Chi tiết user</h1>} />
          <Route path="users/statistics" element={<h1>Thống kê người dùng</h1>} />

          <Route path="teacher-profiles/pending" element={<h1>Hồ sơ giáo viên chờ duyệt</h1>} />
          <Route path="teacher-profiles/:profileId/review" element={<h1>Duyệt hồ sơ giáo viên</h1>} />

          <Route path="courses" element={<AdminCourseList />} />
          <Route path="courses/pending" element={<h1>Khóa học chờ duyệt</h1>} />
          <Route path="courses/:courseId/review" element={<AdminCourseReviewDetail />} />
          <Route path="courses/statistics" element={<h1>Thống kê khóa học</h1>} />

          <Route
            path="courses/:courseId/lessons"
            element={<AdminCourseLessonReviewList />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/review"
            element={<AdminLessonReviewDetail />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos"
            element={<AdminLessonVideoListReview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos/:videoId"
            element={<AdminLessonVideoDetailReview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammars"
            element={<AdminLessonGrammarListReview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammars/:grammarId"
            element={<AdminLessonGrammarDetailReview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/practice"
            element={<AdminLessonPracticeQuestionOverview />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/practice/:practiceType"
            element={<AdminLessonPracticeQuestionList />}
          />

          <Route path="withdrawals" element={<h1>Danh sách yêu cầu rút tiền</h1>} />
          <Route path="withdrawals/:withdrawalId" element={<h1>Chi tiết yêu cầu rút tiền</h1>} />

          <Route path="notifications/create" element={<h1>Tạo thông báo</h1>} />
          <Route path="notifications" element={<h1>Lịch sử thông báo</h1>} />

          <Route path="vocabularies/import" element={<h1>Import từ vựng Excel</h1>} />
          <Route path="flashcard-sets" element={<h1>Quản lý bộ Flashcard hệ thống</h1>} />

          <Route path="revenue-reports" element={<h1>Báo cáo doanh thu</h1>} />
          <Route path="reports/export" element={<h1>Xuất báo cáo Excel / PDF</h1>} />
        </Route>
        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;