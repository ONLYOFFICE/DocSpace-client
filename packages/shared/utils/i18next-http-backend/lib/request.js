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

/* eslint-disable @typescript-eslint/no-unused-expressions */

import { defaults, hasXMLHttpRequest } from "./utils";
import * as fetchNode from "./getFetch.cjs";

let fetchApi;
if (typeof fetch === "function") {
  if (typeof global !== "undefined" && global.fetch) {
    fetchApi = global.fetch;
  } else if (typeof window !== "undefined" && window.fetch) {
    fetchApi = window.fetch;
  }
}
let XmlHttpRequestApi;
if (hasXMLHttpRequest()) {
  if (typeof global !== "undefined" && global.XMLHttpRequest) {
    XmlHttpRequestApi = global.XMLHttpRequest;
  } else if (typeof window !== "undefined" && window.XMLHttpRequest) {
    XmlHttpRequestApi = window.XMLHttpRequest;
  }
}
let ActiveXObjectApi;
if (typeof ActiveXObject === "function") {
  if (typeof global !== "undefined" && global.ActiveXObject) {
    ActiveXObjectApi = global.ActiveXObject;
  } else if (typeof window !== "undefined" && window.ActiveXObject) {
    ActiveXObjectApi = window.ActiveXObject;
  }
}
if (!fetchApi && fetchNode && !XmlHttpRequestApi && !ActiveXObjectApi)
  fetchApi = fetchNode.default || fetchNode; // because of strange export
if (typeof fetchApi !== "function") fetchApi = undefined;

const addQueryString = (urlParam, params) => {
  let url = urlParam;
  if (params && typeof params === "object") {
    let queryString = "";
    // Must encode data
    for (const paramName in params) {
      queryString += `&${encodeURIComponent(paramName)}=${encodeURIComponent(
        params[paramName],
      )}`;
    }
    if (!queryString) return url;
    url = url + (url.indexOf("?") !== -1 ? "&" : "?") + queryString.slice(1);
  }
  return url;
};

// fetch api stuff
const requestWithFetch = (options, urlParam, payload, callback) => {
  let url = urlParam;
  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams);
  }
  const headers = defaults(
    {},
    typeof options.customHeaders === "function"
      ? options.customHeaders()
      : options.customHeaders,
  );
  if (payload) headers["Content-Type"] = "application/json";
  fetchApi(
    url,
    defaults(
      {
        method: payload ? "POST" : "GET",
        body: payload ? options.stringify(payload) : undefined,
        headers,
      },
      typeof options.requestOptions === "function"
        ? options.requestOptions(payload)
        : options.requestOptions,
    ),
  )
    .then((response) => {
      if (!response.ok)
        return callback(response.statusText || "Error", {
          status: response.status,
        });
      response
        .text()
        .then((data) => {
          callback(null, { status: response.status, data });
        })
        .catch(callback);
    })
    .catch(callback);
};

// xml http request stuff
const requestWithXmlHttpRequest = (
  options,
  urlParam,
  payloadParam,
  callback,
) => {
  let payload = payloadParam;
  let url = urlParam;

  if (payload && typeof payload === "object") {
    // if (!cache) payload._t = Date.now()
    // URL encoded form payload must be in querystring format
    payload = addQueryString("", payload).slice(1);
  }

  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams);
  }

  try {
    let x;
    if (XmlHttpRequestApi) {
      x = new XmlHttpRequestApi();
    } else {
      x = new ActiveXObjectApi("MSXML2.XMLHTTP.3.0");
    }
    x.open(payload ? "POST" : "GET", url, 1);
    if (!options.crossDomain) {
      x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    }
    x.withCredentials = !!options.withCredentials;
    if (payload) {
      x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    if (x.overrideMimeType) {
      x.overrideMimeType("application/json");
    }
    let h = options.customHeaders;
    h = typeof h === "function" ? h() : h;
    if (h) {
      for (const i in h) {
        x.setRequestHeader(i, h[i]);
      }
    }
    x.onreadystatechange = () => {
      x.readyState > 3 &&
        callback(x.status >= 400 ? x.statusText : null, {
          status: x.status,
          data: x.responseText,
        });
    };
    x.send(payload);
  } catch (e) {
    console && console.log(e);
  }
};

const request = (options, url, payloadParam, callbackParam) => {
  let callback = callbackParam;
  let payload = payloadParam;

  if (typeof payload === "function") {
    callback = payload;
    payload = undefined;
  }
  callback = callback || (() => {});

  if (fetchApi) {
    // use fetch api
    return requestWithFetch(options, url, payload, callback);
  }

  if (hasXMLHttpRequest() || typeof ActiveXObject === "function") {
    // use xml http request
    return requestWithXmlHttpRequest(options, url, payload, callback);
  }
};

export default request;
