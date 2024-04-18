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

import React from "react";
import { hydrateRoot } from "react-dom/client";
// import { registerSW } from "@docspace/shared/sw/helper";
import pkg from "../../package.json";
import { initI18n } from "./helpers/utils";
import ClientApp from "./components/ClientApp";

const propsObj: IInitialState = window.__ASC_INITIAL_LOGIN_STATE__;
const initialI18nStoreASC: IInitialI18nStoreASC = window.initialI18nStoreASC;
const initialLanguage = window.initialLanguage;

const isDesktopEditor = window["AscDesktopEditor"] !== undefined;
if (isDesktopEditor) typeof window["AscDesktopEditor"];

initI18n(initialI18nStoreASC);

const container = document.getElementById("root");
if (container) {
  hydrateRoot(
    container,
    <ClientApp
      initialLanguage={initialLanguage}
      initialI18nStoreASC={initialI18nStoreASC}
      isDesktopEditor={isDesktopEditor}
      {...propsObj}
    />
  );
}

if (IS_DEVELOPMENT) {
  const port = PORT || 5011;
  const socketPath = pkg.socketPath;

  const ws = new WebSocket(`ws://localhost:${port}${socketPath}`);
  let isErrorConnection = false;

  ws.onopen = (event) => {
    console.log("[login-dev] Socket is connected. Live reload enabled");
  };

  ws.onmessage = function (event) {
    if (event.data === "reload") {
      console.log("[login-dev] App updated. Reloading...");
      location.reload();
    }
  };

  ws.onclose = function (event) {
    console.log("[login-dev] Socket is disconnected! Reloading...");
    setTimeout(() => {
      !isErrorConnection && location.reload();
    }, 1500);
  };

  ws.onerror = (event) => {
    isErrorConnection = true;
    console.log("[login-dev] Socket connect error!");
  };
}

// registerSW();
