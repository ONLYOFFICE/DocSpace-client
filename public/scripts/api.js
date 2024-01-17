(function () {
  const defaultConfig = {
    src: new URL(document.currentScript.src).origin,
    rootPath: "/rooms/shared/",
    requestToken: null,
    width: "100%",
    height: "100%",
    name: "frameDocSpace",
    type: "desktop", // TODO: ["desktop", "mobile"]
    frameId: "ds-frame",
    mode: "manager", //TODO: ["manager", "editor", "viewer","room-selector", "file-selector", "system"]
    id: null,
    locale: null,
    theme: "Base",
    editorType: "embedded", //TODO: ["desktop", "embedded"]
    editorGoBack: true,
    selectorType: "exceptPrivacyTrashArchiveFolders", //TODO: ["roomsOnly", "userFolderOnly", "exceptPrivacyTrashArchiveFolders", "exceptSortedByTagsFolders"]
    showSelectorCancel: false,
    showSelectorHeader: false,
    showHeader: false,
    showTitle: true,
    showMenu: false,
    showFilter: false,
    destroyText: "",
    viewAs: "row", //TODO: ["row", "table", "tile"]
    viewTableColumns: "Name,Size,Type",
    checkCSP: true,
    opacity: 0,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending", //TODO: ["descending", "ascending"]
      sortby: "DateAndTime", //TODO: ["DateAndTime", "AZ", "Type", "Size", "DateAndTimeCreation", "Author"]
      search: "",
      withSubfolders: false,
    },
    keysForReload: [
      "src",
      "rootPath",
      "width",
      "height",
      "name",
      "frameId",
      "id",
      "type",
      "editorType",
      "mode",
    ],
    events: {
      onSelectCallback: null,
      onCloseCallback: null,
      onAppReady: null,
      onAppError: (e) => console.log("onAppError", e),
      onEditorCloseCallback: null,
      onAuthSuccess: null,
    },
  };

  const checkCSP = (targetSrc, onAppError) => {
    const currentSrc = window.location.origin;

    if (currentSrc.indexOf(targetSrc) !== -1) return true;

    const cspSettings = async () => {
      try {
        const settings = await fetch(`${targetSrc}/api/2.0/security/csp`);
        const res = await settings.json();
        const { header } = res.response;

        return header && header.indexOf(currentSrc) !== -1;
      } catch (e) {
        onAppError(e);
      }
    };

    return cspSettings();
  };

  const getConfigFromParams = () => {
    const src = decodeURIComponent(document.currentScript.src);

    if (!src || !src.length) return null;

    const searchUrl = src.split("?")[1];
    let object = {};

    if (searchUrl && searchUrl.length) {
      object = JSON.parse(
        `{"${searchUrl.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
        (k, v) => (v === "true" ? true : v === "false" ? false : v)
      );

      object.filter = defaultConfig.filter;

      for (prop in object) {
        if (prop in defaultConfig.filter) {
          object.filter[prop] = object[prop];
          delete object[prop];
        }
      }
    }

    return { ...defaultConfig, ...object };
  };

  class DocSpace {
    #iframe;
    #isConnected = false;
    #cspInstalled = true;
    #callbacks = [];
    #tasks = [];
    #classNames = "";

    constructor(config) {
      this.config = config;
    }

    #oneOfExistInObject = (array, object) => {
      return Object.keys(object).some((k) => array.includes(k));
    };

    #createIframe = (config) => {
      const iframe = document.createElement("iframe");
      const newNode = document.createElement("div");
      newNode.style.width = config.width;
      newNode.style.height = config.height;
      newNode.style.display = "flex";
      newNode.style.justifyContent = "center";
      newNode.style.alignItems = "center";

      const svg = `
      <svg viewBox="-10 -10 220 220" xmlns="http://www.w3.org/2000/svg" aria-label="Loading content, please wait." style="width: 64px;height: 64px;color: #5299E0;">
        <style>
          :root {
            width: 64px;
            height: 64px;
            color: #5299E0;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              color: #ffffff;
            }
          }
        </style>
        <defs>
          <linearGradient id="spinner-color-prefix0-1" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".2"></stop>
          </linearGradient>
          <linearGradient id="spinner-color-prefix0-2" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".2"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".4"></stop>
          </linearGradient>
          <linearGradient id="spinner-color-prefix0-3" gradientUnits="objectBoundingBox" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".4"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".6"></stop>
          </linearGradient>
          <linearGradient id="spinner-color-prefix0-4" gradientUnits="objectBoundingBox" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".6"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".8"></stop>
          </linearGradient>
          <linearGradient id="spinner-color-prefix0-5" gradientUnits="objectBoundingBox" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".8"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity="1"></stop>
          </linearGradient><linearGradient id="spinner-color-prefix0-6" gradientUnits="objectBoundingBox" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="currentColor" stop-opacity="1"></stop>
            <stop offset="100%" stop-color="currentColor" stop-opacity="1"></stop>
          </linearGradient>
        </defs>
        <g fill="none" transform="translate(100,100) scale(0.75)" stroke-width="30">
          <path d="M 0,-100 A 100,100 0 0,1 86.6,-50" stroke="url(#spinner-color-prefix0-1)"></path>
          <path d="M 86.6,-50 A 100,100 0 0,1 86.6,50" stroke="url(#spinner-color-prefix0-2)"></path>
          <path d="M 86.6,50 A 100,100 0 0,1 0,100" stroke="url(#spinner-color-prefix0-3)"></path>
          <path d="M 0,100 A 100,100 0 0,1 -86.6,50" stroke="url(#spinner-color-prefix0-4)"></path>
          <path d="M -86.6,50 A 100,100 0 0,1 -86.6,-50" stroke="url(#spinner-color-prefix0-5)"></path>
          <path d="M -86.6,-50 A 100,100 0 0,1 0,-100" stroke="url(#spinner-color-prefix0-6)"></path>
        </g>
        <animateTransform from="0 0 0" to="360 0 0" attributeName="transform" type="rotate" repeatCount="indefinite" dur="1300ms"></animateTransform>
      </svg>
      `;
      const img = document.createElement("img");
      img.setAttribute("src", `${config.src}/static/images/loader.svg`);
      img.setAttribute("width", `64px`);
      img.setAttribute("height", `64px`);
      newNode.appendChild(img);
      const node = document.getElementById(config.frameId);
      const isExistLoader = document.getElementById(config.frameId + "loader");
      if (!isExistLoader) node.insertAdjacentElement("afterend", newNode);
      newNode.setAttribute("id", config.frameId + "loader");
      iframe.style.opacity = config.opacity;

      let path = "";

      switch (config.mode) {
        case "manager": {
          if (config.filter) {
            if (config.id) config.filter.folder = config.id;

            const params = config.requestToken
              ? { key: config.requestToken, ...config.filter }
              : config.filter;

            if (!params.withSubfolders) {
              delete params.withSubfolders;
            }

            const urlParams = new URLSearchParams(params).toString();

            path = `${config.rootPath}${
              config.requestToken
                ? `?${urlParams}`
                : `${config.id ? config.id + "/" : ""}filter?${urlParams}`
            }`;
          }
          break;
        }

        case "room-selector": {
          path = `/sdk/room-selector`;
          break;
        }

        case "file-selector": {
          path = `/sdk/file-selector?selectorType=${config.selectorType}`;
          break;
        }

        case "system": {
          path = `/sdk/system`;
          break;
        }

        case "editor": {
          let goBack = config.editorGoBack;

          if (
            config.events.onEditorCloseCallback &&
            typeof config.events.onEditorCloseCallback === "function"
          ) {
            goBack = "event";
          }

          path = `/doceditor/?fileId=${config.id}&type=${config.editorType}&editorGoBack=${goBack}`;

          if (config.requestToken) {
            path = `${path}&share=${config.requestToken}`;
          }

          break;
        }

        case "viewer": {
          let goBack = config.editorGoBack;

          if (
            config.events.onEditorCloseCallback &&
            typeof config.events.onEditorCloseCallback === "function"
          ) {
            goBack = "event";
          }

          path = `/doceditor/?fileId=${config.id}&type=${config.editorType}&action=view&editorGoBack=${goBack}`;

          if (config.requestToken) {
            path = `${path}&share=${config.requestToken}`;
          }

          break;
        }

        default:
          path = config.rootPath;
      }

      iframe.src = config.src + path;
      iframe.width = config.width;
      iframe.height = config.height;
      iframe.name = config.name;
      iframe.id = config.frameId;

      iframe.frameBorder = 0;
      iframe.allowFullscreen = true;
      iframe.setAttribute("allow", "storage-access");
      iframe.style.zIndex = 2;
      if (config.type == "mobile") {
        iframe.style.position = "fixed";
        iframe.style.overflow = "hidden";
        document.body.style.overscrollBehaviorY = "contain";
      }

      if (!this.#cspInstalled) {
        const errorMessage =
          "Current domain not set in Content Security Policy (CSP) settings. Please add it on developer tools page.";
        config.events.onAppError(errorMessage);

        const html = `<body>${errorMessage}</body>`;
        iframe.srcdoc = html;
      }

      return iframe;
    };

    #sendMessage = (message) => {
      let mes = {
        frameId: this.config.frameId,
        type: "",
        data: message,
      };

      if (!!this.#iframe.contentWindow) {
        this.#iframe.contentWindow.postMessage(
          JSON.stringify(mes, (key, value) =>
            typeof value === "function" ? value.toString() : value
          ),
          this.config.src
        );
      }
    };

    #onMessage = (e) => {
      if (typeof e.data == "string") {
        let data = {};

        try {
          data = JSON.parse(e.data);
        } catch (err) {
          data = {};
        }

        switch (data.type) {
          case "onMethodReturn": {
            if (this.#callbacks.length > 0) {
              const callback = this.#callbacks.shift();
              callback && callback(data.methodReturnData);
            }

            if (this.#tasks.length > 0) {
              this.#sendMessage(this.#tasks.shift());
            }
            break;
          }
          case "onEventReturn": {
            if (
              data?.eventReturnData?.event in this.config.events &&
              typeof this.config.events[data?.eventReturnData.event] ===
                "function"
            ) {
              this.config.events[data?.eventReturnData.event](
                data?.eventReturnData?.data
              );
            }
            break;
          }
          case "onCallCommand": {
            this[data.commandName].call(this, data.commandData);
            break;
          }
          default:
            break;
        }
      }
    };
    #executeMethod = (methodName, params, callback) => {
      if (!this.#isConnected) {
        this.config.events.onAppError(
          "Message bus is not connected with frame"
        );
        return;
      }

      this.#callbacks.push(callback);

      const message = {
        type: "method",
        methodName,
        data: params,
      };

      if (this.#callbacks.length !== 1) {
        this.#tasks.push(message);
        return;
      }

      this.#sendMessage(message);
    };

    initFrame(config) {
      const configFull = { ...defaultConfig, ...config };
      this.config = { ...this.config, ...configFull };

      const target = document.getElementById(this.config.frameId);

      if (this.config.checkCSP) {
        this.#cspInstalled = checkCSP(
          this.config.src,
          this.config.events.onAppError
        );
      }

      if (target) {
        this.#iframe = this.#createIframe(this.config);
        this.#classNames = target.className;

        target.parentNode &&
          target.parentNode.replaceChild(this.#iframe, target);

        window.addEventListener("message", this.#onMessage, false);

        this.#isConnected = true;
      }

      window.DocSpace.SDK.frames = window.DocSpace.SDK.frames || [];

      window.DocSpace.SDK.frames[this.config.frameId] = this;

      return this.#iframe;
    }

    initManager(config = {}) {
      config.mode = "manager";

      return this.initFrame(config);
    }

    setIsLoaded() {
      const node = document.getElementById(config.frameId);
      if (node) node.style.opacity = 1;
    }

    initEditor(config = {}) {
      config.mode = "editor";

      return this.initFrame(config);
    }

    initViewer(config = {}) {
      config.mode = "viewer";

      return this.initFrame(config);
    }

    initRoomSelector(config = {}) {
      config.mode = "room-selector";

      return this.initFrame(config);
    }

    initFileSelector(config = {}) {
      config.mode = "file-selector";

      return this.initFrame(config);
    }

    initSystem(config = {}) {
      config.mode = "system";

      return this.initFrame(config);
    }

    destroyFrame() {
      const target = document.createElement("div");

      target.setAttribute("id", this.config.frameId);
      target.innerHTML = this.config.destroyText;
      target.className = this.#classNames;

      if (this.#iframe) {
        window.removeEventListener("message", this.#onMessage, false);
        this.#isConnected = false;

        delete window.DocSpace.SDK.frames[this.config.frameId];

        this.#iframe.parentNode &&
          this.#iframe.parentNode.replaceChild(target, this.#iframe);
      }

      this.config = {};
    }

    #getMethodPromise = (methodName, params = null, withReload = false) => {
      return new Promise((resolve) => {
        if (withReload) {
          this.initFrame(this.config);
          resolve(this.config);
        } else {
          this.#executeMethod(methodName, params, (data) => resolve(data));
        }
      });
    };

    getFolderInfo() {
      return this.#getMethodPromise("getFolderInfo");
    }

    getSelection() {
      return this.#getMethodPromise("getSelection");
    }

    getFiles() {
      return this.#getMethodPromise("getFiles");
    }

    getFolders() {
      return this.#getMethodPromise("getFolders");
    }

    getList() {
      return this.#getMethodPromise("getList");
    }

    getRooms(filter) {
      return this.#getMethodPromise("getRooms", filter);
    }

    getUserInfo() {
      return this.#getMethodPromise("getUserInfo");
    }

    getConfig() {
      return this.config;
    }

    getHashSettings() {
      return this.#getMethodPromise("getHashSettings");
    }

    setConfig(newConfig = {}, reload = false) {
      if (this.#oneOfExistInObject(this.config.keysForReload, newConfig))
        reload = true;

      this.config = { ...this.config, ...newConfig };

      return this.#getMethodPromise("setConfig", this.config, reload);
    }

    openModal(type, options) {
      return this.#getMethodPromise("openModal", { type, options });
    }

    createFile(folderId, title, templateId, formId) {
      return this.#getMethodPromise("createFile", {
        folderId,
        title,
        templateId,
        formId,
      });
    }

    createFolder(parentFolderId, title) {
      return this.#getMethodPromise("createFolder", {
        parentFolderId,
        title,
      });
    }

    createRoom(title, roomType) {
      return this.#getMethodPromise("createRoom", {
        title,
        roomType,
      });
    }

    setListView(type) {
      return this.#getMethodPromise("setItemsView", type);
    }

    createHash(password, hashSettings) {
      return this.#getMethodPromise("createHash", { password, hashSettings });
    }

    login(email, passwordHash) {
      return this.#getMethodPromise("login", { email, passwordHash });
    }

    logout() {
      return this.#getMethodPromise("logout");
    }

    createTag(name) {
      return this.#getMethodPromise("createTag", name);
    }

    addTagsToRoom(roomId, tags) {
      return this.#getMethodPromise("addTagsToRoom", { roomId, tags });
    }

    removeTagsFromRoom(roomId, tags) {
      return this.#getMethodPromise("removeTagsFromRoom", { roomId, tags });
    }
  }

  const config = getConfigFromParams();

  window.DocSpace = window.DocSpace || {};

  window.DocSpace.SDK = new DocSpace(config);

  if (config.init) {
    window.DocSpace.SDK.initFrame(config);
  }
})();
