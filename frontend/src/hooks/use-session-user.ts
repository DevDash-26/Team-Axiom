"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMe } from "@/lib/auth";
import { getAccessToken } from "@/lib/supabase";
import type { UserPublic } from "@/types";

export function useSessionUser() {
  const [user, setUser] = useState<UserPublic | null>(null);

  const refresh = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setUser(await fetchMe());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, setUser, refresh };
}
