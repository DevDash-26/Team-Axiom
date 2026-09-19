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
  location?: string | null;
  event_at?: string | null;
  deadline_at?: string | null;
  apply_url?: string | null;
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

export type RequestTypeName = "ACADEMIC_SUPPORT" | "FACILITY_ISSUE" | "FEEDBACK";
export type RequestStatusName = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type RequestRead = {
  id: string;
  type: RequestTypeName | string;
  title: string;
  body: string;
  status: RequestStatusName | string;
  response: string | null;
  created_at: string;
  updated_at?: string | null;
  requester: AuthorPublic;
  handler: AuthorPublic | null;
};

export type RequestListResponse = {
  items: RequestRead[];
  page: number;
  page_size: number;
  total: number;
};

export type RequestCreatePayload = {
  type: RequestTypeName;
  title: string;
  body: string;
};

export type RequestUpdatePayload = {
  status: RequestStatusName;
  response?: string | null;
};

export type ListingTypeName = "LOST" | "FOUND" | "TEXTBOOK";
export type ListingStatusName = "ACTIVE" | "RESOLVED" | "REMOVED";

export type ListingRead = {
  id: string;
  type: ListingTypeName | string;
  title: string;
  body: string;
  category: string | null;
  location: string | null;
  occurred_at: string | null;
  status: ListingStatusName | string;
  created_at: string;
  owner: AuthorPublic;
  interest_count: number;
  viewer_interested: boolean;
};

export type ListingListResponse = {
  items: ListingRead[];
  page: number;
  page_size: number;
  total: number;
};

export type ListingCreatePayload = {
  type: "LOST" | "FOUND";
  title: string;
  body: string;
  category?: string | null;
  location?: string | null;
  occurred_at?: string | null;
};

export type ListingInterestRead = {
  id: string;
  created_at: string;
  user: AuthorPublic;
};

export type ListingInterestListResponse = {
  items: ListingInterestRead[];
  total: number;
};

export type InfoPageRead = {
  id: string;
  category: string;
  title: string;
  body: string;
  updated_at?: string | null;
};

export type FaqRead = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export type StaffContactRead = {
  id: string;
  name: string;
  role_title: string;
  department: string;
  email: string;
  office_hours: string | null;
};
