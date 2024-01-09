/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/doceditor",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
