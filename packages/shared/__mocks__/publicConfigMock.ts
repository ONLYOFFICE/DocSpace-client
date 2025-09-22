const config = {
  api: {
    origin: "",
    prefix: "/api/2.0",
    timeout: 30000,
  },
  proxy: {
    url: "",
  },
  wrongPortalNameUrl: "",
  pdfViewer: false,
  pdfViewerUrl: "sdkjs/pdf/src/engine/viewer.js",
  imageThumbnails: true,
  editor: {
    requestClose: false,
  },
  management: {
    checkDomain: false,
  },
  oauth2: {
    origin: "",
    apiSystem: [],
    identity: [],
  },
  firebase: {
    fetchTimeoutMillis: 3600000,
    minimumFetchIntervalMillis: 3600000,
  },
  campaigns: [
    "OnlyofficeForDevelopers",
    "OnlyofficeForPlatform",
    "BookTraining",
    "FormGallery",
  ],
  logs: {
    enableLogs: false,
    logsToConsole: false,
  },
  loaders: {
    showLoader: true,
    showLoaderTime: 1000,
    loaderTime: null,
  },
};

export default config;
