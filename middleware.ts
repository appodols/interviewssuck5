// Importing necessary modules from next/server to handle requests and responses within Next.js middleware
import { NextResponse, type NextRequest } from "next/server";

// Definition of CORS options with types for strict type checking and initialization from environment variables
// const corsOptions: {
//   allowedMethods: string[];
//   allowedOrigins: string[];
//   allowedHeaders: string[];
//   exposedHeaders: string[];
//   maxAge?: number;
//   credentials: boolean;
// } = {
//   allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
//   allowedOrigins: (process.env?.ALLOWED_ORIGIN || "").split(","),
//   allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
//   exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
// };


// Definition of CORS options
// const corsOptions = {
//     allowedMethods: ['GET', 'POST', 'OPTIONS'], // Example methods
//     allowedOrigins: ['https://interviewbasic-git-main4-sashapodolskys-projects.vercel.app'], // Specific allowed origin
//   };

// Update CORS options to specify only the allowed methods and headers
const corsOptions = {
    allowedMethods: ['GET', 'POST', 'OPTIONS'],  // Methods you expect to use
    allowedHeaders: ['Content-Type', 'X-Requested-With'],  // Expected request headers
  };

/**
 * Middleware function to enforce CORS settings for API routes.
 * Sets necessary headers to manage cross-origin requests based on environment-configured settings.
 * @param request - The incoming Next.js request object.
 * @returns - A Next.js response object with CORS headers set.
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const origin = request.headers.get("origin") ?? "";
  
    // Check if the origin ends with '.vercel.app'
    if (origin.endsWith('.vercel.app')) {
      // Handle preflight OPTIONS request
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
        response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
        return response;
      }
  
      // Set CORS headers for regular requests
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
      response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
    }
  
    return response;
  }
// Configuration for the middleware, specifying which API routes it should apply to
export const config = {
  matcher: "/api/:path*", // Apply middleware to all paths under /api
};