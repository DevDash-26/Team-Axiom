import { redirect } from "next/navigation";
import { eventPath } from "@/lib/constants";

type StudentEventRedirectProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentEventRedirect({ params }: StudentEventRedirectProps) {
  const { id } = await params;
  redirect(eventPath(id));
}
