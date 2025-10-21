import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic generation for this auth catch-all route
export const dynamic = 'force-dynamic';

export const { POST, GET } = toNextJsHandler(auth);
