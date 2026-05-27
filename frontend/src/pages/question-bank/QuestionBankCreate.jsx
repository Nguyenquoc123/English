import QuestionCreateReusablePage from "./QuestionCreateReusablePage";

const API_BASE = "http://localhost:8080";

function QuestionBankCreate() {
    return (
        <QuestionCreateComponent
            title="Tạo câu hỏi vào ngân hàng"
            targetLabel="Câu hỏi sau khi tạo sẽ được lưu vào ngân hàng câu hỏi của bạn."
            allowAttachExisting={false}
            showExamPoint={false}
            createEndpoint={`${API_BASE}/questions/my-bank`}
            bulkCreateEndpoint={`${API_BASE}/questions/my-bank/bulk`}
            buildCreatePayload={({ basePayload }) => ({
                ...basePayload,
            })}
            buildBulkCreatePayload={({ questionType, questions }) => ({
                questionType,
                questions,
            })}
            submitNewText="Lưu vào ngân hàng câu hỏi"
            successBulkCreateMessage="Nhập câu hỏi vào ngân hàng thành công"
            cancelPath="/teacher/questions"
            redirectPath="/teacher/questions"
        />
    );
}

export default QuestionBankCreate;