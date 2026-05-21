import { useEffect, useState } from "react";

function useCourseLessons({
  courseId,
  endpointBuilder,
}) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [allLessons, setAllLessons] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildQueryString = (filter) => {
    const params = new URLSearchParams();

    if (filter.keyword && filter.keyword.trim() !== "") {
      params.append("keyword", filter.keyword.trim());
    }

    if (filter.status && filter.status.trim() !== "") {
      params.append("status", filter.status);
    }

    return params.toString();
  };

  const loadLessons = async (filter = {}) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const queryString = buildQueryString(filter);

      const url = endpointBuilder(courseId, queryString);

      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách bài học");
        return;
      }

      const result = data.result || data.data || data;

      setCourse({
        courseId: result.courseId,
        title: result.courseTitle,
      });

      setLessons(result.lessons || []);
      setAllLessons(result.lessons || []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const handleSearch = (e) => {
    e.preventDefault();

    loadLessons({
      keyword,
      status,
    });
  };

  const handleResetFilter = () => {
    setKeyword("");
    setStatus("");
    loadLessons();
  };

  return {
    keyword,
    setKeyword,
    status,
    setStatus,
    course,
    lessons,
    setLessons,
    allLessons,
    setAllLessons,
    loading,
    error,
    loadLessons,
    handleSearch,
    handleResetFilter,
  };
}

export default useCourseLessons;