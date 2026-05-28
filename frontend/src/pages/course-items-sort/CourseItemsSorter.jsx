import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

async function requestJson(url, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default function CourseItemsSorter() {
  const { courseId } = useParams();

  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);

  const [dragIndex, setDragIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasChanged = useMemo(() => {
    if (items.length !== originalItems.length) return true;

    return items.some((item, index) => {
      return item.courseItemId !== originalItems[index]?.courseItemId;
    });
  }, [items, originalItems]);

  useEffect(() => {
    if (!courseId) {
      setError('Không tìm thấy courseId trên URL.');
      return;
    }

    fetchCourseItems();
  }, [courseId]);

  async function fetchCourseItems() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = await requestJson(
        `${API_BASE_URL}/lesson/${courseId}/teacher`
      );

      const list = Array.isArray(data) ? data : [];

      const sortedItems = [...list].sort((a, b) => {
        return Number(a.itemOrder || 0) - Number(b.itemOrder || 0);
      });

      setItems(sortedItems);
      setOriginalItems(sortedItems);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách bài học/bài thi.');
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(dropIndex) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[dragIndex];

    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setDragIndex(null);
    setSuccess('');
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function handleSaveOrder() {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        items: items.map((item, index) => ({
          courseItemId: item.courseItemId,
          itemOrder: index + 1,
        })),
      };

      await requestJson(
        `${API_BASE_URL}/lesson/${courseId}/teacher/reorder`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      const normalizedItems = items.map((item, index) => ({
        ...item,
        itemOrder: index + 1,
      }));

      setItems(normalizedItems);
      setOriginalItems(normalizedItems);
      setSuccess('Đã lưu thứ tự mới thành công.');
    } catch (err) {
      console.error(err);
      setError('Lưu thứ tự thất bại.');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setItems(originalItems);
    setSuccess('');
    setError('');
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-0">Sắp xếp lộ trình khóa học</h5>
                <div className="small text-muted">
                  Kéo thả để đổi thứ tự bài học và bài thi.
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={!hasChanged || saving}
                  onClick={handleReset}
                >
                  Hoàn tác
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!hasChanged || saving}
                  onClick={handleSaveOrder}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thứ tự'}
                </button>
              </div>
            </div>

            <div className="card-body">
              {loading && (
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm" />
                  <span>Đang tải danh sách...</span>
                </div>
              )}

              {!loading && error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {!loading && success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="alert alert-info mb-0">
                  Khóa học này chưa có bài học hoặc bài thi nào.
                </div>
              )}

              {!loading && !error && items.length > 0 && (
                <div className="list-group">
                  {items.map((item, index) => {
                    const isLesson = item.type === 'LESSON';

                    return (
                      <div
                        key={item.courseItemId}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        className={
                          'list-group-item d-flex align-items-center justify-content-between gap-3 py-3 ' +
                          (dragIndex === index ? 'opacity-50' : '')
                        }
                        style={{ cursor: 'move' }}
                      >
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <button
                            type="button"
                            className="btn btn-light border"
                            style={{ cursor: 'move' }}
                          >
                            ☰
                          </button>

                          <div
                            className="text-muted fw-semibold"
                            style={{ width: 40 }}
                          >
                            #{index + 1}
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className={
                                  isLesson
                                    ? 'badge bg-primary'
                                    : 'badge bg-warning text-dark'
                                }
                              >
                                {isLesson ? 'LESSON' : 'EXAM'}
                              </span>

                              <span className="fw-semibold">
                                {item.title}
                              </span>
                            </div>

                            <div className="small text-muted mt-1">
                              courseItemId: {item.courseItemId}
                              {' · '}
                              {isLesson ? 'lessonId' : 'examId'}: {item.id}
                              {' · '}
                              status: {item.status}
                            </div>
                          </div>
                        </div>

                        <span className="badge bg-secondary">
                          order: {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}