/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
  basePath: "/doceditor",
  compiler: {
    styledComponents: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = {
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    const imageRule = config.module.rules.find(
      (rule) => rule.loader === "next-image-loader",
    );
    imageRule.resourceQuery = {
      not: [...fileLoaderRule.resourceQuery.not, /url/],
    };

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        type: "asset/resource",
        generator: {
          emit: false,
          filename: "static/chunks/[path][name][ext]?[hash]",
        },
        test: /\.(svg|png|jpe?g|gif|ico|woff2)$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  ...nextConfig,
};
