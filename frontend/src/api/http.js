/** HTTP helpers — luôn dùng UTF-8 cho JSON / multipart */
export const API_BASE = "http://localhost:8080";

export function jsonUtf8Blob(data) {
  return new Blob([JSON.stringify(data)], {
    type: "application/json;charset=UTF-8",
  });
}

export function getAuthHeaders(extra = {}) {
  const token =
    localStorage.getItem("token") || localStorage.getItem("english_token");
  return {
    Accept: "application/json;charset=UTF-8",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    headers: getAuthHeaders(options.headers),
  });
}

export function appendJsonPart(formData, fieldName, data) {
  formData.append(fieldName, jsonUtf8Blob(data));
}
