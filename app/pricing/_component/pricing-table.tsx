"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import {
  Code,
  Shield,
  CreditCard,
  Bot,
  Database,
  Upload,
  Palette,
  BarChart,
  Zap,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: "CANCELED" | "EXPIRED" | "GENERAL";
};

interface PricingTableProps {
  subscriptionDetails: SubscriptionDetailsResult;
}

export default function PricingTable({
  subscriptionDetails,
}: PricingTableProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleCheckout = async (productId: string, slug: string) => {
    if (isAuthenticated === false) {
      router.push("/sign-in");
      return;
    }
    try {
      await authClient.checkout({
        products: [productId],
        slug: slug,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      // TODO: Add user-facing error notification
      toast.error("Oops, something went wrong");
    }
  };

  const handleManageSubscription = async () => {
    try {
      await authClient.customer.portal();
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      toast.error("Failed to open subscription management");
    }
  };

  const STARTER_TIER = process.env.NEXT_PUBLIC_STARTER_TIER;
  const STARTER_SLUG = process.env.NEXT_PUBLIC_STARTER_SLUG;

  if (!STARTER_TIER || !STARTER_SLUG) {
    throw new Error("Missing required environment variables for Starter tier");
  }

  const isCurrentPlan = (tierProductId: string) => {
    return (
      subscriptionDetails.hasSubscription &&
      subscriptionDetails.subscription?.productId === tierProductId &&
      subscriptionDetails.subscription?.status === "active"
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="flex flex-col items-center justify-center px-4 py-12 w-full mx-auto bg-white dark:bg-black text-black dark:text-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-4">
          Complete SaaS Boilerplate
        </h1>
        <p className="text-xl text-muted-foreground">
          Production-ready SaaS starter kit with everything you need to launch your business
        </p>
      </div>

      <div className="flex justify-center items-center max-w-4xl w-full mx-auto">
        {/* Starter Tier */}
        <Card className="h-fit dark:bg-zinc-900 w-full max-w-lg">
          {isCurrentPlan(STARTER_TIER) && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              >
                Current Plan
              </Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Complete SaaS Boilerplate</CardTitle>
            <CardDescription className="text-lg">Production-ready enterprise SaaS starter kit</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$79</span>
              <span className="text-muted-foreground"> one-time</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Row 1 */}
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Next.js 15 + TypeScript</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Enterprise Authentication</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Subscription Management</span>
              </div>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">AI-Powered Chatbot</span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Production Database</span>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Advanced File Storage</span>
              </div>

              {/* Row 4 */}
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Modern UI Framework</span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Analytics & Monitoring</span>
              </div>

              {/* Row 5 */}
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Additional Features</span>
              </div>
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">Production Ready</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isCurrentPlan(STARTER_TIER) ? (
              <div className="w-full space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleManageSubscription}
                >
                  Manage Subscription
                </Button>
                {subscriptionDetails.subscription && (
                  <p className="text-sm text-muted-foreground text-center">
                    {subscriptionDetails.subscription.cancelAtPeriodEnd
                      ? `Expires ${formatDate(subscriptionDetails.subscription.currentPeriodEnd)}`
                      : `Renews ${formatDate(subscriptionDetails.subscription.currentPeriodEnd)}`}
                  </p>
                )}
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleCheckout(STARTER_TIER, STARTER_SLUG)}
              >
                {isAuthenticated === false
                  ? "Sign In to Get Started"
                  : "Get Started"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Need a custom plan?{" "}
          <span className="text-primary cursor-pointer hover:underline dark:text-white">
            Contact us
          </span>
        </p>
      </div>
    </section>
  );
}
