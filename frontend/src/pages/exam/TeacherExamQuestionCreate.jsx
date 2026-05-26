import { useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherExams, teacherExamDetail } from "../../utils/breadcrumbPaths";
import QuestionCreateComponent from "../../compenents/question/QuestionCreateComponent";

const API_BASE = "http://localhost:8080";

function TeacherExamQuestionCreate() {
    const { examId } = useParams();

    return (
        // <QuestionCreateComponent
        //     title="Thêm câu hỏi vào kỳ thi"
        //     targetLabel="Tạo câu hỏi mới hoặc chọn từ ngân hàng để thêm vào kỳ thi."
        //     breadcrumb={
        //         <CourseBreadcrumb
        //             items={[
        //                 teacherExams,
        //                 teacherExamDetail(examId),
        //                 { label: "Thêm câu hỏi" },
        //             ]}
        //         />
        //     }
        //     allowAttachExisting={true}
        //     showExamPoint={true}
        //     createEndpoint={`${API_BASE}/exam-questions/exams/${examId}`}
        //     attachEndpoint={`${API_BASE}/exam-questions/exams/${examId}/attach`}
        //     buildCreatePayload={({ basePayload, examPoint }) => ({
        //         ...basePayload,
        //         examId: Number(examId),
        //         point: Number(examPoint),
        //     })}
        //     buildAttachPayload={({ questionType, questionIds, examPoint }) => ({
        //         examId: Number(examId),
        //         questionType,
        //         questionIds,
        //         point: Number(examPoint),
        //     })}
        //     submitNewText="Tạo và thêm vào kỳ thi"
        //     submitExistingText="Thêm câu hỏi đã chọn vào kỳ thi"
        //     successCreateMessage="Thêm câu hỏi vào kỳ thi thành công"
        //     successAttachMessage="Gắn câu hỏi vào kỳ thi thành công"
        //     cancelPath={`/teacher/exams/${examId}`}
        //     redirectPath={`/teacher/exams/${examId}`}
        // />

        <QuestionCreateComponent
            title="Thêm câu hỏi vào kỳ thi"
            targetLabel="Tạo câu hỏi mới hoặc chọn từ ngân hàng để thêm vào kỳ thi."
            allowAttachExisting={true}
            showExamPoint={true}
            createEndpoint={`${API_BASE}/exam-questions/exams/${examId}`}
            attachEndpoint={`${API_BASE}/exam-questions/exams/${examId}/attach`}
            bulkCreateEndpoint={`${API_BASE}/exam-questions/exams/${examId}/bulk`}
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
            buildBulkCreatePayload={({ questionType, questions, examPoint }) => ({
                examId: Number(examId),
                questionType,
                point: Number(examPoint),
                questions,
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