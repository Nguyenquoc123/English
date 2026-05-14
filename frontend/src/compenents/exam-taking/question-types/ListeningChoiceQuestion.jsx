const ListeningChoiceQuestion = ({
    question,
    value,
    onChange,
}) => {

    return (
        <div className="question-card">

            <div className="question-content">
                {question.content}
            </div>

            <audio
                controls
                src={question.mediaUrl}
                className="question-audio"
            />

            <div className="question-options">

                {question.options?.map((option) => (

                    <label
                        key={option.optionId}
                        className={`question-option ${value === option.optionText
                                ? "active"
                                : ""
                            }`}
                    >

                        <input
                            type="radio"
                            checked={
                                String(value) ===
                                String(option.optionId)
                            }
                            onChange={() =>
                                onChange(
                                    String(option.optionId)
                                )
                            }
                        />

                        <span>
                            {option.optionText}
                        </span>

                    </label>

                ))}

            </div>

        </div>
    );
};

export default ListeningChoiceQuestion;