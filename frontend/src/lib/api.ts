/** Single API client. Components must not call fetch themselves. */

import { getAccessToken } from "@/lib/supabase";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Could not reach the UniHive API. Make sure the backend is running on port 8000.",
    );
  }
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as { error?: { code?: string; message?: string } } | null;
    throw new ApiError(
      response.status,
      error?.error?.code ?? "HTTP_ERROR",
      error?.error?.message ?? "Request failed",
    );
  }
  return payload as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
};

export type FaqListResponse = {
  items: FaqItem[];
  page: number;
  page_size: number;
  total: number;
  categories: string[];
};

export function listFaqs(params?: {
  category?: string;
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<FaqListResponse> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const query = search.toString();
  return apiGet<FaqListResponse>(`/api/info/faqs${query ? `?${query}` : ""}`);
}
