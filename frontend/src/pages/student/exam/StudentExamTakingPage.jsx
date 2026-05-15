import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./StudentExamTakingPage.css";

import QuestionRenderer from "../../../compenents/exam-taking/QuestionRenderer";

const API_BASE = "http://localhost:8080";

const StudentExamTakingPage = () => {

    const { examId } = useParams();

    const navigate = useNavigate();

    const questionRefs = useRef({});

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [exam, setExam] = useState(null);

    const [questions, setQuestions] = useState([]);

    /*
      answers:
      {
        1: {
          questionId: 1,
          selectedOptionId: 5,
          answerText: null
        }
      }
    */
    const [answers, setAnswers] = useState({});

    const [remainingSeconds, setRemainingSeconds] =
        useState(0);

    useEffect(() => {
        loadExam();
    }, [examId]);

    /*
      Countdown
    */
    useEffect(() => {

        if (
            loading ||
            remainingSeconds <= 0
        ) {
            return;
        }

        const interval = setInterval(() => {

            setRemainingSeconds((prev) => {

                if (prev <= 1) {

                    clearInterval(interval);

                    autoSubmitExam();

                    return 0;
                }

                return prev - 1;
            });

        }, 1000);

        return () => clearInterval(interval);

    }, [remainingSeconds, loading]);

    /*
      Auto save local
    */
    useEffect(() => {

        if (!examId) {
            return;
        }

        localStorage.setItem(
            `exam_answers_${examId}`,
            JSON.stringify(answers)
        );

    }, [answers, examId]);

    const getToken = () => {
        return (
            localStorage.getItem("english_token") ||
            localStorage.getItem("token")
        );
    };

    const loadExam = async () => {

        try {

            setLoading(true);

            const token = getToken();

            const response = await fetch(
                `${API_BASE}/exam-questions/${examId}/ds`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result =
                data?.result ||
                data?.data ||
                data;

            if (!response.ok) {

                alert(
                    result?.message ||
                    "Không thể tải bài thi"
                );

                return;
            }

            setExam(result);

            setQuestions(result.questions || []);

            /*
              Time
            */
            const seconds =
                (result.durationMinutes || 0) * 60;

            setRemainingSeconds(seconds);

            /*
              Restore local answers
            */
            const savedAnswers =
                localStorage.getItem(
                    `exam_answers_${examId}`
                );

            if (savedAnswers) {

                setAnswers(
                    JSON.parse(savedAnswers)
                );
            }

        } catch (error) {

            console.error(error);

            alert("Lỗi tải bài thi");

        } finally {

            setLoading(false);
        }
    };

    /*
      Handle answer
    */
    const handleAnswerChange = (
        question,
        value
    ) => {

        let answerData = {
            questionId: question.questionId,
            selectedOptionId: null,
            answerText: null,
        };

        switch (question.questionType) {

            /*
              Trắc nghiệm
            */
            case "MULTIPLE_CHOICE":

            case "LISTENING_CHOICE":

                answerData.selectedOptionId =
                    value
                        ? Number(value)
                        : null;

                break;

            /*
              Điền
            */
            case "LISTENING_FILL_BLANK":

            case "WRITING_SHORT":

                answerData.answerText =
                    value || "";

                break;

            /*
              Sắp xếp
            */
            case "ARRANGE_SENTENCE":

                answerData.answerText =
                    Array.isArray(value)
                        ? value.join(" ")
                        : value || "";

                break;

            default:

                answerData.answerText =
                    value || "";
        }

        setAnswers((prev) => ({
            ...prev,

            [question.questionId]:
                answerData,
        }));
    };

    /*
      Count answered
    */
    const answeredCount = useMemo(() => {

        return questions.filter((q) => {

            const answer =
                answers[q.questionId];

            if (!answer) {
                return false;
            }

            if (
                answer.selectedOptionId
            ) {
                return true;
            }

            if (
                answer.answerText &&
                answer.answerText.trim() !== ""
            ) {
                return true;
            }

            return false;

        }).length;

    }, [answers, questions]);

    const progressPercent = useMemo(() => {

        if (!questions.length) {
            return 0;
        }

        return Math.round(
            (answeredCount / questions.length) * 100
        );

    }, [answeredCount, questions]);

    /*
      Time format
    */
    const formatTime = (seconds) => {

        const h =
            Math.floor(seconds / 3600);

        const m =
            Math.floor(
                (seconds % 3600) / 60
            );

        const s = seconds % 60;

        return [
            String(h).padStart(2, "0"),
            String(m).padStart(2, "0"),
            String(s).padStart(2, "0"),
        ].join(":");
    };

    /*
      Scroll
    */
    const scrollToQuestion = (
        questionId
    ) => {

        const element =
            questionRefs.current[
            questionId
            ];

        if (element) {

            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    /*
      Build payload
    */
    const buildSubmitPayload = () => {

        return {

            examId: Number(examId),

            answers: questions.map(
                (question) => {

                    const answer =
                        answers[
                        question.questionId
                        ];

                    if (!answer) {

                        return {
                            questionId:
                                question.questionId,

                            selectedOptionId:
                                null,

                            answerText: null,
                        };
                    }

                    return {

                        questionId:
                            question.questionId,

                        selectedOptionId:
                            answer.selectedOptionId,

                        answerText:
                            answer.answerText,
                    };
                }
            ),
        };
    };

    /*
      Submit
    */
    const submitExam = async () => {

        if (submitting) {
            return;
        }

        const unanswered =
            questions.length -
            answeredCount;

        if (unanswered > 0) {

            const ok = window.confirm(
                `Bạn còn ${unanswered} câu chưa trả lời. Bạn vẫn muốn nộp bài?`
            );

            if (!ok) {
                return;
            }
        }

        await doSubmit();
    };

    /*
      Auto submit
    */
    const autoSubmitExam =
        async () => {

            if (submitting) {
                return;
            }

            alert(
                "Hết thời gian làm bài. Hệ thống tự nộp."
            );

            await doSubmit();
        };

    /*
      Submit API
    */
    const doSubmit = async () => {

        try {

            setSubmitting(true);

            const token = getToken();

            const payload =
                buildSubmitPayload();

            const response =
                await fetch(
                    `${API_BASE}/exam-questions/exam-submit`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify(
                            payload
                        ),
                    }
                );

            let data = null;

            try {
                data =
                    await response.json();
            } catch {
                data = null;
            }

            const result =
                data?.result ||
                data?.data ||
                data;

            if (!response.ok) {

                alert(
                    result?.message ||
                    "Nộp bài thất bại"
                );

                return;
            }

            console.log(result)
            /*
              Clear local
            */
            localStorage.removeItem(
                `exam_answers_${examId}`
            );

            /*
              Go result
            */
            navigate(
                `/student-exams/result/${result.attemptId}`
            );

        } catch (error) {

            console.error(error);

            alert("Lỗi nộp bài");

        } finally {

            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="student-exam-loading">
                Đang tải bài thi...
            </div>
        );
    }

    return (


        <div className="student-exam-taking-page">

            <div className="student-exam-layout">

                <div className="student-exam-left">

                    <div className="student-exam-header-card">

                        <div className="student-exam-header-top">
                            <button
                                className="student-exam-back-btn"
                                onClick={() => navigate(-1)}
                            >
                                ← Quay lại
                            </button>
                        </div>

                        <h1 className="student-exam-title">
                            {exam?.title}
                        </h1>



                        <div className="student-exam-meta">

                            <div className="student-exam-meta-item">
                                ⏱ {exam?.durationMinutes} phút
                            </div>

                            <div className="student-exam-meta-item">
                                ❓ {questions.length} câu
                            </div>

                            <div className="student-exam-meta-item">
                                ⭐ {exam?.totalPoint} điểm
                            </div>

                        </div>

                    </div>

                    <div className="student-exam-questions">

                        {questions.map((question, index) => (
                            <div
                                key={question.questionId}
                                ref={(el) =>
                                (questionRefs.current[
                                    question.questionId
                                ] = el)
                                }
                                className="student-exam-question-wrapper"
                            >

                                <div className="student-exam-question-index">
                                    Câu {index + 1}
                                </div>

                                <QuestionRenderer
                                    question={question}

                                    value={
                                        answers[question.questionId]
                                            ?.selectedOptionId ||

                                        answers[question.questionId]
                                            ?.answerText ||

                                        ""
                                    }

                                    onChange={(value) =>
                                        handleAnswerChange(
                                            question,
                                            value
                                        )
                                    }
                                />

                            </div>
                        ))}

                    </div>

                </div>

                <div className="student-exam-right">

                    <div className="student-exam-sidebar-card">

                        <div className="student-exam-timer-label">
                            Thời gian còn lại
                        </div>

                        <div className="student-exam-timer">
                            {formatTime(remainingSeconds)}
                        </div>

                    </div>

                    <div className="student-exam-sidebar-card">

                        <div className="student-exam-progress-top">

                            <span>Tiến độ bài thi</span>

                            <span>
                                {progressPercent}%
                            </span>

                        </div>

                        <div className="student-exam-progress-bar">
                            <div
                                className="student-exam-progress-fill"
                                style={{
                                    width: `${progressPercent}%`,
                                }}
                            />
                        </div>

                        <div className="student-exam-progress-text">
                            Đã trả lời {answeredCount}/
                            {questions.length} câu
                        </div>

                    </div>

                    <div className="student-exam-sidebar-card">

                        <div className="student-exam-nav-title">
                            Danh sách câu hỏi
                        </div>

                        <div className="student-exam-nav-grid">

                            {questions.map((question, index) => {

                                const answered =
                                    !!answers[question.questionId];

                                return (
                                    <button
                                        key={question.questionId}
                                        className={`student-exam-nav-btn ${answered
                                            ? "answered"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            scrollToQuestion(
                                                question.questionId
                                            )
                                        }
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}

                        </div>

                    </div>

                    <div className="student-exam-sidebar-card">

                        <button
                            className="student-exam-submit-btn"
                            onClick={submitExam}
                            disabled={submitting}
                        >
                            {submitting
                                ? "Đang nộp bài..."
                                : "Nộp bài"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default StudentExamTakingPage;