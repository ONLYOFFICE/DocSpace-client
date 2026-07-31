/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaults, makePromise } from "./utils";
import request from "./request";

const getDefaults = () => {
  return {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
    addPath: "/locales/add/{{lng}}/{{ns}}",
    allowMultiLoading: false,
    // When true, `loadPath` resolves to a single per-language bundle
    // ({ [ns]: translations }) shared by every namespace. The backend fetches
    // it once per language and serves each namespace its slice from cache, so
    // N namespaces cost 1 request instead of N.
    combinedNamespaces: false,
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
    // In combined mode every namespace of a language maps to the same bundle
    // URL, so loadUrl fetches it once and resolves the rest from cache. The
    // cached payload is the whole `{ [ns]: translations }` object — hand each
    // namespace only its own slice.
    if (this.options.combinedNamespaces) {
      const wrapped = (err, data) => {
        if (err) return callback(err, data);
        return callback(null, (data && data[namespace]) || {});
      };
      this._readAny([language], language, [namespace], namespace, wrapped);
      return;
    }
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
      } catch {
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
