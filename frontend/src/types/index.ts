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
  author: AuthorPublic;
};

export type PostListResponse = {
  items: PostRead[];
  page: number;
  page_size: number;
  total: number;
};

export type PostCreatePayload = {
  type: "ANNOUNCEMENT";
  title: string;
  body: string;
};
