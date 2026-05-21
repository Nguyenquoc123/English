function LessonTable({
  lessons,
  loading,
  error,
  getStatusBadge,
  renderActions,
}) {
  const getTypeBadge = (type) => {
    if (type === "EXAM") {
      return "badge text-bg-warning";
    }

    return "badge text-bg-primary";
  };

  const getTypeText = (type) => {
    if (type === "EXAM") {
      return "Bài thi";
    }

    return "Bài học";
  };

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  return (
    <div className="card border-0 shadow-sm lesson-table-card">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 lesson-table">
          <thead className="table-light">
            <tr>
              <th style={{ width: "90px" }}>Thứ tự</th>
              <th>Nội dung</th>
              <th style={{ width: "120px" }}>Loại</th>
              <th style={{ width: "130px" }}>Trạng thái</th>
              <th style={{ width: "180px" }}>Ngày tạo</th>
              <th className="text-end" style={{ width: "140px" }}>
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  Đang tải danh sách nội dung...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="6" className="text-center text-danger py-4">
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              lessons.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td>
                    <span className="lesson-order">{item.itemOrder}</span>
                  </td>

                  <td>
                    <div className="lesson-title-cell">
                      <strong>{item.title}</strong>
                      <span>{item.description || "Chưa có mô tả"}</span>
                    </div>
                  </td>

                  <td>
                    <span className={getTypeBadge(item.type)}>
                      {getTypeText(item.type)}
                    </span>
                  </td>

                  <td>
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <span className="text-muted small">
                      {formatDate(item.createdAt)}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {renderActions && renderActions(item)}
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && !error && lessons.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  Không tìm thấy nội dung phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LessonTable;