import { useEffect, useState } from "react";

function LessonGrammarTab({ API_BASE, lessonId, getToken }) {
  const [grammars, setGrammars] = useState([]);
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrammars();
  }, [lessonId]);

  const loadGrammars = async () => {
    try {
      setLoading(true);

      const token = getToken();

      /*
        API gợi ý:
        GET /grammars/{lessonId}/grammars
      */

      const response = await fetch(`${API_BASE}/grammar/${lessonId}/grammars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const result = data.result || data.data || data || [];

      if (!response.ok) {
        setGrammars([]);
        return;
      }

      setGrammars(result);

      if (result.length > 0) {
        setSelectedGrammar(result[0]);
      }
    } catch (err) {
      console.error(err);
      setGrammars([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lesson-tab-loading">
        <div className="spinner-border text-primary"></div>
        <p>Đang tải nội dung ngữ pháp...</p>
      </div>
    );
  }

  if (!grammars || grammars.length === 0) {
    return (
      <div className="lesson-empty-state">
        <i className="bi bi-pencil-square"></i>
        <h5>Bài học chưa có ngữ pháp</h5>
        <p>Bạn có thể học video, từ vựng hoặc chuyển sang ôn tập.</p>
      </div>
    );
  }

  return (
    <div className="grammar-tab-layout">
      <div className="grammar-list-panel">
        <h5>Danh sách ngữ pháp</h5>

        {grammars.map((grammar, index) => (
          <button
            key={grammar.grammarId}
            type="button"
            className={
              selectedGrammar?.grammarId === grammar.grammarId
                ? "grammar-item active"
                : "grammar-item"
            }
            onClick={() => setSelectedGrammar(grammar)}
          >
            <span>{index + 1}</span>
            <strong>{grammar.title}</strong>
          </button>
        ))}
      </div>

      <div className="grammar-content-panel">
        <div className="grammar-content-header">
          <span>Ngữ pháp</span>
          <h4>{selectedGrammar?.title}</h4>
        </div>

        <div
          className="grammar-html-content"
          dangerouslySetInnerHTML={{
            __html: selectedGrammar?.contentHtml || "",
          }}
        ></div>
      </div>
    </div>
  );
}

export default LessonGrammarTab;