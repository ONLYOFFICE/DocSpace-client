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

// import React from "react";
// import ReactDOM from "react-dom";
import i18n from "i18next";
import { Workbox } from "workbox-window";
import { initReactI18next } from "react-i18next";

// import { SnackBar } from "../components/snackbar";
import Backend from "../utils/i18next-http-backend";
import { LANGUAGE } from "../constants";
import { getCookie } from "../utils/cookie";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: getCookie(LANGUAGE) || "en",
    fallbackLng: "en",
    load: "currentOnly",
    // debug: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      format(value, format) {
        if (format === "lowercase") return value.toLowerCase();
        return value;
      },
    },

    backend: {
      loadPath: loadLanguagePath(""),
    },

    react: {
      useSuspense: false,
    },
  });

// const SnackBarWrapper = (props) => {
//   const { t, ready } = useTranslation("Common", { i18n });

//   const { onButtonClick } = props;

//   if (ready) {
//     const barConfig = {
//       parentElementId: "snackbar",
//       text: t("Common:NewVersionAvailable"),
//       btnText: t("Common:Load"),
//       onAction: () => onButtonClick(),
//       opacity: 1,
//       countDownTime: 5 * 60 * 1000,
//     };

//     return <SnackBar {...barConfig} />;
//   }
//   return null;
// };

function register() {
  if (
    process.env.NODE_ENV !== "production" &&
    !("serviceWorker" in navigator)
  ) {
    console.log("SKIP registerSW because of DEV mode");
    return;
  }

  const wb = new Workbox(`/sw.js`);

  const showSkipWaitingPrompt = () => {
    console.log(
      `A new service worker has installed, but it can't activate` +
        `until all tabs running the current version have fully unloaded.`,
    );

    function refresh() {
      wb.addEventListener("controlling", () => {
        localStorage.removeItem("sw_need_activation");
        window.location.reload();
      });

      // This will postMessage() to the waiting service worker.
      wb.messageSkipWaiting();
    }

    try {
      const snackbarNode = document.createElement("div");
      snackbarNode.id = "snackbar";
      document.body.appendChild(snackbarNode);

      // ReactDOM.render(
      //   <SnackBarWrapper
      //     onButtonClick={() => {
      //       snackbarNode.remove();
      //       refresh();
      //     }}
      //   />,
      //   document.getElementById("snackbar"),
      // );

      localStorage.setItem("sw_need_activation", true);
    } catch (e) {
      console.error("showSkipWaitingPrompt", e);
      refresh();
    }
  };

  window.addEventListener("beforeunload", async () => {
    if (localStorage.getItem("sw_need_activation")) {
      localStorage.removeItem("sw_need_activation");
      wb.messageSkipWaiting();
    }
  });

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener("waiting", showSkipWaitingPrompt);

  wb.register()
    .then((reg) => {
      console.log("Successful service worker registration", reg);

      if (!window.swUpdateTimer) {
        console.log("SW timer checks for updates every hour");
        window.swUpdateTimer = setInterval(
          () => {
            console.log("SW update timer check");
            reg.update().catch((e) => {
              console.error("SW update timer FAILED", e);
            });
          },
          60 * 60 * 1000,
        );
      }
    })
    .catch((err) => console.error("Service worker registration failed", err));
}

export default register;
