import { NextResponse, type NextRequest } from "next/server";

const corsOptions: {
  allowedMethods: string[];
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
  credentials: boolean;
} = {
  allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
  allowedOrigins: (process.env?.ALLOWED_ORIGIN || "").split(","),
  allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
  exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
  maxAge: (process.env?.PREFLIGHT_MAX_AGE && parseInt(process.env?.PREFLIGHT_MAX_AGE)) || undefined,
  credentials: process.env?.CREDENTIALS == "true",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin") ?? "";
  console.log("Incoming request from origin:", origin);

  if (corsOptions.allowedOrigins.includes("*") || corsOptions.allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", corsOptions.credentials.toString());
    response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(","));
    response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
    response.headers.set("Access-Control-Expose-Headers", corsOptions.exposedHeaders.join(","));
    response.headers.set("Access-Control-Max-Age", corsOptions.maxAge?.toString() ?? "");
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,  // No content
      headers: response.headers
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};