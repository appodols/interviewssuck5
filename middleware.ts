import { NextResponse, type NextRequest } from "next/server";

// Updated CORS options for clarity and security
const corsOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],  // Methods you expect to use
  allowedHeaders: ['Content-Type', 'X-Requested-With'],  // Expected request headers
};

console.log('middleware')

export function middleware(request: NextRequest) {
    console.log("Middleware executed for:", request.nextUrl.pathname);
    const response = NextResponse.next();
    const origin = request.headers.get("origin") ?? "*";  // Default to wildcard if no origin is provided

    console.log(`Handling request from origin: ${origin}`);
    console.log(`Request method: ${request.method}`);

    // Set CORS headers for all origins
    if (request.method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 204 });
        preflightResponse.headers.set("Access-Control-Allow-Origin", "*");
        preflightResponse.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
        preflightResponse.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
        console.log("Preflight request handled.");
        return preflightResponse;
    }

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
    response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
    console.log("CORS headers set for regular request.");

    return response;
}

// export function middleware(request: NextRequest) {
//     console.log("Middleware executed for:", request.nextUrl.pathname);
//     const response = NextResponse.next();
//     const origin = request.headers.get("origin") ?? "No Origin Provided";

//     console.log(`Handling request from origin: ${origin}`);
//     console.log(`Request method: ${request.method}`);

//     // Default to allowing localhost during development if no origin is provided
//     const effectiveOrigin = origin === "No Origin Provided" ? "http://localhost:3001" : origin;

//     if (effectiveOrigin.endsWith('.vercel.app') || effectiveOrigin.startsWith('http://localhost:3001') || effectiveOrigin.startsWith('http://localhost:3000')) {
//         if (request.method === 'OPTIONS') {
//             const preflightResponse = new NextResponse(null, { status: 204 });
//             preflightResponse.headers.set("Access-Control-Allow-Origin", effectiveOrigin);
//             preflightResponse.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
//             preflightResponse.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
//             console.log("Preflight request handled.");
//             return preflightResponse;
//         }

//         response.headers.set("Access-Control-Allow-Origin", effectiveOrigin);
//         response.headers.set("Access-Control-Allow-Methods", corsOptions.allowedMethods.join(','));
//         response.headers.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(','));
//         console.log("CORS headers set for regular request.");
//     } else {
//         console.log("Origin not allowed by CORS policy.");
//     }

//     return response;
// }

export const config = {
  matcher: "/api/:path*", // Apply middleware to all paths under /api
};