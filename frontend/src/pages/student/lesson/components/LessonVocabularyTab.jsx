import { useEffect, useState } from "react";
import { getFileUrl } from "../../../../utils/fileurl";

function LessonVocabularyTab({ API_BASE, lessonId, getToken }) {
    const [vocabularies, setVocabularies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadVocabularies();
    }, [lessonId]);



    const loadVocabularies = async () => {
        try {
            setLoading(true);

            const token = getToken();

            /*
              API gợi ý:
              GET /vocabularies/{lessonId}/lessons
              hoặc GET /tu-vung/{lessonId}/lessons
            */

            const response = await fetch(
                `${API_BASE}/tu-vung/lessons/${lessonId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            const result = data.result || data.data || data || [];

            if (!response.ok) {
                setVocabularies([]);
                return;
            }
            console.log(data)
            setVocabularies(result);
        } catch (err) {
            console.error(err);
            setVocabularies([]);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (audioUrl) => {
        if (!audioUrl) return;

        const audio = new Audio(getFileUrl(audioUrl));
        audio.play();
    };

    if (loading) {
        return (
            <div className="lesson-tab-loading">
                <div className="spinner-border text-primary"></div>
                <p>Đang tải danh sách từ vựng...</p>
            </div>
        );
    }

    if (!vocabularies || vocabularies.length === 0) {
        return (
            <div className="lesson-empty-state">
                <i className="bi bi-card-text"></i>
                <h5>Bài học chưa có từ vựng</h5>
                <p>Hãy chuyển sang video, ngữ pháp hoặc ôn tập để tiếp tục học.</p>
            </div>
        );
    }

    return (
        <div className="vocabulary-tab">
            <div className="tab-section-header">
                <div>
                    <h4>Từ vựng trong bài học</h4>
                    <p>Học từ vựng, phiên âm, nghĩa và câu ví dụ.</p>
                </div>

                <span>{vocabularies.length} từ</span>
            </div>

            <div className="vocabulary-grid">
                {vocabularies.map((vocab) => (
                    <div className="vocabulary-card" key={vocab.vocabularyId}>
                        <div className="vocab-image-box">
                            {vocab.imageUrl ? (
                                <img src={getFileUrl(vocab.imageUrl)} alt={vocab.word} />
                            ) : (
                                <i className="bi bi-card-image"></i>
                            )}
                        </div>

                        <div className="vocab-content">
                            <div className="vocab-word-row">
                                <div>
                                    <h5>{vocab.word}</h5>
                                    <p>{vocab.pronunciation || "Chưa có phiên âm"}</p>
                                </div>

                                {vocab.audioUrl && (
                                    <button
                                        type="button"
                                        className="audio-btn"
                                        onClick={() => playAudio(vocab.audioUrl)}
                                    >
                                        <i className="bi bi-volume-up"></i>
                                    </button>
                                )}
                            </div>

                            <div className="vocab-meaning">
                                <span>Nghĩa</span>
                                <strong>{vocab.meaning}</strong>
                            </div>

                            {vocab.exampleSentence && (
                                <div className="vocab-example">
                                    <span>Ví dụ</span>
                                    <p>{vocab.exampleSentence}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LessonVocabularyTab;