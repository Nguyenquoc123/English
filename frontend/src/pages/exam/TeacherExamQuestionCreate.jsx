import { useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherExams, teacherExamDetail } from "../../utils/breadcrumbPaths";
import QuestionCreateComponent from "../../compenents/question/QuestionCreateComponent";

const API_BASE = "http://localhost:8080";

function TeacherExamQuestionCreate() {
    const { examId } = useParams();

    return (

        <QuestionCreateComponent
            title="Thêm câu hỏi vào kỳ thi"
            targetLabel="Tạo câu hỏi mới hoặc chọn từ ngân hàng để thêm vào kỳ thi."
            allowAttachExisting={true}
            showExamPoint={true}
            createEndpoint={`${API_BASE}/exam-questions/exams/${examId}`}
            attachEndpoint={`${API_BASE}/exam-questions/exams/${examId}/attach`}
            bulkCreateEndpoint={`${API_BASE}/exam-questions/exams/${examId}/many`}
            buildCreatePayload={({ basePayload, examPoint }) => ({
                ...basePayload,
                examId: Number(examId),
                point: Number(examPoint),
            })}
            buildAttachPayload={({ questionType, questionIds, examPoint }) => ({
                examId: Number(examId),
                questionType,
                questionIds,
                point: Number(examPoint),
            })}
            buildBulkCreatePayload={({ questions, examPoint }) => ({
                questions: questions.map((question) => ({
                    ...question,
                    examId: Number(examId),
                    point: question.defaultPoint,
                })),
            })}
            submitNewText="Tạo và thêm vào kỳ thi"
            submitExistingText="Thêm câu hỏi đã chọn vào kỳ thi"
            successBulkCreateMessage="Nhập câu hỏi vào kỳ thi thành công"
            cancelPath={`/teacher/exams/${examId}`}
            redirectPath={`/teacher/exams/${examId}`}
        />
    );
}

export default TeacherExamQuestionCreate;