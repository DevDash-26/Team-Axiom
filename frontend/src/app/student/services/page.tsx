import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Student shell route; campus info hub lives at /info. */
export default function StudentServicesRedirectPage() {
  redirect(ROUTES.info);
}
