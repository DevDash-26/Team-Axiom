/** API types mirroring backend response schemas. */

export type UserPublic = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  faculty: string | null;
  year: number | null;
  programme: string | null;
  society_id: string | null;
  is_active: boolean;
};

export type AuthorPublic = {
  id: string;
  full_name: string;
  role: string;
};

export type PostTypeName =
  | "ANNOUNCEMENT"
  | "EVENT"
  | "GUEST_LECTURE"
  | "EMERGENCY"
  | "SCHEDULE_CHANGE"
  | "CALENDAR_ENTRY"
  | "JOB"
  | "VOLUNTEERING"
  | "ALUMNI"
  | "HIGHLIGHT"
  | "SOCIETY_UPDATE";

export type PostStatusName = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type PostRead = {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  pinned: boolean;
  faculty: string | null;
  year: number | null;
  programme: string | null;
  starts_at: string | null;
  expires_at: string | null;
  location: string | null;
  event_at: string | null;
  deadline_at: string | null;
  apply_url: string | null;
  society_id: string | null;
    created_at: string;
    updated_at?: string;
    author: AuthorPublic;
};

export type PostListResponse = {
  items: PostRead[];
  page: number;
  page_size: number;
  total: number;
};

export type PostWritePayload = {
  type?: PostTypeName;
  title?: string;
  body?: string;
  status?: PostStatusName;
  pinned?: boolean;
  faculty?: string | null;
  year?: number | null;
  programme?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
};

export type PostCreatePayload = PostWritePayload & {
  type: PostTypeName;
  title: string;
  body: string;
};

export type SearchHit = {
  id: string;
  type: string;
  title: string;
  snippet: string;
  href: string;
};

export type SearchResponse = {
  items: SearchHit[];
  page: number;
  page_size: number;
  total: number;
  query: string;
};
