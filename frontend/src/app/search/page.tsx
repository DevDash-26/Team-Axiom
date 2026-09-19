import { Suspense } from "react";
import { SearchResults } from "@/app/search/search-results";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-64 rounded-xl" />}>
      <SearchResults />
    </Suspense>
  );
}
