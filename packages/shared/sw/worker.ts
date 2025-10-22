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
import { initReactI18next } from "react-i18next";
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
  onError?: (error: Error, retryCount?: number) => void;
  onNetworkError?: (error: Error) => void;
  onRetry?: (attempt: number, maxAttempts: number) => void;
  updateInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
}

enum ErrorType {
  NETWORK = "NETWORK",
  REGISTRATION = "REGISTRATION",
  UPDATE = "UPDATE",
  UNKNOWN = "UNKNOWN",
}

interface ErrorContext {
  type: ErrorType;
  message: string;
  originalError: Error;
  timestamp: number;
  retryCount: number;
}

export class ServiceWorker {
  private wb?: Workbox;
  private options: SwUpdateOptions;
  private updateTimer?: number;
  private swUrl: string;
  private retryCount: number = 0;
  private maxRetries: number;
  private retryDelay: number;
  private exponentialBackoff: boolean;
  private isOnline: boolean = true;
  private errorHistory: ErrorContext[] = [];
  private registrationAttempts: number = 0;

  constructor(swUrl: string = "/sw.js", options: SwUpdateOptions = {}) {
    this.swUrl = swUrl;
    this.options = {
      updateInterval: 60 * 60 * 1000, // 1 hour
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      exponentialBackoff: true,
      ...options,
    };
    this.maxRetries = this.options.maxRetries!;
    this.retryDelay = this.options.retryDelay!;
    this.exponentialBackoff = this.options.exponentialBackoff!;
    this.setupNetworkListeners();
  }

  private ensureWorkbox(): boolean {
    if (this.wb) return true;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }
    this.wb = new Workbox(this.swUrl, {
      scope: "/",
      updateViaCache: "none",
    });
    this.setupEventListeners();
    return true;
  }

  private setupNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      console.log("[SW] Network connection restored");
      this.isOnline = true;
      this.handleNetworkRestore();
    });

    window.addEventListener("offline", () => {
      console.log("[SW] Network connection lost");
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  private async handleNetworkRestore(): Promise<void> {
    if (this.retryCount > 0 && this.retryCount < this.maxRetries) {
      console.log("[SW] Network restored, attempting to retry registration");
      await this.delay(1000);
      await this.register();
    }
  }

  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("offline") ||
      message.includes("connection")
    ) {
      return ErrorType.NETWORK;
    }

    if (message.includes("registration") || message.includes("register")) {
      return ErrorType.REGISTRATION;
    }

    if (message.includes("update")) {
      return ErrorType.UPDATE;
    }

    return ErrorType.UNKNOWN;
  }

  private logError(error: Error, type: ErrorType, retryCount: number): void {
    const context: ErrorContext = {
      type,
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
      retryCount,
    };

    this.errorHistory.push(context);

    if (this.errorHistory.length > 10) {
      this.errorHistory.shift();
    }

    console.error(
      `[SW Error] Type: ${type}, Retry: ${retryCount}/${this.maxRetries}`,
      error,
    );
  }

  private calculateRetryDelay(attempt: number): number {
    if (!this.exponentialBackoff) {
      return this.retryDelay;
    }

    const exponentialDelay = this.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, 30000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: Error, retryCount: number): boolean {
    if (retryCount >= this.maxRetries) {
      return false;
    }

    const errorType = this.classifyError(error);

    if (errorType === ErrorType.NETWORK && !this.isOnline) {
      console.log("[SW] Skipping retry - device is offline");
      return false;
    }

    if (errorType === ErrorType.NETWORK || errorType === ErrorType.UPDATE) {
      return true;
    }

    if (errorType === ErrorType.REGISTRATION) {
      return true;
    }

    return false;
  }

  private setupEventListeners(): void {
    if (!this.wb) return;
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
          ${i18n.t("Common:NewVersionAvailable")}
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
          ">${i18n.t("Common:Load")}</button>
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
      this.wb?.messageSkipWaiting();
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
        if (!this.isOnline) {
          console.log("[SW] Skipping update check - device is offline");
          return;
        }

        console.log("[SW] Checking for service worker updates...");
        this.wb?.update().catch((error) => {
          const errorType = this.classifyError(error);
          this.logError(error, errorType, 0);

          console.error("[SW] Update check failed:", error);

          if (errorType === ErrorType.UPDATE && this.isOnline) {
            console.log("[SW] Will retry update check on next interval");
          }

          this.options.onError?.(error, 0);
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

  private async swAvailable(): Promise<boolean> {
    try {
      if (typeof window === "undefined") return false;
      const url = new URL(this.swUrl, window.location.href).toString();
      let res: Response | undefined;
      try {
        res = await fetch(url, { method: "HEAD", cache: "no-store" });
      } catch (e) {
        res = await fetch(url, { method: "GET", cache: "no-store" });
      }
      return !!res && res.ok;
    } catch (e) {
      console.warn("SW availability check failed:", e);
      return false;
    }
  }

  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("[SW] Service worker not supported");
      return;
    }

    this.registrationAttempts++;

    try {
      if ((window as any).__NEXT_DATA__) {
        console.info("[SW] Skipping service worker on Next.js app page");
        return;
      }

      if (!this.isOnline) {
        const error = new Error(
          "Device is offline, cannot register service worker",
        );
        this.logError(error, ErrorType.NETWORK, this.retryCount);
        throw error;
      }

      if (!this.ensureWorkbox()) return;
      if (!this.wb) return;

      const available = await this.swAvailable();
      if (!available) {
        const error = new Error(
          `Service worker file not found at ${this.swUrl}`,
        );
        this.logError(error, ErrorType.REGISTRATION, this.retryCount);
        console.warn(`[SW] ${error.message}. Skipping registration.`);

        if (this.shouldRetry(error, this.retryCount)) {
          return this.retryRegistration(error);
        }

        return;
      }

      const registration = await this.wb.register();
      console.log("[SW] Service worker registered successfully:", registration);
      console.log(
        `[SW] Registration succeeded on attempt ${this.registrationAttempts}`,
      );

      this.retryCount = 0;
      this.registrationAttempts = 0;

      this.startUpdateTimer();

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          console.log("[SW] Tab visible, checking for updates...");
          this.wb?.update().catch((err) => {
            const errorType = this.classifyError(err);
            this.logError(err, errorType, 0);
            console.error("[SW] Update check failed:", err);
          });
        }
      });

      return registration;
    } catch (error) {
      const err = error as Error;
      const errorType = this.classifyError(err);
      this.logError(err, errorType, this.retryCount);

      console.error(
        `[SW] Registration failed (attempt ${this.registrationAttempts}):`,
        err,
      );

      if (this.shouldRetry(err, this.retryCount)) {
        return this.retryRegistration(err);
      }

      this.options.onError?.(err, this.retryCount);

      if (errorType === ErrorType.NETWORK) {
        this.options.onNetworkError?.(err);
      }

      throw err;
    }
  }

  private async retryRegistration(
    error: Error,
  ): Promise<ServiceWorkerRegistration | undefined> {
    this.retryCount++;
    const delay = this.calculateRetryDelay(this.retryCount);

    console.log(
      `[SW] Retrying registration (${this.retryCount}/${this.maxRetries}) in ${Math.round(delay)}ms...`,
    );

    this.options.onRetry?.(this.retryCount, this.maxRetries);

    await this.delay(delay);

    return this.register();
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
    this.wb?.messageSkipWaiting();
  }

  getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  getHealthStatus(): {
    isOnline: boolean;
    retryCount: number;
    maxRetries: number;
    registrationAttempts: number;
    errorCount: number;
    lastError?: ErrorContext;
  } {
    return {
      isOnline: this.isOnline,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      registrationAttempts: this.registrationAttempts,
      errorCount: this.errorHistory.length,
      lastError: this.errorHistory[this.errorHistory.length - 1],
    };
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryCount = 0;
    this.registrationAttempts = 0;
  }

  async manualRetry(): Promise<ServiceWorkerRegistration | undefined> {
    console.log("[SW] Manual retry triggered");
    this.retryCount = 0;
    return this.register();
  }
}

const serviceWorker = new ServiceWorker();

export default serviceWorker;
