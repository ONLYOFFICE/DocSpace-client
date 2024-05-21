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

(function () {
  const FRAME_NAME = "frameDocSpace";

  const defaultConfig = {
    src: new URL(document.currentScript.src).origin,
    rootPath: "/rooms/shared/",
    requestToken: null,
    width: "100%",
    height: "100%",
    name: FRAME_NAME,
    type: "desktop", // TODO: ["desktop", "mobile"]
    frameId: "ds-frame",
    mode: "manager", //TODO: ["manager", "editor", "viewer","room-selector", "file-selector", "system"]
    id: null,
    locale: null,
    theme: "System",
    editorType: "desktop", //TODO: ["desktop", "embedded"]
    editorGoBack: true,
    selectorType: "exceptPrivacyTrashArchiveFolders", //TODO: ["roomsOnly", "userFolderOnly", "exceptPrivacyTrashArchiveFolders", "exceptSortedByTagsFolders"]
    showSelectorCancel: false,
    showSelectorHeader: false,
    showHeader: false,
    showTitle: true,
    showMenu: false,
    showFilter: false,
    showSignOut: true,
    destroyText: "",
    viewAs: "row", //TODO: ["row", "table", "tile"]
    viewTableColumns: "Name,Type,Tags",
    checkCSP: true,
    disableActionButton: false,
    showSettings: false,
    waiting: false,
    withSearch: true,
    withBreadCrumbs: true,
    withSubtitle: true,
    filterParam: "ALL",
    buttonColor: "#5299E0",
    infoPanelVisible: true,
    downloadToEvent: false,
    filter: {
      // filterType: 0,
      // type: 0,
      count: 100,
      page: 1,
      sortorder: "descending", //TODO: ["descending", "ascending"]
      sortby: "DateAndTime", //TODO: ["DateAndTime", "AZ", "Type", "Size", "DateAndTimeCreation", "Author"]
      search: "",
      withSubfolders: false,
    },
    editorCustomization: {},
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
      onDownload: null,
    },
  };

  const lt = /</g;
  const rlt = "&lt;";
  const gt = />/g;
  const rgt = "&rt;";

  const cspErrorText =
    "The current domain is not set in the Content Security Policy (CSP) settings.";

  const validateCSP = async (targetSrc) => {
    let currentSrc = window.location.origin;

    if (currentSrc.indexOf(targetSrc) !== -1) return; // skip check for the same domain

    const response = await fetch(`${targetSrc}/api/2.0/security/csp`);
    const res = await response.json();

    currentSrc = window.location.host || new URL(window.location.origin).host; // more flexible way to check

    const domains = [...res.response.domains].map((d) => {
      try {
        const domain = new URL(d.toLowerCase());
        const domainFull =
          domain.host + (domain.pathname !== "/" ? domain.pathname : "");

        return domainFull;
      } catch {
        return d;
      }
    });

    const passed = domains.includes(currentSrc.toLowerCase());

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

  /**
   * Represents the DocSpace class.
   * @class
   */
  class DocSpace {
    #isConnected = false;
    #frameOpacity = 0;
    #callbacks = [];
    #tasks = [];
    #classNames = "";

    constructor(config) {
      this.config = config;
    }

    /**
     * Checks if any of the keys in the given array exist in the provided object.
     *
     * @param {Array} array - The array of keys to check.
     * @param {Object} object - The object to check against.
     * @returns {boolean} - Returns true if any of the keys exist in the object, otherwise false.
     */
    #oneOfExistInObject = (array, object) => {
      return Object.keys(object).some((k) => array.includes(k));
    };

    /**
     * Creates a loader element with the specified configuration.
     *
     * @param {Object} config - The configuration object for the loader.
     * @param {string} config.width - The width of the loader container.
     * @param {string} config.height - The height of the loader container.
     * @param {string} config.src - The source path for the loader image.
     * @param {string} config.theme - The theme of the loader (e.g., "Dark", "System").
     * @param {string} config.frameId - The ID of the loader frame.
     * @returns {HTMLElement} The loader container element.
     */
    #createLoader = (config) => {
      const container = document.createElement("div");
      container.style.width = config.width;
      container.style.height = config.height;
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.alignItems = "center";

      // const loader = document.createElement("img");
      // loader.setAttribute("src", `${config.src}/static/images/loader.svg`);
      // loader.setAttribute("width", `64px`);
      // loader.setAttribute("height", `64px`);

      // if (
      //   config.theme === "Dark" ||
      //   (config.theme === "System" &&
      //     window.matchMedia("(prefers-color-scheme: dark)"))
      // ) {
      //   container.style.backgroundColor = "#333333";
      //   loader.style.filter =
      //     "invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%)";
      // }

      const loader = document.createElement("div");
      const loaderClass = `${config.frameId}-loader__element`;
      loader.setAttribute("class", loaderClass);

      container.appendChild(loader);

      const style = document.createElement("style");
      style.innerHTML = `
      @keyframes rotate {
        0%{
          transform: rotate(-45deg);
        }
        15%{
          transform: rotate(45deg);
        }
        30%{
          transform: rotate(135deg);
        }
        45%{
          transform: rotate(225deg);
        }
        60%, 100%{
          transform: rotate(315deg);
        }
      }
      
    .${loaderClass} {
      width: 74px;
      height: 74px;

      border: 4px solid rgba(51,51,51, 0.1);
      border-top-color: #333333;
      border-radius: 50%;

      transform: rotate(-45deg);
     
      position: relative;

      box-sizing: border-box;

      animation: 1s linear infinite rotate;
    }

    @media (prefers-color-scheme: dark) {
      .${loaderClass} {
        border-color: rgba(204, 204, 204, 0.1);
        border-top-color: #CCCCCC;
      }
    }
    `;

      container.appendChild(style);

      container.setAttribute("id", config.frameId + "-loader");

      return container;
    };

    /**
     * Creates a button view based on the provided configuration.
     *
     * @param {Object} config - The configuration object for the button view.
     * @param {string} config.buttonColor - The background color of the button. Defaults to "#5299E0".
     * @param {boolean} config.buttonWithLogo - Determines whether the button should include a logo. Defaults to false.
     * @param {string} config.buttonText - The text to display on the button. Defaults to "Select to DocSpace".
     * @param {string} config.src - The source URL for the logo image.
     * @param {string} config.frameId - The ID of the container element for the button.
     * @param {Object} config.events - The event callbacks for the button.
     * @param {Function} config.events.onSelectCallback - The callback function to be executed when an item is selected.
     * @param {Function} config.events.onCloseCallback - The callback function to be executed when the button view is closed.
     * @param {Function} config.events.onAppReady - The callback function to be executed when the DocSpace app is ready.
     * @param {Function} config.events.onAppError - The callback function to be executed when an error occurs in the DocSpace app.
     * @param {Function} config.events.onEditorCloseCallback - The callback function to be executed when the editor is closed.
     * @param {Function} config.events.onAuthSuccess - The callback function to be executed when authentication is successful.
     * @param {Function} config.events.onSignOut - The callback function to be executed when the user signs out.
     * @returns {HTMLButtonElement} The created button element.
     */
    #createButtonView = (config) => {
      const button = document.createElement("button");
      button.style.backgroundColor = config?.buttonColor || "#5299E0";
      button.style.color = "#fff";
      button.style.padding = "0 28px";
      button.style.borderRadius = "3px";
      button.style.border = `1px solid #5299E0`;
      button.style.height = "32px";
      button.style.fontWeight = "600";
      button.style.fontFamily = "Open Sans";
      button.style.cursor = "pointer";
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.style.gap = "10px";
      button.style.userSelect = "none";
      button.style.borderColor = config?.buttonColor || "#5299E0";

      const logoSrc = `${config.src}/static/images/light_small_logo.react.svg`;

      button.innerHTML = `${config?.buttonWithLogo ? `<img width="16px" heigth="16px" src="${logoSrc}" />` : ""}${config?.buttonText || "Select to DocSpace"}`;
      const url = new URL(document.currentScript.src);
      const scriptUrl = `${url.origin}${url.pathname}`;

      const configStringify = JSON.stringify(config, function (key, val) {
        return typeof val === "function" ? "" + val : val;
      })
        .replace(lt, rlt)
        .replace(gt, rgt);

      const windowHeight = 778,
        windowWidth = 610;

      button.addEventListener("click", () => {
        const winHtml = `<!DOCTYPE html>
          <html>
              <head>
                  <meta charset="UTF-8">
                  <title>DocSpace</title>

                  <style>
                    #${config.frameId}-container {
                      height: 100lvh !important;
                      width: 100lvw !important;
                      overflow: hidden;
                    }

                    html, body {
                        height: 100%;
                        width: 100%;
                    }

                    body {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                </style>
              </head>
              <body style="margin:0;">
                  <div id=${config.frameId}></div>
                  <script id="integration">
                    const config = {...${configStringify}, width: "100%", height: "100%", events: {
                      onSelectCallback: eval(${config.events.onSelectCallback + ""}),
                      onCloseCallback: eval(${config.events.onCloseCallback + ""}),
                      onAppReady: eval(${config.events.onAppReady + ""}),
                      onAppError: eval(${config.events.onAppError + ""}),
                      onEditorCloseCallback: eval(${config.events.onEditorCloseCallback + ""}),
                      onAuthSuccess: eval(${config.events.onAuthSuccess + ""}),
                      onSignOut: eval(${config.events.onSignOut + ""}),
                    }}
                    
                    const script = document.createElement("script");
                    
                    script.setAttribute("src", "${scriptUrl}");
                    script.onload = () => window.DocSpace.SDK.initFrame(config);
                    
                    document.body.appendChild(script);
                  </script>
              </body>
          </html>`;

        const winUrl = URL.createObjectURL(
          new Blob([winHtml], { type: "text/html" })
        );

        window.open(
          winUrl,
          "_blank",
          `width=${windowWidth},height=${windowHeight}`
        );
      });

      button.setAttribute("id", config.frameId + "-container");

      return button;
    };

    /**
     * Creates an iframe element based on the provided configuration.
     *
     * @param {Object} config - The configuration object for creating the iframe.
     * @param {string} config.mode - The mode of the iframe.
     * @param {Object} config.filter - The filter object for the iframe.
     * @param {string} config.id - The ID of the iframe.
     * @param {string} config.requestToken - The request token for the iframe.
     * @param {boolean} config.withSubfolders - Indicates whether to include subfolders in the iframe.
     * @param {string} config.rootPath - The root path for the iframe.
     * @param {string} config.editorGoBack - The go back option for the editor iframe.
     * @param {Object} config.editorCustomization - The customization object for the editor iframe.
     * @param {string} config.theme - The theme for the editor iframe.
     * @param {Function} config.events.onEditorCloseCallback - The callback function for the editor close event.
     * @param {string} config.editorType - The type of the editor iframe.
     * @param {string} config.action - The action for the viewer iframe.
     * @param {string} config.src - The source URL for the iframe.
     * @param {string} config.width - The width of the iframe.
     * @param {string} config.height - The height of the iframe.
     * @param {string} config.name - The name of the iframe.
     * @param {string} config.frameId - The ID of the iframe.
     * @param {string} config.type - The type of the iframe.
     * @param {boolean} config.checkCSP - Indicates whether to check the Content Security Policy.
     * @returns {HTMLIFrameElement} The created iframe element.
     */
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
          config.editorCustomization.uiTheme = config.theme;

          if (!config.id || config.id === "undefined" || config.id === "null") {
            config.id = -1; //editor default wrong file id error
          }

          const customization = JSON.stringify(config.editorCustomization);

          if (
            config.events.onEditorCloseCallback &&
            typeof config.events.onEditorCloseCallback === "function"
          ) {
            goBack = "event";
          }

          path = `/doceditor/?fileId=${config.id}&editorType=${config.editorType}&editorGoBack=${goBack}&customization=${customization}`;

          if (config.requestToken) {
            path = `${path}&share=${config.requestToken}`;
          }

          break;
        }

        case "viewer": {
          let goBack = config.editorGoBack;
          config.editorCustomization.uiTheme = config.theme;

          if (!config.id || config.id === "undefined" || config.id === "null") {
            config.id = -1; //editor default wrong file id error
          }

          const customization = JSON.stringify(config.editorCustomization);

          if (
            config.events.onEditorCloseCallback &&
            typeof config.events.onEditorCloseCallback === "function"
          ) {
            goBack = "event";
          }

          path = `/doceditor/?fileId=${config.id}&editorType=${config.editorType}&action=view&editorGoBack=${goBack}&customization=${customization}`;

          if (config.requestToken) {
            path = `${path}&share=${config.requestToken}`;
          }

          break;
        }

        default:
          path = config.rootPath;
      }

      iframe.src = config.src + path;
      iframe.style.width = config.width;
      iframe.style.height = config.height;
      iframe.name = `${FRAME_NAME}__#${config.frameId}`;
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

    /**
     * Sends a message to the specified frame.
     * @param {any} message - The message to be sent.
     */
    #sendMessage = (message) => {
      let mes = {
        frameId: this.config.frameId,
        type: "",
        data: message,
      };

      const targetFrame = document.getElementById(this.config.frameId);

      if (targetFrame && !!targetFrame.contentWindow) {
        targetFrame.contentWindow.postMessage(
          JSON.stringify(mes, (key, value) =>
            typeof value === "function" ? value.toString() : value
          ),
          this.config.src
        );
      }
    };

    /**
     * Handles incoming messages from the server.
     *
     * @param {MessageEvent} e - The message event object.
     */
    #onMessage = (e) => {
      if (typeof e.data == "string") {
        let data = {};

        try {
          data = JSON.parse(e.data);
        } catch (err) {
          data = {};
        }

        if (this.config.frameId !== data.frameId) {
          return;
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
            if (Object.keys(this.config).length === 0) return;
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

    /**
     * Executes a method on the message bus.
     *
     * @param {string} methodName - The name of the method to execute.
     * @param {any} params - The parameters to pass to the method.
     * @param {Function} callback - The callback function to be called after the method execution.
     * @returns {void}
     */
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

    /**
     * Initializes the button with the provided configuration.
     *
     * @param {Object} config - The configuration object for the button.
     * @returns {HTMLElement} - The initialized button element.
     */
    initButton(config) {
      const configFull = { ...defaultConfig, ...config };
      this.config = {
        ...this.config,
        ...configFull,
        events: { ...defaultConfig.events },
      };

      const target = document.getElementById(this.config.frameId);

      let button = null;

      if (target) {
        button = this.#createButtonView(this.config);

        this.#classNames = target.className;

        const isSelfReplace = target.parentNode.isEqualNode(
          document.getElementById(this.config.frameId + "-container")
        );

        target && isSelfReplace
          ? target.parentNode.replaceWith(button)
          : target.replaceWith(button);

        window.addEventListener("message", this.#onMessage, false);

        this.#isConnected = true;
      }

      window.DocSpace.SDK.frames = window.DocSpace.SDK.frames || [];

      window.DocSpace.SDK.frames[this.config.frameId] = this;

      return button;
    }

    /**
     * Initializes the frame with the provided configuration.
     *
     * @param {Object} config - The configuration object for the frame.
     * @returns {HTMLIFrameElement} - The created iframe element.
     */
    initFrame(config) {
      const configFull = { ...defaultConfig, ...config };
      Object.entries(configFull).map(([key, value]) => {
        if (typeof value === "string")
          configFull[key] = value.replaceAll(rlt, "<").replaceAll(rgt, ">");
      });
      this.config = { ...this.config, ...configFull };

      const target = document.getElementById(this.config.frameId);

      let iframe = null;

      if (target) {
        iframe = this.#createIframe(this.config);

        iframe.style.opacity = this.#frameOpacity;
        iframe.style.zIndex = 2;
        iframe.style.position = "absolute";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.top = 0;
        iframe.style.left = 0;

        const frameLoader = this.#createLoader(this.config);

        this.#classNames = target.className;

        const renderContainer = document.createElement("div");
        renderContainer.id = this.config.frameId + "-container";
        renderContainer.classList = ["frame-container"];
        renderContainer.style.position = "relative";
        renderContainer.style.width = "100%";
        renderContainer.style.height = "100%";

        if (!this.config.waiting || this.config.mode === "system") {
          renderContainer.appendChild(iframe);
        }

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

      window.DocSpace.SDK.frames = window.DocSpace.SDK.frames || {};

      window.DocSpace.SDK.frames[this.config.frameId] = this;

      return iframe;
    }

    /**
     * Initializes the manager mode.
     * @param {Object} config - The configuration object.
     * @returns {Promise} A promise that resolves when the frame is initialized.
     */
    initManager(config = {}) {
      config.mode = "manager";

      return this.initFrame(config);
    }

    /**
     * Sets the loaded state of the target frame and removes the loader element.
     */
    setIsLoaded() {
      const targetFrame = document.getElementById(this.config.frameId);
      const loader = document.getElementById(this.config.frameId + "-loader");

      if (targetFrame) {
        targetFrame.style.opacity = 1;
        targetFrame.style.position = "relative";
        targetFrame.style.width = this.config.width;
        targetFrame.style.height = this.config.height;
        targetFrame.parentNode.style.height = "inherit";

        if (loader) loader.remove();
      }
    }

    /**
     * Initializes the editor.
     * @param {Object} config - The configuration object for the editor.
     * @returns {Object} - The initialized frame object.
     */
    initEditor(config = {}) {
      config.mode = "editor";

      return this.initFrame(config);
    }

    /**
     * Initializes the viewer mode.
     * @param {Object} config - The configuration object.
     * @returns {Promise} A promise that resolves when the viewer is initialized.
     */
    initViewer(config = {}) {
      config.mode = "viewer";

      return this.initFrame(config);
    }

    /**
     * Initializes the room selector.
     *
     * @param {Object} config - The configuration object.
     * @returns {Object} - The initialized frame.
     */
    initRoomSelector(config = {}) {
      config.mode = "room-selector";

      return this.initFrame(config);
    }

    /**
     * Initializes the file selector mode.
     * @param {Object} config - The configuration object.
     * @returns {Object} - The initialized frame.
     */
    initFileSelector(config = {}) {
      config.mode = "file-selector";

      return this.initFrame(config);
    }

    /**
     * Initializes the system with the given configuration.
     * @param {Object} config - The configuration object.
     * @returns {Promise} A promise that resolves when the system is initialized.
     */
    initSystem(config = {}) {
      config.mode = "system";

      return this.initFrame(config);
    }

    /**
     * Destroys the frame and cleans up associated resources.
     */
    destroyFrame() {
      const target = document.createElement("div");

      target.setAttribute("id", this.config.frameId);
      target.innerHTML = this.config.destroyText;
      target.className = this.#classNames;

      const targetFrame = document.getElementById(
        this.config.frameId + "-container"
      );

      window.removeEventListener("message", this.#onMessage, false);
      this.#isConnected = false;

      delete window.DocSpace.SDK.frames[this.config.frameId];

      targetFrame?.parentNode?.replaceChild(target, targetFrame);

      this.config = {};
    }

    /**
     * Retrieves a method promise.
     *
     * @param {string} methodName - The name of the method.
     * @param {Object|null} params - The parameters for the method (optional).
     * @param {boolean} withReload - Indicates whether to reload the configuration (optional).
     * @returns {Promise} A promise that resolves with the method data.
     */
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

    /**
     * Retrieves folder information.
     * @returns {Promise} A promise that resolves with the folder information.
     */
    getFolderInfo() {
      return this.#getMethodPromise("getFolderInfo");
    }

    /**
     * Retrieves the current selection.
     * @returns {Promise} A promise that resolves with the current selection.
     */
    getSelection() {
      return this.#getMethodPromise("getSelection");
    }

    /**
     * Retrieves the files from the server.
     * @returns {Promise} A promise that resolves with the files.
     */
    getFiles() {
      return this.#getMethodPromise("getFiles");
    }

    /**
     * Retrieves the folders from the server.
     * @returns {Promise} A promise that resolves with the folders data.
     */
    getFolders() {
      return this.#getMethodPromise("getFolders");
    }

    /**
     * Retrieves a list of items.
     * @returns {Promise} A promise that resolves with the list of items.
     */
    getList() {
      return this.#getMethodPromise("getList");
    }

    /**
     * Retrieves rooms based on the provided filter.
     *
     * @param {Object} filter - The filter object to apply when retrieving rooms.
     * @returns {Promise} A promise that resolves with the retrieved rooms.
     */
    getRooms(filter) {
      return this.#getMethodPromise("getRooms", filter);
    }

    /**
     * Retrieves user information.
     * @returns {Promise} A promise that resolves with the user information.
     */
    getUserInfo() {
      return this.#getMethodPromise("getUserInfo");
    }

    /**
     * Retrieves the configuration object.
     * @returns {Object} The configuration object.
     */
    getConfig() {
      return this.config;
    }

    /**
     * Retrieves the hash settings.
     * @returns {Promise} A promise that resolves with the hash settings.
     */
    getHashSettings() {
      return this.#getMethodPromise("getHashSettings");
    }

    /**
     * Sets the configuration for the API.
     *
     * @param {Object} newConfig - The new configuration object.
     * @param {boolean} [reload=false] - Indicates whether to reload the API after setting the configuration.
     * @returns {Promise} A promise that resolves when the configuration is set.
     */
    setConfig(newConfig = {}, reload = false) {
      if (this.#oneOfExistInObject(this.config.keysForReload, newConfig))
        reload = true;

      this.config = { ...this.config, ...newConfig };

      return this.#getMethodPromise("setConfig", this.config, reload);
    }

    /**
     * Opens a modal with the specified type and options.
     *
     * @param {string} type - The type of the modal.
     * @param {object} options - The options for the modal.
     * @returns {Promise} A promise that resolves when the modal is opened.
     */
    openModal(type, options) {
      return this.#getMethodPromise("openModal", { type, options });
    }

    /**
     * Creates a file with the specified parameters.
     *
     * @param {string} folderId - The ID of the folder where the file will be created.
     * @param {string} title - The title of the file.
     * @param {string} templateId - The ID of the template to be used for the file.
     * @param {string} formId - The ID of the form associated with the file.
     * @returns {Promise} A promise that resolves with the created file.
     */
    createFile(folderId, title, templateId, formId) {
      return this.#getMethodPromise("createFile", {
        folderId,
        title,
        templateId,
        formId,
      });
    }

    /**
     * Creates a new folder with the given parent folder ID and title.
     *
     * @param {string} parentFolderId - The ID of the parent folder.
     * @param {string} title - The title of the new folder.
     * @returns {Promise} A promise that resolves with the result of the createFolder operation.
     */
    createFolder(parentFolderId, title) {
      return this.#getMethodPromise("createFolder", {
        parentFolderId,
        title,
      });
    }

    /**
     * Creates a new room with the specified title and room type.
     * @param {string} title - The title of the room.
     * @param {string} roomType - The type of the room.
     * @returns {Promise} A promise that resolves with the created room.
     */
    createRoom(title, roomType) {
      return this.#getMethodPromise("createRoom", {
        title,
        roomType,
      });
    }

    /**
     * Sets the view type for the list of items.
     *
     * @param {string} type - The type of view to set.
     * @returns {Promise} - A promise that resolves when the view type is set.
     */
    setListView(type) {
      return this.#getMethodPromise("setItemsView", type);
    }

    /**
     * Creates a hash for the given password using the specified hash settings.
     *
     * @param {string} password - The password to be hashed.
     * @param {object} hashSettings - The settings for the hash algorithm.
     * @returns {Promise} A promise that resolves to the generated hash.
     */
    createHash(password, hashSettings) {
      return this.#getMethodPromise("createHash", { password, hashSettings });
    }

    /**
     * Logs in a user with the provided email and password hash.
     * @param {string} email - The user's email address.
     * @param {string} passwordHash - The hashed password.
     * @returns {Promise} A promise that resolves with the login response.
     */
    login(email, passwordHash) {
      return this.#getMethodPromise("login", { email, passwordHash });
    }

    /**
     * Logs out the user.
     * @returns {Promise} A promise that resolves when the user is logged out.
     */
    logout() {
      return this.#getMethodPromise("logout");
    }

    /**
     * Creates a new tag with the given name.
     *
     * @param {string} name - The name of the tag.
     * @returns {Promise} A promise that resolves when the tag is created.
     */
    createTag(name) {
      return this.#getMethodPromise("createTag", name);
    }

    /**
     * Adds tags to a room.
     *
     * @param {string} roomId - The ID of the room.
     * @param {string[]} tags - An array of tags to add.
     * @returns {Promise} A promise that resolves when the tags are added successfully.
     */
    addTagsToRoom(roomId, tags) {
      return this.#getMethodPromise("addTagsToRoom", { roomId, tags });
    }

    /**
     * Removes tags from a room.
     *
     * @param {string} roomId - The ID of the room.
     * @param {string[]} tags - An array of tags to be removed.
     * @returns {Promise} A promise that resolves when the tags are successfully removed.
     */
    removeTagsFromRoom(roomId, tags) {
      return this.#getMethodPromise("removeTagsFromRoom", { roomId, tags });
    }
  }

  /**
   * Represents the DocSpace SDK.
   * @class
   */
  class DocSpaceSDK {
    frames = {};
    instances = [];

    /**
     * Initializes a new instance of the DocSpace class and initializes the frame.
     * @param {Object} config - The configuration object for initializing the DocSpace instance.
     * @returns {DocSpace} The initialized DocSpace instance.
     */
    initFrame = (config) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initFrame(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initFrame(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes a button with the provided configuration.
     * @param {Object} config - The configuration object for the button.
     * @returns {DocSpace} - An instance of the DocSpace class.
     */
    initButton = (config) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initButton(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initButton(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the editor.
     *
     * @param {Object} config - The configuration object for the editor.
     * @returns {DocSpace} The initialized DocSpace instance.
     */
    initEditor = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initEditor(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initEditor(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the viewer.
     * @param {Object} config - The configuration object for the viewer.
     * @returns {DocSpace} - The initialized DocSpace instance.
     */
    initViewer = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initViewer(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initViewer(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the room selector.
     *
     * @param {Object} config - The configuration object.
     * @returns {DocSpace} The instance of the DocSpace class.
     */
    initRoomSelector = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initRoomSelector(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initRoomSelector(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the file selector.
     *
     * @param {Object} config - The configuration object.
     * @returns {DocSpace} The initialized DocSpace instance.
     */
    initFileSelector = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initFileSelector(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initFileSelector(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the manager for DocSpace.
     * @param {Object} config - The configuration object for the manager.
     * @returns {DocSpace} The initialized DocSpace instance.
     */
    initManager = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initManager(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initManager(config);

      this.instances.push(instance);

      return instance;
    };

    /**
     * Initializes the DocSpace system.
     *
     * @param {Object} config - The configuration object for initializing the system.
     * @returns {DocSpace} - The initialized DocSpace instance.
     */
    initSystem = (config = {}) => {
      const existInstance = this.instances.find(
        (i) => i.config.frameId === config.frameId
      );

      if (existInstance) {
        existInstance.initSystem(config);
        return existInstance;
      }

      const instance = new DocSpace(config);

      instance.initSystem(config);

      this.instances.push(instance);

      return instance;
    };
  }

  window.DocSpace = window.DocSpace || {};

  const config = getConfigFromParams();

  window.DocSpace.SDK = window.DocSpace.SDK || new DocSpaceSDK();

  if (config.init) {
    config?.isButtonMode
      ? window.DocSpace.SDK.initButton(config)
      : window.DocSpace.SDK.initFrame(config);
  }
})();
