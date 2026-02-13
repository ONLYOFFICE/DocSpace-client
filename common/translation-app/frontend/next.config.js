/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: "..",
  env: {
    API_URL: process.env.API_URL || "http://localhost:3001/api",
    WS_URL: process.env.WS_URL || "http://localhost:3001",
  },
};

module.exports = nextConfig;
