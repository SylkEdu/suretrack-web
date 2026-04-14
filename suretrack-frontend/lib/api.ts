export const API_URL = "https://suretrack-api.vercel.app";

export async function apiFetch(path: string, token: string, options = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.json());
}
