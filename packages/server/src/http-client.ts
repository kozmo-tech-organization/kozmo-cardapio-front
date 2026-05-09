const API_URL = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001'
  : 'http://localhost:3001'

export function getApiUrl() {
  return API_URL
}

export function getRpcUrl() {
  return `${API_URL}/rpc`
}

export function getAuthHeaders(token?: string | null): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
