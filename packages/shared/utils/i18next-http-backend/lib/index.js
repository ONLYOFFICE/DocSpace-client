// (c) Copyright Ascensio System SIA 2009-2025
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

import { defaults, makePromise } from "./utils";
import request from "./request";

const getDefaults = () => {
  return {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
    addPath: "/locales/add/{{lng}}/{{ns}}",
    allowMultiLoading: false,
    parse: (data) => JSON.parse(data),
    stringify: JSON.stringify,
    parsePayload: (namespace, key, fallbackValue) => ({
      [key]: fallbackValue || "",
    }),
    request,
    reloadInterval: typeof window !== "undefined" ? false : 60 * 60 * 1000,
    customHeaders: {},
    queryStringParams: {},
    crossDomain: false, // used for XmlHttpRequest
    withCredentials: false, // used for XmlHttpRequest
    overrideMimeType: false, // used for XmlHttpRequest
    requestOptions: {
      // used for fetch
      mode: "cors",
      credentials: "same-origin",
      cache: "default",
    },
  };
};

class Backend {
  constructor(services, options = {}, allOptions = {}) {
    this.services = services;
    this.options = options;
    this.allOptions = allOptions;
    this.type = "backend";
    this.init(services, options, allOptions);
  }

  init(services, options = {}, allOptions = {}) {
    this.services = services;
    this.options = defaults(options, this.options || {}, getDefaults());
    this.allOptions = allOptions;
    if (this.services && this.options.reloadInterval) {
      setInterval(() => this.reload(), this.options.reloadInterval);
    }
  }

  readMulti(languages, namespaces, callback) {
    this._readAny(languages, languages, namespaces, namespaces, callback);
  }

  read(language, namespace, callback) {
    this._readAny([language], language, [namespace], namespace, callback);
  }

  _readAny(
    languages,
    loadUrlLanguages,
    namespaces,
    loadUrlNamespaces,
    callback,
  ) {
    let { loadPath } = this.options;
    if (typeof this.options.loadPath === "function") {
      loadPath = this.options.loadPath(languages, namespaces);
    }

    loadPath = makePromise(loadPath);

    loadPath.then((resolvedLoadPath) => {
      if (!resolvedLoadPath) return callback(null, {});
      const url = this.services.interpolator.interpolate(resolvedLoadPath, {
        lng: languages.join("+"),
        ns: namespaces.join("+"),
      });
      this.loadUrl(url, callback, loadUrlLanguages, loadUrlNamespaces);
    });
  }

  loadUrl(url, callback, languages, namespaces) {
    // console.log("loadUrl", url, languages, namespaces);

    if (!window.i18n) {
      window.i18n = {
        inLoad: [],
        loaded: {},
      };
    }

    const index = window.i18n.inLoad.findIndex((item) => item.url === url);

    if (index > -1) {
      // console.log("skip already in load url", url);
      window.i18n.inLoad[index].callbacks.push(callback);
      return;
    }

    if (window.i18n.loaded[url]) {
      return callback(null, window.i18n.loaded[url].data);
    }

    if (namespaces === "translation") {
      // console.log("skip defaultNS");
      return callback(
        `failed loading ${url}; status code: 404`,
        false /* retry */,
      );
    }

    window.i18n.inLoad.push({ url, callbacks: [callback] });

    this.options.request(this.options, url, undefined, (err, res) => {
      if (res && ((res.status >= 500 && res.status < 600) || !res.status))
        return this.sendCallbacks(
          url,
          namespaces,
          `failed loading ${url}; status code: ${res.status}`,
          true /* retry */,
        );
      if (res && res.status >= 400 && res.status < 500)
        return this.sendCallbacks(
          url,
          namespaces,
          `failed loading ${url}; status code: ${res.status}`,
          false /* no retry */,
        );
      if (
        !res &&
        err &&
        err.message &&
        err.message.indexOf("Failed to fetch") > -1
      )
        return this.sendCallbacks(
          url,
          namespaces,
          `failed loading ${url}: ${err.message}`,
          true /* retry */,
        );
      if (err) return this.sendCallbacks(url, namespaces, err, false);

      let ret;
      let parseErr;
      try {
        if (typeof res.data === "string") {
          ret = this.options.parse(res.data, languages, namespaces);
        } else {
          // fallback, which omits calling the parse function
          ret = res.data;
        }
      } catch (e) {
        parseErr = `failed parsing ${url} to json`;
      }
      if (parseErr) return this.sendCallbacks(url, namespaces, parseErr, false);
      this.sendCallbacks(url, namespaces, null, ret);
    });
  }

  sendCallbacks(url, namespaces, error, data) {
    const index = window.i18n.inLoad.findIndex((item) => item.url === url);
    if (index === -1) return;

    window.i18n.inLoad[index].callbacks.forEach((cb) => cb(error, data));

    window.i18n.inLoad.splice(index, 1);

    if (!error) {
      window.i18n.loaded[url] = {
        namespaces,
        data,
      };
    }
  }

  create(languagesParam, namespace, key, fallbackValue, callback) {
    // If there is a falsey addPath, then abort -- this has been disabled.
    const languages =
      typeof languagesParam === "string" ? [languagesParam] : languagesParam;
    if (!this.options.addPath) return;
    const payload = this.options.parsePayload(namespace, key, fallbackValue);
    let finished = 0;
    const dataArray = [];
    const resArray = [];
    languages.forEach((lng) => {
      let { addPath } = this.options;
      if (typeof this.options.addPath === "function") {
        addPath = this.options.addPath(lng, namespace);
      }
      const url = this.services.interpolator.interpolate(addPath, {
        lng,
        ns: namespace,
      });

      this.options.request(this.options, url, payload, (data, res) => {
        // TODO: if res.status === 4xx do log
        finished += 1;
        dataArray.push(data);
        resArray.push(res);
        if (finished === languages.length) {
          if (callback) callback(dataArray, resArray);
        }
      });
    });
  }

  reload() {
    const { backendConnector, languageUtils, logger } = this.services;
    const currentLanguage = backendConnector.language;
    if (currentLanguage && currentLanguage.toLowerCase() === "cimode") return; // avoid loading resources for cimode

    const toLoad = [];
    const append = (lng) => {
      const lngs = languageUtils.toResolveHierarchy(lng);
      lngs.forEach((l) => {
        if (toLoad.indexOf(l) < 0) toLoad.push(l);
      });
    };

    append(currentLanguage);

    if (this.allOptions.preload)
      this.allOptions.preload.forEach((l) => append(l));

    toLoad.forEach((lng) => {
      this.allOptions.ns.forEach((ns) => {
        backendConnector.read(lng, ns, "read", null, null, (err, data) => {
          if (err)
            logger.warn(
              `loading namespace ${ns} for language ${lng} failed`,
              err,
            );
          if (!err && data)
            logger.log(`loaded namespace ${ns} for language ${lng}`, data);

          backendConnector.loaded(`${lng}|${ns}`, err, data);
        });
      });
    });
  }
}

Backend.type = "backend";

export default Backend;
