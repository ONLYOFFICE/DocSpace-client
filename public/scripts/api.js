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
      onSignOut: null,
    },
  };

  const cspErrorText =
    "The current domain is not set in the Content Security Policy (CSP) settings.";

  const validateCSP = async (targetSrc) => {
    const currentSrc = window.location.origin;

    if (currentSrc.indexOf(targetSrc) !== -1) return; //TODO: try work with localhost

    const response = await fetch(`${targetSrc}/api/2.0/security/csp`);
    const res = await response.json();
    const passed =
      res.response.header && res.response.header.includes(currentSrc);

    if (!passed) throw new Error(cspErrorText);

    return;
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
    #frameOpacity = 0;
    #callbacks = [];
    #tasks = [];
    #classNames = "";

    constructor(config) {
      this.config = config;
    }

    #oneOfExistInObject = (array, object) => {
      return Object.keys(object).some((k) => array.includes(k));
    };

    #createLoader = (config) => {
      const container = document.createElement("div");
      container.style.width = config.width;
      container.style.height = config.height;
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.alignItems = "center";

      const loader = document.createElement("img");
      loader.setAttribute("src", `${config.src}/static/images/loader.svg`);
      loader.setAttribute("width", `64px`);
      loader.setAttribute("height", `64px`);

      if (
        config.theme === "Dark" ||
        (config.theme === "System" &&
          window.matchMedia("(prefers-color-scheme: dark)"))
      ) {
        container.style.backgroundColor = "#333333";
        loader.style.filter =
          "invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)";
      }

      container.appendChild(loader);

      container.setAttribute("id", config.frameId + "-loader");

      return container;
    };

    #createIframe = (config) => {
      const iframe = document.createElement("iframe");

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
      iframe.setAttribute("allow", "storage-access *");

      if (config.type == "mobile") {
        iframe.style.position = "fixed";
        iframe.style.overflow = "hidden";
        document.body.style.overscrollBehaviorY = "contain";
      }

      if (this.config.checkCSP) {
        validateCSP(this.config.src).catch((e) => {
          const html = `
          <body style="background: #F3F4F4;">
          <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,300" rel="stylesheet" type="text/css">
          <div style="display: flex; flex-direction: column; gap: 80px; align-items: center; justify-content: flex-start; margin-top: 60px; padding: 0 30px;">
          <div style="flex-shrink: 0; width: 211px; height: 24px; position: relative">
          <img src="${this.config.src}/static/images/logo/lightsmall.svg">
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px; align-items: center; justify-content: flex-start; flex-shrink: 0; position: relative;">
          <div style="flex-shrink: 0; width: 120px; height: 100px; position: relative">
          <img src="${this.config.src}/static/images/frame-error.svg">
          </div>
          <span style="color: #A3A9AE; text-align: center; font-family: Open Sans; font-size: 14px; font-style: normal; font-weight: 700; line-height: 16px;">
          ${cspErrorText} Please add it via 
          <a href="${this.config.src}/portal-settings/developer-tools/javascript-sdk" target="_blank" style="color: #4781D1; text-align: center; font-family: Open Sans; font-size: 14px; font-style: normal; font-weight: 700; line-height: 16px; text-decoration-line: underline;">
          the Developer Tools section</a>.
          </span>
          </div>
          </div>
          </body>`;
          iframe.srcdoc = html;
          e.message && config.events.onAppError(e.message);

          this.setIsLoaded();
        });
      }

      return iframe;
    };

    #sendMessage = (message) => {
      let mes = {
        frameId: this.config.frameId,
        type: "",
        data: message,
      };

      const targetFrame = document.getElementById(this.config.frameId);

      if (!!targetFrame.contentWindow) {
        targetFrame.contentWindow.postMessage(
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

      let iframe = null;

      if (target) {
        iframe = this.#createIframe(this.config);

        iframe.style.opacity = this.#frameOpacity;
        iframe.style.zIndex = 2;
        iframe.style.position = "absolute";
        iframe.width = "95%";
        iframe.height = "95%";

        const frameLoader = this.#createLoader(this.config);

        this.#classNames = target.className;

        const renderContainer = document.createElement("div");
        renderContainer.id = this.config.frameId + "-container";
        renderContainer.style.display = "relative";
        renderContainer.style.width = this.config.width;
        renderContainer.style.height = this.config.height || "100%";

        renderContainer.appendChild(iframe);
        renderContainer.appendChild(frameLoader);

        const isSelfReplace = target.parentNode.isEqualNode(
          document.getElementById(this.config.frameId + "-container")
        );

        target && isSelfReplace
          ? target.parentNode.replaceWith(renderContainer)
          : target.replaceWith(renderContainer);

        window.addEventListener("message", this.#onMessage, false);

        this.#isConnected = true;
      }

      window.DocSpace.SDK.frames = window.DocSpace.SDK.frames || [];

      window.DocSpace.SDK.frames[this.config.frameId] = this;

      return iframe;
    }

    initManager(config = {}) {
      config.mode = "manager";

      return this.initFrame(config);
    }

    setIsLoaded() {
      const targetFrame = document.getElementById(this.config.frameId);
      const loader = document.getElementById(this.config.frameId + "-loader");

      if (targetFrame) {
        targetFrame.style.opacity = 1;
        targetFrame.style.position = "relative";
        targetFrame.width = this.config.width;
        targetFrame.height = this.config.height;
        targetFrame.parentNode.style.height = "inherit";

        if (loader) loader.remove();
      }
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

      const targetFrame = document.getElementById(this.config.frameId);

      if (targetFrame) {
        window.removeEventListener("message", this.#onMessage, false);
        this.#isConnected = false;

        delete window.DocSpace.SDK.frames[this.config.frameId];

        targetFrame.parentNode &&
          targetFrame.parentNode.replaceChild(target, targetFrame);
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
