"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { toast } from "sonner";

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const error = searchParams.get("error");

  useEffect(() => {
    setMounted(true);

    // Show error toast if there's an error in URL params
    if (error) {
      const errorMessages: Record<string, string> = {
        "auth_error": "Authentication failed. Please try signing in again.",
        "access_denied": "Access was denied. Please try signing in again.",
        "server_error": "Server error occurred. Please try again later.",
        "temporarily_unavailable": "Service temporarily unavailable. Please try again.",
        "invalid_request": "Invalid request. Please try signing in again.",
        "unauthorized_client": "Unauthorized client. Please contact support.",
        "unsupported_response_type": "Unsupported response type. Please contact support.",
        "invalid_scope": "Invalid scope requested. Please contact support.",
        "configuration_error": "Configuration error. Please contact support.",
      };

      toast.error(errorMessages[error] || "Authentication failed. Please try again.", {
        duration: 5000,
      });
    }
  }, [error]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl">
            Welcome to Next.js SaaS Starter Kit
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Button
              variant="outline"
              className={cn("w-full gap-3 h-12")}
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);

                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL: returnTo,
                    errorCallbackURL: `/sign-in?error=auth_error`,
                  });
                } catch (error) {
                  console.error("Authentication error:", error);
                  toast.error("Failed to initiate sign-in. Please try again.", {
                    duration: 5000,
                  });
                  setLoading(false);
                }
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 256 262"
                    className="text-blue-500"
                  >
                    <path
                      fill="#4285F4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                      fill="#34A853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                      fill="#FBBC05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                      fill="#EB4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure authentication powered by Better Auth
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-center text-muted-foreground max-w-md leading-relaxed">
        By signing in, you agree to our{" "}
        <Link
          href="/terms-of-service"
          className="underline hover:text-foreground transition-colors"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy-policy"
          className="underline hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full h-screen">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
