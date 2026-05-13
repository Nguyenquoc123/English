
import axiosClient from "./axiosClient";
// DASHBOARD
/** 
 * @returns {Promise<AxiosResponse>} Promise chứa response — khi resolve:
 *   response.data = AdminDashboardResponse (tổng số user, khóa học, doanh thu...)
 */
export const getDashboard = () => axiosClient.get("/admin/dashboard");

//QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)


/**
 *
 * @param {string|undefined} keyword  
 * @param {string|undefined} roleName 
 * @returns {Promise<AxiosResponse>} 
 */
export const getAllUsers = (keyword = "", roleName = "", status = "") =>
  axiosClient.get("/admin/users", { params: { keyword, roleName, status } });

export const getUserDetail = (userId) => axiosClient.get(`/admin/users/${userId}`);

export const createUser = (data) => axiosClient.post("/admin/users", data);

export const updateUserRole = (userId, roleName) =>
  axiosClient.put(`/admin/users/${userId}/role`, { roleName });

/**
 * @param {number} userId - ID của người dùng cần thay đổi trạng thái
 * @param {string} status - Trạng thái mới:
 *                          "banned"  → khoá tài khoản (user không thể đăng nhập)
 *                          "active"  → mở khoá tài khoản
 * @returns {Promise<AxiosResponse>} — response.data = UserAdminResponse (user sau khi cập nhật)
 */
export const updateUserStatus = (userId, status) =>
  // Template literal `\`/admin/users/${userId}/status\`` tạo URL động.
  // Ví dụ: userId = 42 → URL = "/admin/users/42/status"
  // Tham số thứ hai { status } là request body — Axios tự serialize thành JSON string.
  // { status } là shorthand ES6 cho { status: status } — đặt giá trị biến status vào object.
  axiosClient.put(`/admin/users/${userId}/status`, { status });

// ============================================================
// NHÓM 3: QUẢN LÝ HỒ SƠ GIÁO VIÊN (TEACHER MANAGEMENT)
// ============================================================

/**
 * getPendingTeachers — Lấy danh sách hồ sơ giáo viên đang ở trạng thái chờ duyệt (PENDING).
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/teachers/pending
 *   - Backend trả về chỉ những hồ sơ có approvalStatus = "PENDING"
 *   - Dùng trên trang TeacherApproval để admin xem và xét duyệt từng hồ sơ
 *
 * Method: GET
 * Endpoint: /admin/teachers/pending
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = TeacherProfileResponse[] (chỉ PENDING)
 */
export const getPendingTeachers = () => axiosClient.get("/admin/teachers/pending");

/**
 * getAllTeacherProfiles — Lấy toàn bộ hồ sơ giáo viên, bất kể trạng thái duyệt.
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/teachers
 *   - Backend trả về tất cả hồ sơ: PENDING, APPROVED, REJECTED
 *   - Dùng khi admin cần xem lại lịch sử duyệt hoặc thống kê tổng thể
 *
 * Method: GET
 * Endpoint: /admin/teachers
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = TeacherProfileResponse[] (tất cả trạng thái)
 */
export const getAllTeacherProfiles = () => axiosClient.get("/admin/teachers");

// ============================================================
// NHÓM 4: QUẢN LÝ KHÓA HỌC (COURSE MANAGEMENT)
// ============================================================

/**
 * getPendingCourses — Lấy danh sách khóa học đang ở trạng thái chờ duyệt (PENDING).
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/courses/pending
 *   - Backend lọc và trả về các khóa học có status = "PENDING"
 *   - Admin xem danh sách này để chọn khóa học cần xét duyệt
 *
 * Method: GET
 * Endpoint: /admin/courses/pending
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = CourseResponse[] (chỉ PENDING)
 */
export const getPendingCourses = () => axiosClient.get("/admin/courses/pending");

/**
 * getAllAdminCourses — Lấy toàn bộ khóa học trong hệ thống (tất cả trạng thái).
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/courses
 *   - Backend trả về tất cả khóa học: PENDING, APPROVED, REJECTED, DRAFT...
 *   - Dùng trên trang CourseApproval để hiển thị danh sách đầy đủ với bộ lọc
 *
 * Method: GET
 * Endpoint: /admin/courses
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = CourseResponse[] (tất cả trạng thái)
 */
export const getAllAdminCourses = () => axiosClient.get("/admin/courses");

// ============================================================
// NHÓM 5: XÉT DUYỆT GIÁO VIÊN (TEACHER APPROVAL)
// Lưu ý: Dùng endpoint /teacher-profile (không phải /admin)
//         vì logic xử lý nằm trong TeacherProfileController của Spring Boot.
// ============================================================

/**
 * approveTeacher — Admin duyệt hoặc từ chối đơn đăng ký làm giáo viên.
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /teacher-profile/{teacherProfileId}/approve
 *   - Body chứa approvalStatus (quyết định) và rejectReason (lý do từ chối, nếu có)
 *   - Backend cập nhật trạng thái hồ sơ, có thể gửi email thông báo cho giáo viên
 *
 * Lý do dùng /teacher-profile thay vì /admin/teacher-profile:
 *   Backend Spring Boot tổ chức theo controller riêng biệt.
 *   Logic duyệt hồ sơ giáo viên nằm trong TeacherProfileController,
 *   không nằm trong AdminController, nên đường dẫn endpoint khác nhau.
 *
 * Method: PUT
 * Endpoint: /teacher-profile/{teacherProfileId}/approve
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} teacherProfileId - ID của hồ sơ giáo viên cần xét duyệt
 * @param {string} approvalStatus   - Quyết định của admin:
 *                                    "APPROVED" → chấp thuận, user được thêm role teacher
 *                                    "REJECTED" → từ chối
 * @param {string|null} rejectReason - Lý do từ chối, bắt buộc khi REJECTED, null khi APPROVED
 * @returns {Promise<AxiosResponse>} — response.data = TeacherProfileResponse (sau khi cập nhật)
 */
export const approveTeacher = (teacherProfileId, approvalStatus, rejectReason) =>
  // URL động với template literal: /teacher-profile/123/approve
  axiosClient.put(`/teacher-profile/${teacherProfileId}/approve`, {
    approvalStatus,  // Trạng thái duyệt: "APPROVED" hoặc "REJECTED" — shorthand ES6
    rejectReason,    // Lý do từ chối (null nếu APPROVED) — shorthand ES6
  });

// ============================================================
// NHÓM 6: XÉT DUYỆT KHÓA HỌC (COURSE APPROVAL)
// Lưu ý: Dùng endpoint /khoa-hoc (tên tiếng Việt) — đặt tên theo quy ước
//         của CourseController trong Spring Boot backend.
//
// Tại sao tách thành 2 hàm riêng biệt (approveCourse và rejectCourse)?
//   1. Khác nhau về endpoint: "/duyet" (duyệt) vs "/tu-choi" (từ chối)
//      → Backend xử lý ở 2 method handler khác nhau trong CourseController
//   2. Khác nhau về request body:
//      - approveCourse: KHÔNG có body (không cần lý do khi duyệt)
//      - rejectCourse: CÓ body { rejectReason } (bắt buộc phải có lý do từ chối)
//   3. Tách biệt giúp code rõ ràng hơn: caller không cần truyền tham số null/undefined
//      cho trường hợp không dùng đến, tránh nhầm lẫn khi gọi hàm.
// ============================================================

/**
 * approveCourse — Admin duyệt (chấp thuận) một khóa học.
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /khoa-hoc/{courseId}/duyet
 *   - KHÔNG gửi body (không cần thông tin gì thêm khi duyệt)
 *   - Backend tìm khóa học theo courseId, đổi status thành "APPROVED"
 *   - Khóa học sau đó hiển thị công khai cho học viên
 *
 * Tại sao không cần body?
 *   Hành động "duyệt" chỉ có một ý nghĩa duy nhất: chấp thuận.
 *   Không có thông tin bổ sung nào cần gửi — backend biết chính xác
 *   phải làm gì chỉ dựa vào URL endpoint "/duyet".
 *
 * Method: PUT
 * Endpoint: /khoa-hoc/{courseId}/duyet
 * Body: (không có)
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} courseId - ID của khóa học cần duyệt
 * @returns {Promise<AxiosResponse>} — response.data = CourseResponse (khóa học đã được duyệt)
 */
export const approveCourse = (courseId) =>
  // Chỉ cần URL động — không truyền body (tham số thứ hai của .put())
  // Axios sẽ gửi PUT request với body rỗng, Spring Boot chấp nhận điều này
  axiosClient.put(`/khoa-hoc/${courseId}/duyet`);

/**
 * rejectCourse — Admin từ chối một khóa học với lý do cụ thể.
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /khoa-hoc/{courseId}/tu-choi với body { rejectReason }
 *   - Backend tìm khóa học theo courseId, đổi status thành "REJECTED"
 *   - Lưu rejectReason vào database để giáo viên biết lý do bị từ chối
 *   - Giáo viên có thể chỉnh sửa khóa học và gửi lại để duyệt
 *
 * Tại sao cần rejectReason?
 *   - Tuân thủ quy trình nghiệp vụ: từ chối mà không có lý do là không minh bạch
 *   - Giáo viên cần biết phải sửa gì để đạt tiêu chuẩn
 *   - Backend có thể validate: nếu body thiếu rejectReason → trả về 400 Bad Request
 *
 * Tại sao dùng endpoint riêng "/tu-choi" thay vì gộp chung với approveCourse?
 *   - Endpoint riêng giúp backend có handler riêng, validation riêng (rejectReason bắt buộc)
 *   - Tránh logic phức tạp trong một handler: if (status == reject) check rejectReason...
 *   - Theo nguyên tắc Single Responsibility: mỗi endpoint làm một việc rõ ràng
 *
 * Method: PUT
 * Endpoint: /khoa-hoc/{courseId}/tu-choi
 * Body: { rejectReason: string }
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} courseId      - ID của khóa học cần từ chối
 * @param {string} rejectReason  - Lý do từ chối, BẮT BUỘC — giúp giáo viên biết cần sửa gì
 * @returns {Promise<AxiosResponse>} — response.data = CourseResponse (khóa học đã bị từ chối)
 */
export const rejectCourse = (courseId, rejectReason) =>
  // URL động + body { rejectReason }
  // Axios tự serialize object thành JSON: { "rejectReason": "Nội dung chưa phù hợp" }
  axiosClient.put(`/khoa-hoc/${courseId}/tu-choi`, { rejectReason });

// ============================================================
// NHÓM 7: QUẢN LÝ YÊU CẦU RÚT TIỀN (WITHDRAWAL MANAGEMENT)
// ============================================================

/**
 * getPendingWithdrawals — Lấy danh sách yêu cầu rút tiền đang chờ admin xử lý.
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/withdrawals/pending
 *   - Backend trả về các yêu cầu có status = "PENDING"
 *   - Admin xem thông tin tài khoản ngân hàng và số tiền, rồi quyết định chấp nhận/từ chối
 *
 * Method: GET
 * Endpoint: /admin/withdrawals/pending
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = WithdrawalResponse[] (chỉ PENDING)
 */
export const getPendingWithdrawals = () => axiosClient.get("/admin/withdrawals/pending");

/**
 * getAllWithdrawals — Lấy toàn bộ yêu cầu rút tiền (tất cả trạng thái).
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/withdrawals
 *   - Backend trả về tất cả: PENDING, PAID, REJECTED
 *   - Dùng để xem lịch sử toàn bộ các giao dịch rút tiền
 *
 * Method: GET
 * Endpoint: /admin/withdrawals
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = WithdrawalResponse[] (tất cả trạng thái)
 */
export const getAllWithdrawals = () => axiosClient.get("/admin/withdrawals");

/**
 * reviewWithdrawal — Admin xét duyệt một yêu cầu rút tiền (chấp nhận hoặc từ chối).
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /admin/withdrawals/{withdrawalId}/review
 *   - Body chứa status (quyết định) và rejectReason (lý do từ chối nếu có)
 *   - Backend cập nhật trạng thái yêu cầu, có thể gửi thông báo cho giáo viên
 *   - Nếu PAID: đánh dấu đã chuyển tiền thành công
 *   - Nếu REJECTED: ghi nhận lý do từ chối để giáo viên biết
 *
 * Method: PUT
 * Endpoint: /admin/withdrawals/{withdrawalId}/review
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} withdrawalId    - ID của yêu cầu rút tiền cần xét duyệt
 * @param {string} status          - Quyết định:
 *                                   "PAID"     → đã chuyển tiền thành công
 *                                   "REJECTED" → từ chối yêu cầu
 * @param {string|null} rejectReason - Lý do từ chối — bắt buộc khi REJECTED, null khi PAID
 * @returns {Promise<AxiosResponse>} — response.data = WithdrawalResponse (sau khi cập nhật)
 */
export const reviewWithdrawal = (withdrawalId, status, rejectReason) =>
  // URL động: ví dụ /admin/withdrawals/7/review
  // Body { status, rejectReason }: Axios tự serialize thành JSON
  // Cú pháp shorthand ES6: { status, rejectReason } = { status: status, rejectReason: rejectReason }
  axiosClient.put(`/admin/withdrawals/${withdrawalId}/review`, { status, rejectReason });

// ============================================================
// NHÓM 8: QUẢN LÝ BÀI HỌC MIỄN PHÍ (LESSON FREE MANAGEMENT)
// Admin có thể tạo, sửa, xóa bài học miễn phí không thuộc khóa học nào.
// ============================================================

/**
 * getFreeLessons — Lấy danh sách tất cả bài học miễn phí trong hệ thống.
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/lessons/free
 *   - Backend trả về các bài học không gắn với khóa học trả phí nào
 *   - Admin xem và quản lý: thêm, sửa, xóa bài học miễn phí
 *
 * Method: GET
 * Endpoint: /admin/lessons/free
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = LessonResponse[] (bài học miễn phí)
 */
export const getFreeLessons = () => axiosClient.get("/admin/lessons/free");

/**
 * createFreeLesson — Admin tạo một bài học miễn phí mới.
 *
 * Cách hoạt động:
 *   - Gửi HTTP POST đến /admin/lessons/free với body chứa thông tin bài học
 *   - Backend tạo bài học mới, lưu vào database với isFree = true
 *   - Trả về bài học vừa tạo cùng ID mới được sinh ra
 *
 * Method: POST
 * Endpoint: /admin/lessons/free
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {string} title       - Tiêu đề bài học — bắt buộc, không được để trống
 * @param {string} description - Mô tả ngắn về bài học — có thể null
 * @param {string} status      - Trạng thái xuất bản:
 *                               "Published" → hiển thị cho học viên
 *                               "Hidden"    → ẩn khỏi học viên
 * @returns {Promise<AxiosResponse>} — response.data = LessonResponse (bài học vừa tạo với ID mới)
 */
export const createFreeLesson = (title, description, status) =>
  // Body: { title, description, status } — Axios serialize thành JSON
  // Cú pháp shorthand ES6: viết tên biến trực tiếp thay cho key: value
  axiosClient.post("/admin/lessons/free", { title, description, status });

/**
 * updateFreeLesson — Admin cập nhật thông tin một bài học miễn phí đã tồn tại.
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /admin/lessons/free/{lessonId} với body thông tin mới
 *   - Backend tìm bài học theo lessonId, cập nhật các trường, lưu lại
 *   - Trả về bài học với thông tin đã cập nhật
 *
 * Method: PUT
 * Endpoint: /admin/lessons/free/{lessonId}
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} lessonId    - ID của bài học cần cập nhật
 * @param {string} title       - Tiêu đề mới của bài học
 * @param {string} description - Mô tả mới của bài học
 * @param {string} status      - Trạng thái mới: "Published" hoặc "Hidden"
 * @returns {Promise<AxiosResponse>} — response.data = LessonResponse (sau khi cập nhật)
 */
export const updateFreeLesson = (lessonId, title, description, status) =>
  axiosClient.put(`/admin/lessons/free/${lessonId}`, { title, description, status });

/**
 * deleteFreeLesson — Admin xóa vĩnh viễn một bài học miễn phí.
 *
 * Cách hoạt động:
 *   - Gửi HTTP DELETE đến /admin/lessons/free/{lessonId}
 *   - Backend xóa bài học khỏi database (hoặc soft delete tùy cài đặt backend)
 *   - Thao tác này không thể hoàn tác — nên có confirm dialog phía UI trước khi gọi
 *
 * Method: DELETE
 * Endpoint: /admin/lessons/free/{lessonId}
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} lessonId - ID của bài học cần xóa
 * @returns {Promise<AxiosResponse>} — thường response.data rỗng hoặc message xác nhận
 */
export const deleteFreeLesson = (lessonId) =>
  axiosClient.delete(`/admin/lessons/free/${lessonId}`);

// ============================================================
// NHÓM 9: QUẢN LÝ KỲ THI (EXAM MANAGEMENT)
// ============================================================

/**
 * getAllExams — Lấy toàn bộ kỳ thi trong hệ thống để admin quản lý.
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/exams
 *   - Backend trả về tất cả kỳ thi ở mọi trạng thái: Open, Hidden, Closed
 *   - Admin xem danh sách và thay đổi trạng thái từng kỳ thi nếu cần
 *
 * Method: GET
 * Endpoint: /admin/exams
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = ExamAdminResponse[] (tất cả kỳ thi)
 */
export const getAllExams = () => axiosClient.get("/admin/exams");

/**
 * updateExamStatus — Admin thay đổi trạng thái của một kỳ thi.
 *
 * Cách hoạt động:
 *   - Gửi HTTP PUT đến /admin/exams/{examId}/status với body { status }
 *   - Backend tìm kỳ thi theo examId, cập nhật trạng thái
 *   - Trạng thái ảnh hưởng đến việc học viên có thể tham gia thi hay không
 *
 * Method: PUT
 * Endpoint: /admin/exams/{examId}/status
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {number} examId  - ID của kỳ thi cần cập nhật trạng thái
 * @param {string} status  - Trạng thái mới:
 *                           "Open"   → đang mở, học viên có thể thi
 *                           "Hidden" → ẩn, học viên không nhìn thấy
 *                           "Closed" → đã đóng, không thể thi nữa
 * @returns {Promise<AxiosResponse>} — response.data = ExamAdminResponse (sau khi cập nhật)
 */
export const updateExamStatus = (examId, status) =>
  axiosClient.put(`/admin/exams/${examId}/status`, { status });

// ============================================================
// NHÓM 10: QUẢN LÝ THÔNG BÁO (NOTIFICATION MANAGEMENT)
// ============================================================

/**
 * getAllNotifications — Lấy lịch sử tất cả thông báo đã được gửi bởi admin.
 *
 * Cách hoạt động:
 *   - Gửi HTTP GET đến /admin/notifications
 *   - Backend trả về danh sách thông báo đã gửi, sắp xếp theo thời gian mới nhất
 *   - Admin xem lại lịch sử các thông báo đã phát, gồm: tiêu đề, nội dung, đối tượng nhận
 *
 * Method: GET
 * Endpoint: /admin/notifications
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @returns {Promise<AxiosResponse>} — response.data = NotificationResponse[] (lịch sử thông báo)
 */
export const getAllNotifications = () => axiosClient.get("/admin/notifications");

/**
 * createNotification — Admin tạo và gửi một thông báo đến nhóm người dùng cụ thể.
 *
 * Cách hoạt động:
 *   - Gửi HTTP POST đến /admin/notifications với body chứa nội dung và đối tượng nhận
 *   - Backend tạo thông báo, lưu vào database, phân phối đến đúng người nhận
 *   - Thông báo xuất hiện trong inbox của người dùng khi họ đăng nhập
 *
 * Giải thích targetType và targetValue:
 *   - targetType = "ALL"  → gửi cho TẤT CẢ người dùng, targetValue = null
 *   - targetType = "ROLE" → gửi cho nhóm vai trò, targetValue = "student" | "teacher"
 *   - targetType = "USER" → gửi cho một user cụ thể, targetValue = userId (dạng string)
 *
 * Method: POST
 * Endpoint: /admin/notifications
 * Yêu cầu xác thực: JWT token với scope "admin"
 *
 * @param {string} title       - Tiêu đề thông báo — hiển thị nổi bật trong inbox — bắt buộc
 * @param {string} message     - Nội dung chi tiết của thông báo — bắt buộc
 * @param {string} targetType  - Kiểu đối tượng nhận: "ALL", "ROLE", hoặc "USER"
 * @param {string|null} targetValue - Giá trị xác định đối tượng nhận:
 *                                    null khi targetType = "ALL"
 *                                    tên role khi targetType = "ROLE"
 *                                    userId khi targetType = "USER"
 * @returns {Promise<AxiosResponse>} — response.data = NotificationResponse (thông báo vừa tạo)
 */
export const createNotification = (title, message, targetType, targetValue) =>
  // Body: { title, message, targetType, targetValue }
  // Axios tự serialize thành JSON và gắn Content-Type: application/json (đã cấu hình trong axiosClient)
  axiosClient.post("/admin/notifications", { title, message, targetType, targetValue });

// ============================================================
// NHÓM 11: QUẢN LÝ GIAO DỊCH (TRANSACTION MANAGEMENT — ADM-10)
// ============================================================

/**
 * getAllTransactions — Lấy tất cả giao dịch thanh toán trong hệ thống.
 * Method: GET | Endpoint: /admin/transactions
 * @returns {Promise<AxiosResponse>} — response.data = TransactionAdminResponse[]
 */
export const getAllTransactions = () => axiosClient.get("/admin/transactions");

// ============================================================
// NHÓM 12: QUẢN LÝ ĐÁNH GIÁ KHÓA HỌC (REVIEW MANAGEMENT — ADM-11)
// ============================================================

/**
 * getAllReviews — Lấy tất cả đánh giá khóa học để admin kiểm duyệt.
 * Method: GET | Endpoint: /admin/reviews
 * @returns {Promise<AxiosResponse>} — response.data = CourseReviewResponse[]
 */
export const getAllReviews = () => axiosClient.get("/admin/reviews");

/**
 * deleteReview — Admin xóa một đánh giá vi phạm chính sách (hard delete).
 * Nên hiển thị confirm dialog trước khi gọi — không thể hoàn tác.
 * Method: DELETE | Endpoint: /admin/reviews/{reviewId}
 * @param {number} reviewId - ID đánh giá cần xóa
 * @returns {Promise<AxiosResponse>} — response.data = String (message xác nhận)
 */
export const deleteReview = (reviewId) =>
  axiosClient.delete(`/admin/reviews/${reviewId}`);

// ============================================================
// NHÓM 13: QUẢN LÝ KHÓA HỌC — DANH SÁCH VÀ REVIEW
// ============================================================

// Lấy danh sách khóa học với bộ lọc keyword và status
export const getCourseList = (keyword, status) =>
  axiosClient.get("/khoa-hoc/danh-sach-khoa-hoc", { params: { keyword, status } });

// Lấy chi tiết khóa học để admin review
export const getCourseDetailForAdmin = (courseId) =>
  axiosClient.get(`/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`);

// Lấy danh sách bài học của khóa học (dùng cho admin)
export const getLessonsForAdmin = (courseId) =>
  axiosClient.get(`/lesson/${courseId}/teacher`);

// Lấy chi tiết bài học cho admin review
export const getLessonDetailForAdmin = (courseId, lessonId) =>
  axiosClient.get(`/lesson/${courseId}/admin/lessons/${lessonId}`);

// Lấy danh sách video của bài học
export const getVideosByLesson = (lessonId) =>
  axiosClient.get(`/video/${lessonId}/lessons`);

// Lấy chi tiết video cho admin
export const getVideoDetailForAdmin = (videoId) =>
  axiosClient.get(`/video/${videoId}/admin`);

// Lấy danh sách ngữ pháp của bài học
export const getGrammarsByLesson = (lessonId) =>
  axiosClient.get(`/grammar/${lessonId}/grammars`);

// Lấy chi tiết ngữ pháp cho admin
export const getGrammarDetailForAdmin = (grammarId) =>
  axiosClient.get(`/grammar/${grammarId}/admin`);

// ============================================================
// NHÓM 13: ĐỔI MẬT KHẨU QUẢN TRỊ (CHANGE PASSWORD — ADM-15)
// ============================================================

/**
 * changeAdminPassword — Đổi mật khẩu tài khoản admin đang đăng nhập.
 *
 * Backend lấy username từ JWT SecurityContext (không cần gửi username trong body).
 * oldPassword được verify bằng BCrypt.matches() — không so sánh plain text.
 * newPassword được BCrypt encode trước khi lưu vào database.
 *
 * Method: PUT | Endpoint: /admin/change-password
 * @param {string} oldPassword     - Mật khẩu hiện tại
 * @param {string} newPassword     - Mật khẩu mới (≥ 6 ký tự)
 * @param {string} confirmPassword - Xác nhận mật khẩu mới (phải = newPassword)
 * @returns {Promise<AxiosResponse>} — response.data = "Đổi mật khẩu thành công"
 */
export const changeAdminPassword = (oldPassword, newPassword, confirmPassword) =>
  axiosClient.put("/admin/change-password", { oldPassword, newPassword, confirmPassword });
