import { NextResponse, type NextRequest } from "next/server";

// Updated CORS options for clarity and security
const corsOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],  // Methods you expect to use
  allowedHeaders: ['Content-Type', 'X-Requested-With'],  // Expected request headers
};

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const origin = request.headers.get("origin") ?? "";

    console.log(`Handling request from origin: ${origin}`); // Add logging for the origin

    if (origin.endsWith('.vercel.app')) {
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
        response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
        console.log("Preflight request handled."); // Log preflight handling
        return response;
      }

      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
      response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));

      console.log("CORS headers set for regular request."); // Log successful CORS handling
    } else {
      console.log("Origin not allowed by CORS policy."); // Log when an origin is not allowed
    }

    return response;
}

export const config = {
  matcher: "/api/:path*", // Apply middleware to all paths under /api
};