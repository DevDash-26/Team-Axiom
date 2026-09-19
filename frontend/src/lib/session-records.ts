/** Browser-session extras for UI demos. Not an API cache. */

import type { CampusRequestFixture, ListingFixture } from "@/lib/fixtures/services";

const LISTINGS_KEY = "unihive.listings";
const REQUESTS_KEY = "unihive.requests";

function readJsonArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, value: T[]): void {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function mergeById<T extends { id: string }>(extras: T[], seed: T[]): T[] {
  const extraIds = new Set(extras.map((row) => row.id));
  return [...extras, ...seed.filter((row) => !extraIds.has(row.id))];
}

export function rememberListing(item: ListingFixture): void {
  writeJsonArray(LISTINGS_KEY, mergeById([item], readJsonArray<ListingFixture>(LISTINGS_KEY)));
}

export function listingsWithSession(seed: ListingFixture[]): ListingFixture[] {
  return mergeById(readJsonArray<ListingFixture>(LISTINGS_KEY), seed);
}

export function rememberRequest(item: CampusRequestFixture): void {
  writeJsonArray(REQUESTS_KEY, mergeById([item], readJsonArray<CampusRequestFixture>(REQUESTS_KEY)));
}

export function requestsWithSession(seed: CampusRequestFixture[]): CampusRequestFixture[] {
  return mergeById(readJsonArray<CampusRequestFixture>(REQUESTS_KEY), seed);
}
