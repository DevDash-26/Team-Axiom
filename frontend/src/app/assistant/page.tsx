import { Suspense } from "react";
import { AssistantView } from "@/app/assistant/assistant-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantPage() {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-[60vh] rounded-xl" />}>
      <AssistantView />
    </Suspense>
  );
}
