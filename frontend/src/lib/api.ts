const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Normalize backslashes from Windows paths
  let clean = path.replace(/\\/g, "/");
  if (clean.includes("/uploads/")) {
    clean = clean.substring(clean.lastIndexOf("/uploads/"));
  } else if (clean.includes("/")) {
    clean = "/uploads/" + clean.substring(clean.lastIndexOf("/") + 1);
  } else {
    clean = "/uploads/" + clean;
  }

  return `${BACKEND_BASE}${clean}`;
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = typeof window !== "undefined" 
    ? (sessionStorage.getItem("fdr_auth_token") || localStorage.getItem("fdr_auth_token")) 
    : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}
