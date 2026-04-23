import { useCallback } from "react";
import { trpc } from "../trpc";

export function useAuth() {
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await utils.auth.me.invalidate();
    window.location.href = "/login";
  }, [logoutMutation, utils]);

  return { user: user ?? null, loading, logout };
}
