// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

const path = require("path");
const config = require("./config/config.json");

import("./logger.mjs").then(({ logger }) => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "production";
  process.chdir(__dirname);

  const log = logger.child({ module: "server" });

  const dir = path.join(__dirname);

  const dev = process.env.NODE_ENV === "development";

  const currentPort = config.PORT ?? 5013;
  const hostname = config.HOSTNAME ?? "localhost";

  // Make sure commands gracefully respect termination signals (e.g. from Docker)
  // Allow the graceful termination to be manually configurable
  if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
    process.on("SIGTERM", () => process.exit(0));
    process.on("SIGINT", () => process.exit(0));
  }

  let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
  const nextConfig = {
    env: {},
    eslint: { ignoreDuringBuilds: false },
    typescript: { ignoreBuildErrors: true, tsconfigPath: "tsconfig.json" },
    distDir: "./.next",
    cleanDistDir: true,
    assetPrefix: "/doceditor",
    configOrigin: "next.config.js",
    useFileSystemPublicRoutes: true,
    generateEtags: true,
    pageExtensions: ["tsx", "ts", "jsx", "js"],
    poweredByHeader: true,
    compress: true,
    analyticsId: "",
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      path: "/doceditor/_next/image",
      loader: "default",
      loaderFile: "",
      domains: [],
      disableStaticImages: false,
      minimumCacheTTL: 60,
      formats: ["image/webp"],
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
      contentDispositionType: "inline",
      remotePatterns: [],
      unoptimized: true,
    },
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: "bottom-right",
    },
    onDemandEntries: { maxInactiveAge: 60000, pagesBufferLength: 5 },
    amp: { canonicalBase: "/doceditor" },
    basePath: "/doceditor",
    sassOptions: {},
    trailingSlash: false,
    i18n: null,
    productionBrowserSourceMaps: false,
    optimizeFonts: true,
    excludeDefaultMomentLocales: true,
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},
    reactProductionProfiling: false,
    reactStrictMode: null,
    httpAgentOptions: { keepAlive: true },
    outputFileTracing: true,
    staticPageGenerationTimeout: 60,
    swcMinify: true,
    output: "standalone",
    modularizeImports: {
      "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" },
      lodash: { transform: "lodash/{{member}}" },
      "next/server": {
        transform: "next/dist/server/web/exports/{{ kebabCase member }}",
      },
    },
    experimental: {
      serverComponentsExternalPackages: [
        "pino",
        "pino-pretty",
        "date-and-time",
      ],
      windowHistorySupport: false,
      serverMinification: true,
      serverSourceMaps: false,
      caseSensitiveRoutes: false,
      useDeploymentId: false,
      useDeploymentIdServerActions: false,
      clientRouterFilter: true,
      clientRouterFilterRedirects: false,
      fetchCacheKeyPrefix: "",
      middlewarePrefetch: "flexible",
      optimisticClientCache: true,
      manualClientBasePath: false,
      cpus: 19,
      memoryBasedWorkersCount: false,
      isrFlushToDisk: true,
      workerThreads: false,
      optimizeCss: false,
      nextScriptWorkers: false,
      scrollRestoration: false,
      externalDir: false,
      disableOptimizedLoading: false,
      gzipSize: true,
      craCompat: false,
      esmExternals: true,
      isrMemoryCacheSize: 52428800,
      fullySpecified: false,
      outputFileTracingRoot: "C:\\GitHub\\1.work\\docspace\\client",
      swcTraceProfiling: false,
      forceSwcTransforms: false,
      largePageDataBytes: 128000,
      adjustFontFallbacks: false,
      adjustFontFallbacksWithSizeAdjust: false,
      typedRoutes: false,
      instrumentationHook: true,
      bundlePagesExternals: false,
      ppr: false,
      webpackBuildWorker: false,
      optimizePackageImports: [
        "lucide-react",
        "date-fns",
        "lodash-es",
        "ramda",
        "antd",
        "react-bootstrap",
        "ahooks",
        "@ant-design/icons",
        "@headlessui/react",
        "@headlessui-float/react",
        "@heroicons/react/20/solid",
        "@heroicons/react/24/solid",
        "@heroicons/react/24/outline",
        "@visx/visx",
        "@tremor/react",
        "rxjs",
        "@mui/material",
        "@mui/icons-material",
        "recharts",
        "react-use",
        "@material-ui/core",
        "@material-ui/icons",
        "@tabler/icons-react",
        "mui-core",
        "react-icons/ai",
        "react-icons/bi",
        "react-icons/bs",
        "react-icons/cg",
        "react-icons/ci",
        "react-icons/di",
        "react-icons/fa",
        "react-icons/fa6",
        "react-icons/fc",
        "react-icons/fi",
        "react-icons/gi",
        "react-icons/go",
        "react-icons/gr",
        "react-icons/hi",
        "react-icons/hi2",
        "react-icons/im",
        "react-icons/io",
        "react-icons/io5",
        "react-icons/lia",
        "react-icons/lib",
        "react-icons/lu",
        "react-icons/md",
        "react-icons/pi",
        "react-icons/ri",
        "react-icons/rx",
        "react-icons/si",
        "react-icons/sl",
        "react-icons/tb",
        "react-icons/tfi",
        "react-icons/ti",
        "react-icons/vsc",
        "react-icons/wi",
      ],
      trustHostHeader: false,
      isExperimentalCompile: false,
    },
    configFileName: "next.config.js",
    compiler: { styledComponents: true },
    logging: { fetches: { fullUrl: true } },
  };

  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

  require("next");
  const { startServer } = require("next/dist/server/lib/start-server");

  if (
    Number.isNaN(keepAliveTimeout) ||
    !Number.isFinite(keepAliveTimeout) ||
    keepAliveTimeout < 0
  ) {
    keepAliveTimeout = undefined;
  }

  startServer({
    dir,
    isDev: dev,
    config: nextConfig,
    hostname,
    port: currentPort,
    allowRetry: false,
    keepAliveTimeout,
  }).catch((err) => {
    log.error(err, "Error occurred handling");
    process.exit(1);
  });
});
