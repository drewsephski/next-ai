"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Custom hook for authentication that wraps Better Auth's useSession
 * Provides consistent authentication state management across the app
 */
export function useAuth() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const router = useRouter();

  const signOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect even if API call fails
      router.push("/");
    }
  };

  return {
    user: session?.user || null,
    session,
    loading: isPending,
    signOut,
    refresh: refetch,
  };
}

/**
 * Hook for protected routes that redirects to sign-in if not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  return { user, loading };
}
