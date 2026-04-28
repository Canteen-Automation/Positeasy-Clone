/**
 * Authenticated fetch wrapper for the admin frontend.
 * Automatically attaches the JWT from localStorage to every request.
 */
export function getAuthToken(): string | null {
  const user = localStorage.getItem('systemUser');
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Authenticated fetch. Redirects to /login on 401/403.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid — redirect to login
    localStorage.removeItem('systemUser');
    sessionStorage.clear();
    window.location.href = '/';
  }

  return response;
}
