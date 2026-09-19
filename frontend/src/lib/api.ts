/** Single API client. Components must not call fetch themselves. */

import { getAccessToken } from "@/lib/supabase";
import { PAGE_SIZE } from "@/lib/constants";
import type {
  FaqRead,
  InfoPageRead,
  ListingCreatePayload,
  ListingInterestListResponse,
  ListingInterestRead,
  ListingListResponse,
  ListingRead,
  PostCreatePayload,
  PostListResponse,
  PostRead,
  PostWritePayload,
  RequestCreatePayload,
  RequestListResponse,
  RequestRead,
  RequestUpdatePayload,
  SearchResponse,
  StaffContactRead,
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
  return Promise.all([
    fetchPosts({ type: "EMERGENCY", page: 1, page_size: 1 }),
    fetchPosts({ type: "SCHEDULE_CHANGE", page: 1, page_size: 1 }),
  ]).then(([emergency, schedule]) => {
    const candidates = [...emergency.items, ...schedule.items];
    if (candidates.length === 0) {
      return null;
    }
    return candidates.sort(
      (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
    )[0];
  });
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

export function fetchRequests(params?: {
  page?: number;
  page_size?: number;
  type?: string;
  status?: string;
}): Promise<RequestListResponse> {
  return apiGet<RequestListResponse>(`/api/requests${toQuery({ page_size: PAGE_SIZE, ...params })}`);
}

export function createRequest(body: RequestCreatePayload): Promise<RequestRead> {
  return apiPost<RequestRead>("/api/requests", body);
}

export function updateRequest(id: string, body: RequestUpdatePayload): Promise<RequestRead> {
  return apiPatch<RequestRead>(`/api/requests/${id}`, body);
}

export function fetchListings(params?: {
  page?: number;
  page_size?: number;
  type?: string;
  status?: string;
  q?: string;
}): Promise<ListingListResponse> {
  return apiGet<ListingListResponse>(`/api/listings${toQuery({ page_size: PAGE_SIZE, ...params })}`);
}

export function fetchListing(id: string): Promise<ListingRead> {
  return apiGet<ListingRead>(`/api/listings/${id}`);
}

export function createListing(body: ListingCreatePayload): Promise<ListingRead> {
  return apiPost<ListingRead>("/api/listings", body);
}

export function updateListing(id: string, body: { status: "RESOLVED" | "REMOVED" }): Promise<ListingRead> {
  return apiPatch<ListingRead>(`/api/listings/${id}`, body);
}

export function contactListing(id: string): Promise<ListingInterestRead> {
  return request<ListingInterestRead>(`/api/listings/${id}/interest`, { method: "POST" });
}

export function fetchListingInterests(id: string): Promise<ListingInterestListResponse> {
  return apiGet<ListingInterestListResponse>(`/api/listings/${id}/interests`);
}

export function fetchInfoPages(category?: string): Promise<{ items: InfoPageRead[] }> {
  return apiGet<{ items: InfoPageRead[] }>(`/api/info/pages${toQuery({ category })}`);
}

export function fetchFaqs(category?: string): Promise<{ items: FaqRead[] }> {
  return apiGet<{ items: FaqRead[] }>(`/api/info/faqs${toQuery({ category })}`);
}

export function fetchStaffContacts(): Promise<{ items: StaffContactRead[] }> {
  return apiGet<{ items: StaffContactRead[] }>("/api/info/contacts");
}
