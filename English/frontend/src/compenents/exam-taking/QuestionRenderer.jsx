import MultipleChoiceQuestion from "./question-types/MultipleChoiceQuestion";
import ListeningChoiceQuestion from "./question-types/ListeningChoiceQuestion";
import ListeningFillBlankQuestion from "./question-types/ListeningFillBlankQuestion";
import ArrangeSentenceQuestion from "./question-types/ArrangeSentenceQuestion";
import WritingShortQuestion from "./question-types/WritingShortQuestion";

const QuestionRenderer = ({
  question,
  value,
  onChange,
}) => {

  switch (question.questionType) {

    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "LISTENING_CHOICE":
      return (
        <ListeningChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "LISTENING_FILL_BLANK":
      return (
        <ListeningFillBlankQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "ARRANGE_SENTENCE":
      return (
        <ArrangeSentenceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    case "WRITING_SHORT":
      return (
        <WritingShortQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <div>Không hỗ trợ loại câu hỏi</div>
      );
  }
};

export default QuestionRenderer;