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

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-import-module-exports */
// const pkg = require("../package.json");

const comPkg = require("../package.json");

const deps = comPkg.dependencies || {};
const compDeps = comPkg.dependencies || {};

module.exports = {
  react: {
    singleton: true,
    requiredVersion: deps.react,
  },
  "react-dom": {
    singleton: true,
    requiredVersion: deps["react-dom"],
  },

  "react-router": {
    singleton: true,
    requiredVersion: deps["react-router"],
  },
  "styled-components": {
    singleton: true,
    requiredVersion: deps["styled-components"],
  },
  mobx: {
    singleton: true,
    requiredVersion: deps.mobx,
  },
  "mobx-react": {
    singleton: true,
    requiredVersion: deps["mobx-react"],
  },
  moment: {
    singleton: true,
    requiredVersion: deps.moment,
  },
  "email-addresses": {
    singleton: true,
    requiredVersion: compDeps["email-addresses"],
  },
  "fast-deep-equal": {
    singleton: true,
    requiredVersion: deps["fast-deep-equal"],
  },
  "@babel/runtime": {
    singleton: true,
    requiredVersion: deps["@babel/runtime"],
  },
  "rc-tree": {
    singleton: true,
    requiredVersion: compDeps["rc-tree"],
  },
  "react-autosize-textarea": {
    singleton: true,
    requiredVersion: deps["react-autosize-textarea"],
  },
  "react-content-loader": {
    singleton: true,
    requiredVersion: deps["react-content-loader"],
  },
  "react-toastify": {
    singleton: true,
    requiredVersion: compDeps["react-toastify"],
  },
  "react-window-infinite-loader": {
    singleton: true,
    requiredVersion: deps["react-window-infinite-loader"],
  },
  "react-virtualized-auto-sizer": {
    singleton: true,
    requiredVersion: deps["react-virtualized-auto-sizer"],
  },
  "re-resizable": {
    singleton: true,
    requiredVersion: deps["re-resizable"],
  },
  "workbox-window": {
    singleton: true,
    requiredVersion: deps["workbox-window"],
  },
  axios: {
    singleton: true,
    requiredVersion: deps.axios,
  },
  i18next: {
    singleton: true,
    requiredVersion: deps.i18next,
  },
  "react-i18next": {
    singleton: true,
    requiredVersion: deps["react-i18next"],
  },
  "prop-types": {
    singleton: true,
    requiredVersion: deps["prop-types"],
  },
  "react-device-detect": {
    singleton: true,
    requiredVersion: compDeps["react-device-detect"],
    // eager: true,
  },
  "react-dropzone": {
    singleton: true,
    requiredVersion: compDeps["react-dropzone"],
  },
  "react-onclickoutside": {
    singleton: true,
    requiredVersion: compDeps["react-onclickoutside"],
  },
  "react-player": {
    singleton: true,
    requiredVersion: deps["react-player"],
  },
  // "react-resize-detector": {
  //   singleton: true,
  //   requiredVersion: deps["react-resize-detector"],
  // },
  "react-svg": {
    singleton: true,
    requiredVersion: compDeps["react-svg"],
  },
  "react-text-mask": {
    singleton: true,
    requiredVersion: compDeps["react-text-mask"],
  },
  "resize-image": {
    singleton: true,
    requiredVersion: compDeps["resize-image"],
  },
  "react-tooltip": {
    singleton: true,
    requiredVersion: deps["react-tooltip"],
  },
  "react-viewer": {
    singleton: true,
    requiredVersion: deps["react-viewer"],
  },
  "react-window": {
    singleton: true,
    requiredVersion: deps["react-window"],
  },
  "react-hammerjs": {
    singleton: true,
    requiredVersion: deps["react-hammerjs"],
  },
  screenfull: {
    singleton: true,
    requiredVersion: deps.screenfull,
  },
  sjcl: {
    singleton: true,
    requiredVersion: deps.sjcl,
  },
  "query-string": {
    singleton: true,
    requiredVersion: deps["query-string"],
  },
};
