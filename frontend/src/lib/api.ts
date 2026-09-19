/** Single API client. Components must not call fetch themselves. */

import { getAccessToken } from "@/lib/supabase";
import { PAGE_SIZE } from "@/lib/constants";
import type {
  PostCreatePayload,
  PostListResponse,
  PostRead,
  PostWritePayload,
  SearchResponse,
} from "@/types";

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

export function toQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
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

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
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

export type AssistantSource = {
  type: string;
  id: string;
  title: string;
  snippet: string;
  url: string;
};

export type AssistantAction = {
  label: string;
  href: string;
};

export type AssistantChatResponse = {
  answer: string;
  sources: AssistantSource[];
  actions: AssistantAction[];
  intent: string;
  language: string;
  fallback: boolean;
  escalated: boolean;
  query_id: string | null;
};

export function assistantChat(body: {
  question: string;
  session_id?: string;
  language_pref?: string;
}): Promise<AssistantChatResponse> {
  return apiPost<AssistantChatResponse>("/api/assistant/chat", body);
}

export function assistantFeedback(body: {
  query_id: string;
  rating: -1 | 1;
}): Promise<{ status: string }> {
  return apiPost<{ status: string }>("/api/assistant/feedback", body);
}

export function fetchPosts(params?: {
  page?: number;
  page_size?: number;
  type?: string;
}): Promise<PostListResponse> {
  return apiGet<PostListResponse>(`/api/posts${toQuery({ page_size: PAGE_SIZE, ...params })}`);
}

export function fetchMyPosts(params?: {
  page?: number;
  page_size?: number;
  type?: string;
  status?: string;
  q?: string;
}): Promise<PostListResponse> {
  return apiGet<PostListResponse>(`/api/posts/mine${toQuery({ page_size: PAGE_SIZE, ...params })}`);
}

export function fetchPost(id: string): Promise<PostRead> {
  return apiGet<PostRead>(`/api/posts/${id}`);
}

export function fetchEmergencyBanner(): Promise<PostRead | null> {
  return fetchPosts({ type: "EMERGENCY", page: 1, page_size: 1 }).then((feed) => feed.items[0] ?? null);
}

export function fetchSearch(params: {
  q: string;
  type?: string;
  page?: number;
  page_size?: number;
}): Promise<SearchResponse> {
  return apiGet<SearchResponse>(`/api/search${toQuery({ page_size: PAGE_SIZE, ...params })}`);
}

export function createPost(body: PostCreatePayload): Promise<PostRead> {
  return apiPost<PostRead>("/api/posts", body);
}

export function updatePost(id: string, body: PostWritePayload): Promise<PostRead> {
  return apiPatch<PostRead>(`/api/posts/${id}`, body);
}

export function archivePost(id: string): Promise<PostRead> {
  return updatePost(id, { status: "ARCHIVED" });
}

export function publishPost(id: string): Promise<PostRead> {
  return updatePost(id, { status: "PUBLISHED" });
}
