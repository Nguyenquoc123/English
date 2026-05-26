import { useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonTrail } from "../../utils/breadcrumbPaths";
import QuestionCreateComponent from "../../compenents/question/QuestionCreateComponent";

const API_BASE = "http://localhost:8080";

function TeacherQuestionCreate() {
    const { courseId, lessonId } = useParams();

    return (
        // <QuestionCreateComponent
        //     title="Thêm câu hỏi ôn tập"
        //     targetLabel="Tạo câu hỏi mới hoặc chọn từ ngân hàng để gắn vào bài học."
        //     breadcrumb={
        //         <CourseBreadcrumb
        //             items={teacherLessonTrail(courseId, lessonId, "Thêm câu hỏi")}
        //         />
        //     }
        //     allowAttachExisting={true}
        //     showExamPoint={false}
        //     createEndpoint={`${API_BASE}/questions/lessons/${lessonId}`}
        //     attachEndpoint={`${API_BASE}/questions/lessons/${lessonId}/attach`}
        //     buildCreatePayload={({ basePayload }) => ({
        //         ...basePayload,
        //         lessonId: Number(lessonId),
        //     })}
        //     buildAttachPayload={({ questionType, questionIds }) => ({
        //         lessonId: Number(lessonId),
        //         questionType,
        //         questionIds,
        //     })}
        //     submitNewText="Tạo và gắn câu hỏi"
        //     submitExistingText="Gắn câu hỏi đã chọn"
        //     successCreateMessage="Thêm câu hỏi vào bài ôn tập thành công"
        //     successAttachMessage="Gắn câu hỏi vào bài ôn tập thành công"
        //     cancelPath={`/teacher/courses/${courseId}/lessons/${lessonId}`}
        //     redirectPath={`/teacher/courses/${courseId}/lessons/${lessonId}`}
        // />

        <QuestionCreateComponent
            title="Thêm câu hỏi ôn tập"
            targetLabel="Tạo câu hỏi mới hoặc chọn từ ngân hàng để gắn vào bài học."
            allowAttachExisting={true}
            showExamPoint={false}
            createEndpoint={`${API_BASE}/questions/lessons/${lessonId}`}
            attachEndpoint={`${API_BASE}/questions/lessons/${lessonId}/attach`}
            bulkCreateEndpoint={`${API_BASE}/questions/lessons/${lessonId}/many`}
            buildCreatePayload={({ basePayload }) => ({
                ...basePayload,
                lessonId: Number(lessonId),
            })}
            buildAttachPayload={({ questionType, questionIds }) => ({
                lessonId: Number(lessonId),
                questionType,
                questionIds,
            })}
            buildBulkCreatePayload={({ questions }) => ({
                questions,
            })}
            submitNewText="Tạo và gắn câu hỏi"
            submitExistingText="Gắn câu hỏi đã chọn"
            successBulkCreateMessage="Thêm danh sách câu hỏi thành công"
            cancelPath={`/teacher/courses/${courseId}/lessons/${lessonId}`}
            redirectPath={`/teacher/courses/${courseId}/lessons/${lessonId}`}
        />
    );
}

export default TeacherQuestionCreate;