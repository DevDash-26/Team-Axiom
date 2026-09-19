import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Student shell route; canonical assistant UI lives at /assistant. */
export default function StudentAssistantRedirectPage() {
  redirect(ROUTES.assistant);
}
