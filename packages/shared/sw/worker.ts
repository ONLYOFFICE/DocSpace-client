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

import { Workbox } from "workbox-window";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import { LANGUAGE } from "../constants";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    load: "currentOnly",
    ns: ["Common"],
    defaultNS: "Common",
    backend: {
      backendOptions: [
        {
          loadPath: "../../client/public/locales/{{lng}}/{{ns}}.json",
        },
        {
          loadPath: "../../../public/locales/{{lng}}/{{ns}}.json",
        },
      ],
    },
    lng: localStorage.getItem(LANGUAGE) || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

interface SwUpdateOptions {
  onUpdate?: () => void;
  onInstalled?: () => void;
  onWaiting?: () => void;
  onError?: (error: Error) => void;
  updateInterval?: number;
}

export class ServiceWorker {
  private wb: Workbox;
  private options: SwUpdateOptions;
  private updateTimer?: number;

  constructor(swUrl: string = "/sw.js", options: SwUpdateOptions = {}) {
    this.wb = new Workbox(swUrl, {
      scope: "/",
      updateViaCache: "none",
    });
    this.options = {
      updateInterval: 60 * 60 * 1000, // 1 hour
      ...options,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wb.addEventListener("installed", (event) => {
      console.log("Service worker installed", event);
      this.options.onInstalled?.();
    });

    this.wb.addEventListener("waiting", (event) => {
      console.log("Service worker waiting", event);
      this.showUpdatePrompt();
      this.options.onWaiting?.();
    });

    this.wb.addEventListener("controlling", () => {
      console.log("Service worker controlling");
      window.location.reload();
    });

    this.wb.addEventListener("message", (event) => {
      if (event.data.type === "CACHE_UPDATED") {
        console.log("Cache updated", event.data);
        this.options.onUpdate?.();
      }
    });

    this.wb.addEventListener("redundant", (event) => {
      console.warn("Service worker became redundant", event);
    });
  }

  private showUpdatePrompt(): void {
    const { t, ready } = useTranslation("Common", { i18n });
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 300px;
      ">
        <div style="margin-bottom: 12px;">
          ${t("NewVersionAvailable")}
        </div>
        <div>
          <button onclick="this.parentElement.parentElement.parentElement.updateSw()" style="
            background: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            margin-right: 8px;
          ">${t("Load")}</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;

    (notification as any).updateSw = () => {
      this.wb.messageSkipWaiting();
      notification.remove();
    };

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 30000);
  }

  private startUpdateTimer(): void {
    if (this.options.updateInterval && this.options.updateInterval > 0) {
      this.updateTimer = window.setInterval(() => {
        console.log("Checking for service worker updates...");
        this.wb.update().catch((error) => {
          console.error("SW update check failed:", error);
          this.options.onError?.(error);
        });
      }, this.options.updateInterval);
    }
  }

  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service worker not supported");
      return;
    }

    try {
      const registration = await this.wb.register();
      console.log("Service worker registered successfully:", registration);

      this.startUpdateTimer();

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.wb.update().catch(console.error);
        }
      });

      return registration;
    } catch (error) {
      console.error("Service worker registration failed:", error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async unregister(): Promise<boolean> {
    this.stopUpdateTimer();

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return registration.unregister();
      }
    }
    return false;
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if ("serviceWorker" in navigator) {
      return navigator.serviceWorker.getRegistration();
    }
  }

  forceUpdate(): void {
    this.wb.messageSkipWaiting();
  }
}

const serviceWorker = new ServiceWorker();

export default serviceWorker;
