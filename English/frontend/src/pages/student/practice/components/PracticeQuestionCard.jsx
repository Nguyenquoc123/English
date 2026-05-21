import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import ListeningChoiceQuestion from "./ListeningChoiceQuestion";
import ListeningFillBlankQuestion from "./ListeningFillBlankQuestion";
import ArrangeSentenceQuestion from "./ArrangeSentenceQuestion";
import WritingShortQuestion from "./WritingShortQuestion";

function PracticeQuestionCard({
  API_BASE,
  question,
  index,
  value,
  onChange,
}) {
  const renderQuestionBody = () => {
    if (question.questionType === "MULTIPLE_CHOICE") {
      return (
        <MultipleChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    }

    if (question.questionType === "LISTENING_CHOICE") {
      return (
        <ListeningChoiceQuestion
          API_BASE={API_BASE}
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    }

    if (question.questionType === "LISTENING_FILL_BLANK") {
      return (
        <ListeningFillBlankQuestion
          API_BASE={API_BASE}
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    }

    if (question.questionType === "ARRANGE_SENTENCE") {
      return (
        <ArrangeSentenceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    }

    if (question.questionType === "WRITING_SHORT") {
      return (
        <WritingShortQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    }

    return (
      <div className="alert alert-warning mb-0">
        Dạng câu hỏi chưa được hỗ trợ: {question.questionType}
      </div>
    );
  };

  return (
    <div className="practice-question-card" id={`question-${question.questionId}`}>
      <div className="question-card-header">
        <span>Câu {index + 1}</span>
        <strong>{question.questionType}</strong>
      </div>

      {renderQuestionBody()}
    </div>
  );
}

export default PracticeQuestionCard;