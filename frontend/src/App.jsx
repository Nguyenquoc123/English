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
import AppShell from "./components/layout/AppShell/AppShell.jsx";
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
import KhoaHocDaMua from "./pages/student/KhoaHocDaMua.jsx";
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
import TeacherExamDetail from "./pages/exam/TeacherExamDetail.jsx";
import TeacherExamQuestionCreate from "./pages/exam/TeacherExamQuestionCreate.jsx";
import StudentExamTakingPage from "./pages/student/exam/StudentExamTakingPage.jsx";

import OurAdminLayout from "./pages/admin/AdminLayout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import UserManagement from "./pages/admin/UserManagement/UserManagement";
import TeacherApproval from "./pages/admin/TeacherApproval/TeacherApproval";
import CourseApproval from "./pages/admin/CourseApproval/CourseApproval";
import Withdrawal from "./pages/admin/Withdrawal/Withdrawal";
import NotificationManagement from "./pages/admin/NotificationManagement/NotificationManagement";
import TransactionManagement from "./pages/admin/TransactionManagement/TransactionManagement";
import RefundManagement from "./pages/admin/RefundManagement/RefundManagement";
import ChangePassword from "./pages/admin/ChangePassword/ChangePassword";
import Statistics from "./pages/admin/Statistics/Statistics";

import AiChatWidget from "./pages/chataiwidget/AiChatWidget.jsx";
import CreatePersonalPractice from "./pages/student/practice/CreatePersonalPractice.jsx";
import DanhSachBaiOnTap from "./pages/danhsachbaiontap/DanhSachBaiOnTap.jsx";
import LamBaiOnTap from "./pages/danhsachbaiontap/lambaiontap/LamBaiOnTap.jsx";
import LichSuLamBai from "./pages/lichsulambai/LichSuLamBai.jsx";

import ChiTietBaiLam from "./pages/lichsulambai/ChiTietBaiLam.jsx";
import DSKhoaHocDaMua from "./pages/dskhoahocdamua/DSKhoaHocDaMua.jsx";
import CartPage from "./pages/cart/CartPage.jsx";
import ThanhToanGioHang from "./pages/cart/ThanhToanGioHang.jsx";
import Navbar from "./components/layout/Navbar/Navbar.jsx";
import TeacherProfilePage from "./pages/teacher-profile/TeacherProfilePage.jsx";
import TeacherProfileUpdatePage from "./pages/teacher-profile/TeacherProfileUpdatePage.jsx";
import TeacherBankAccountsPage from "./pages/teacher-bank-account/TeacherBankAccountsPage.jsx";
import TeacherWithdrawCreate from "./pages/teacher-withdraw/TeacherWithdrawCreate.jsx";
import TeacherWithdrawHistory from "./pages/teacher-withdraw/TeacherWithdrawHistory.jsx";
import StudentBankAccountsPage from "./pages/student-bank-account/StudentBankAccountsPage.jsx";
import TeacherDashboard from "./pages/teacher-dashboard/TeacherDashboard.jsx";
import CourseItemsSorter from "./pages/course-items-sort/CourseItemsSorter.jsx";
import TeacherLessonEdit from "./pages/teacher/TeacherLessonEdit.jsx";
import ExamEdit from "./pages/exam/ExamEdit.jsx";
import TeacherVideoEdit from "./pages/teacher/TeacherVideoEdit.jsx";
import TeacherGrammarEdit from "./pages/teacher/TeacherGrammarEdit.jsx";
import TeacherEarningsPage from "./pages/teacher-earning/TeacherEarningsPage.jsx";
import QuestionBankCreate from "./pages/question-bank/QuestionBankCreate.jsx";
import QuestionBank from "./pages/question-bank/QuestionBank.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/forgot-password/ForgotPassword.jsx";
import SystemSettingsPage from "./pages/admin/SystemSetting/SystemSettingsPage.jsx";
import RefundRequestHistoryPage from "./pages/refund-history/RefundRequestHistoryPage.jsx";

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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
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
              <AiChatWidget />
            </>
          }
        />

        <Route path="/khoa-hoc/:courseId" element={
          <>
            <Navbar />
            <StudentCourseDetail />
            <AiChatWidget />
          </>
        } />

        <Route path="/courses/:courseId/purchase" element={
          <AppShell>
            <StudentCoursePurchase />
          </AppShell>
        } />

        <Route path="/khoa-hoc/:courseId/lessons/:lessonId" element={
          <AppShell><StudentLessonDetail /></AppShell>
        } />
        <Route path="/khoa-hoc/:courseId/lessons/:lessonId/practice/:practiceType" element={
          <>
            <Navbar />
            <StudentPracticePage />

          </>
        } />
        <Route path="/khoa-hoc/:courseId/lessons/:lessonId/practice-result/:attemptId" element={
          <>
            <Navbar />
            <StudentPracticeResultPage />
          </>
        } />

        <Route path="/exams" element={<AppShell><StudentExamListPage /></AppShell>} />
        <Route path="/exams/:examId" element={<>
          <Navbar />
          <StudentExamTakingPage />

        </>} />

        <Route path="/student/profile" element={
          <AppShell>
            <StudentProfile />
          </AppShell>
        } />
        <Route path="/student/profile/update" element={
          <AppShell>
            <StudentProfileUpdate />
          </AppShell>
        } />

        <Route path="/student/change-password" element={
          <AppShell>
            <StudentChangePassword />
          </AppShell>
        } />

        <Route path="/student/khoa-hoc-da-mua" element={
          <AppShell>
            <KhoaHocDaMua />
          </AppShell>
        } />

        <Route path="/student/teacher-register" element={
          <AppShell>
            <StudentTeacherRegister />
          </AppShell>
        } />

        <Route
          path="/student/teacher-register/result"
          element={
            <AppShell>
              <StudentTeacherRegisterResult />
            </AppShell>
          }
        />

        <Route
          path="personal-practices"
          element={<>
            <Navbar />
            <DanhSachBaiOnTap />
          </>}
        />

        <Route
          path="personal-practices/:personalPracticeId"
          element={<>
            <Navbar />
            <LamBaiOnTap />
          </>}
        />

        <Route
          path="personal-practices/create"
          element={<>
            <Navbar />
            <CreatePersonalPractice />
          </>}
        />

        <Route path="lich-su-lam-bai" element={<>
          <Navbar />
          <LichSuLamBai />
        </>} />

        <Route path="lich-su-lam-bai/:attemptId" element={<>
          <Navbar />
          <ChiTietBaiLam />
        </>} />

        <Route path="khoa-hoc-da-mua" element={
          <>
            <Navbar />
            <DSKhoaHocDaMua />
          </>
        } />

        <Route path="/student/bank-account" element={
          <>
            <Navbar />
            <StudentBankAccountsPage />
          </>
        } />

        <Route path="/gio-hang" element={
          <>
            <Navbar />
            <CartPage />
          </>
        } />

        <Route path="/thanh-toan" element={<>
          <Navbar />
          <ThanhToanGioHang />
        </>} />

        <Route path="/refunds-history" element={<>
          <Navbar />
          <RefundRequestHistoryPage />
        </>} />

        <Route path="/quen-mat-khau" element={<ForgotPassword />} />

        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/revenue" replace />} />
          <Route path="courses" element={<TeacherCourseList />} />
          <Route path="courses/create" element={<TeacherCourseCreate />} />
          <Route path="courses/:courseId" element={<TeacherCourseDetail />} />
          <Route path="courses/:courseId/edit" element={<TeacherCourseUpdate />} />
          <Route path="courses/:courseId/lessons" element={<TeacherLessonList />} />
          <Route
            path="courses/:courseId/items/sort"
            element={<CourseItemsSorter />}
          />
          <Route path="courses/:courseId/lessons/create" element={<TeacherLessonCreate />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<TeacherLessonDetail />} />
          <Route
            path="courses/:courseId/lessons/:lessonId/edit"
            element={<TeacherLessonEdit />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/vocabularies/create"
            element={<TeacherVocabularyCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/grammar/create"
            element={<TeacherGrammarCreate />}
          />

          <Route
            path="courses/:courseId/lessons/:lessonId/grammars/:grammarId/edit"
            element={<TeacherGrammarEdit />}
          />

          <Route
            path="courses/:courseId/lessons/:lessonId/videos/create"
            element={<TeacherVideoCreate />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/videos/:videoId/edit"
            element={<TeacherVideoEdit />}
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
          <Route path="courses/:courseId/exams/:examId" element={<TeacherExamDetail />} />
          <Route
            path="courses/:courseId/exams/:examId/edit"
            element={<ExamEdit />}
          />
          <Route
            path="courses/:courseId/exams/:examId/questions/create"
            element={<TeacherExamQuestionCreate />}
          />


          <Route path="profile" element={<TeacherProfilePage />} />
          <Route path="profile/update" element={<TeacherProfileUpdatePage />} />
          <Route path="bank" element={<TeacherBankAccountsPage />} />
          <Route path="lessons" element={<h1>Quản lý lesson</h1>} />
          <Route path="videos" element={<h1>Upload video bài học</h1>} />
          <Route path="vocabularies" element={<h1>Quản lý từ vựng</h1>} />
          <Route path="grammar" element={<h1>Quản lý ngữ pháp</h1>} />
          <Route path="practice-questions" element={<h1>Quản lý câu hỏi ôn tập</h1>} />
          <Route path="exams" element={<h1>Quản lý kỳ thi</h1>} />
          <Route path="exam-results" element={<h1>Kết quả thi học viên</h1>} />
          <Route path="revenue" element={<TeacherDashboard />} />
          <Route path="withdrawals/create" element={<TeacherWithdrawCreate />} />
          <Route path="withdrawals" element={<TeacherWithdrawHistory />} />
          <Route path="earnings" element={<TeacherEarningsPage />} />
          <Route path="questions-bank" element={<QuestionBank />} />
          <Route path="questions-bank/create" element={<QuestionBankCreate />} />

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

          <Route path="course-approval" element={<CourseApproval />} />

          <Route path="withdrawals" element={<Withdrawal />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="refunds" element={<RefundManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="system-settings" element={<SystemSettingsPage />} />
        </Route>

        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />

      </Routes>

    </BrowserRouter>


  );
}

export default App;
