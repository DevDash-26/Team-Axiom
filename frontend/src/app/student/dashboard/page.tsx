import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function StudentDashboardRedirect() {
  redirect(ROUTES.home);
}
