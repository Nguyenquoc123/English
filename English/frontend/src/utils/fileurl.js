const API_BASE_URL = 'http://localhost:8080'

export function getFileUrl(path) {
  if (!path) return ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`
}