import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SectionCards } from "./_components/section-cards";
import { ChartAreaInteractive } from "./_components/chart-interactive";
import { Suspense } from "react";

async function DashboardContent() {
  try {
    const result = await auth.api.getSession({ headers: await headers() });

    if (!result?.session?.userId || !result.user) {
      // If no session or user data, return null. Middleware will handle redirect.
      console.warn("No active session or user data for dashboard. Relying on middleware for redirect.");
      return null;
    }

    const user = result.user;

    return (
      <section className="flex flex-col items-start justify-start p-6 w-full">
        <div className="w-full">
          <div className="flex flex-col items-start justify-center gap-2 mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {user.name || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Interactive dashboard with data visualization and analytics.
            </p>
          </div>
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Dashboard authentication error:", error);
    // Log the error but allow middleware to handle redirects.
    return null; // Or render an error message/component
  }
}

export default async function Dashboard() {
  const content = await DashboardContent();
  if (content === null) {
    // Middleware should have redirected, but as a fallback, we can render nothing
    return null;
  }
  return (
    <Suspense
      fallback={
        <section className="flex flex-col items-start justify-start p-6 w-full">
          <div className="w-full">
            <div className="flex flex-col items-start justify-center gap-2 mb-6">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-4 py-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </section>
      }
    >
      {content}
    </Suspense>
  );
}

