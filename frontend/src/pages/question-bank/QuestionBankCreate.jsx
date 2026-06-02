import QuestionCreateComponent from "../../compenents/question/QuestionCreateComponent";

const API_BASE = "http://localhost:8080";

function QuestionBankCreate() {
    return (
        <QuestionCreateComponent
            title="Tạo câu hỏi vào ngân hàng"
            targetLabel="Câu hỏi sau khi tạo sẽ được lưu vào ngân hàng câu hỏi của bạn."
            allowAttachExisting={false}
            allowExcelImport={true}
            allowAiGenerate={true}
            showExamPoint={false}
            showLevel={true}
            createEndpoint={`${API_BASE}/questions/bank`}
            bulkCreateEndpoint={`${API_BASE}/questions/bank/many`}
            aiGenerateEndpoint={`${API_BASE}/questions/ai-generate`}
            buildCreatePayload={({ basePayload, levelId }) => ({
                ...basePayload,
                levelId,
            })}
            buildBulkCreatePayload={({ questionType, questions }) => ({
                questionType,
                questions,
            })}
            submitNewText="Lưu vào ngân hàng câu hỏi"
            successBulkCreateMessage="Nhập câu hỏi vào ngân hàng thành công"
            cancelPath="/teacher/questions-bank"
            redirectPath="/teacher/questions-bank"
        />
    );
}

export default QuestionBankCreate;