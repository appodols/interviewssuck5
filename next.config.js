/** @type {import('next').NextConfig} */
const nextConfig = {
  // Combine the webpack configurations
  webpack(config) {
    // Add the rule for handling SVG files with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  
  // Include rewrites to manage API redirections for FastAPI in development and production
  //note, this may be a source of bugs
rewrites: async () => {
  return [
    {
      source: '/api/:path*',
      destination: 
        process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/:path*'
        : 'https://interviewbasic.vercel.app/:path*',
    },
    {
      source: '/docs',
      destination:
        process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/docs'
        : 'https://interviewbasic.vercel.app/docs',
    },
    {
      source: '/openapi.json',
      destination:
        process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/openapi.json'
        : 'https://interviewbasic.vercel.app/openapi.json',
    },
  ];
},
  // Set reactStrictMode according to the existing setting from the Deepgram project
  reactStrictMode: false,
};

// Export the combined configuration
module.exports = nextConfig;