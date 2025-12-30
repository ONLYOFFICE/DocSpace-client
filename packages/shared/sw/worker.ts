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
import { createUpdatePrompt } from "./client/ui/update-prompt";
import {
  SW_CONFIG,
  SWConfig,
  ErrorType,
  ErrorContext,
  VersionInfo,
  HealthStatus,
  MAX_ERROR_HISTORY,
  MAX_RETRY_DELAY_MS,
  RETRY_JITTER_MS,
  NETWORK_RESTORE_DELAY_MS,
} from "./config";

let i18nInitialized = false;

/**
 * Initializes i18next for service worker UI translations.
 * Called lazily to avoid side effects on module import.
 */
function initializeI18n(): void {
  if (i18nInitialized) return;
  i18nInitialized = true;

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
}

/**
 * Service Worker Manager for DocSpace applications.
 *
 * Provides a robust wrapper around the Workbox library for managing service worker
 * registration, updates, and error handling. Features include:
 *
 * - **Automatic registration** with retry logic and exponential backoff
 * - **Update detection** via periodic checks and visibility change events
 * - **Version tracking** using build hashes from version.json
 * - **Network awareness** with automatic retry on connection restore
 * - **Error tracking** with classification and history
 * - **Customizable callbacks** for React/MobX integration
 *
 * @example
 * ```typescript
 * import serviceWorker from '@docspace/shared/sw/worker';
 *
 * // Register with default options
 * await serviceWorker.register();
 *
 * // Or with custom callbacks
 * const sw = new ServiceWorker('/sw.js', {
 *   onUpdateAvailable: (reloadOnly, applyUpdate) => {
 *     if (confirm('Update available. Reload?')) {
 *       applyUpdate();
 *     }
 *   },
 *   onError: (error) => console.error('SW Error:', error),
 * });
 * await sw.register();
 * ```
 */
export class ServiceWorker {
  /** Workbox instance for service worker management */
  private wb?: Workbox;

  /** Merged configuration options */
  private options: SWConfig;

  /** Timer ID for periodic update checks */
  private updateTimer?: number;

  /** URL path to the service worker file */
  private readonly swUrl: string;

  /** Current retry attempt count */
  private retryCount: number = 0;

  /** Whether the device currently has network connectivity */
  private isOnline: boolean = true;

  /** Circular buffer of recent errors for debugging */
  private errorHistory: ErrorContext[] = [];

  /** Total number of registration attempts (including retries) */
  private registrationAttempts: number = 0;

  /** Current build hash for detecting version changes */
  private currentBuildHash?: string;

  /**
   * Creates a new ServiceWorker manager instance.
   *
   * @param swUrl - Path to the service worker file (default: "/sw.js")
   * @param options - Configuration options to override defaults from SW_CONFIG
   */
  constructor(swUrl: string = "/sw.js", options: Partial<SWConfig> = {}) {
    this.swUrl = swUrl;
    this.options = {
      ...SW_CONFIG,
      ...options,
    };
    this.setupNetworkListeners();
  }

  /**
   * Lazily initializes the Workbox instance.
   * @returns true if Workbox is available and initialized, false otherwise
   */
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

  /**
   * Sets up listeners for online/offline network events.
   * Enables automatic retry when network connectivity is restored.
   */
  private setupNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.log("Network connection restored");
      this.isOnline = true;
      this.handleNetworkRestore();
    });

    window.addEventListener("offline", () => {
      this.log("Network connection lost");
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  /**
   * Handles network restoration by retrying failed registration.
   */
  private async handleNetworkRestore(): Promise<void> {
    if (this.retryCount > 0 && this.retryCount < this.options.maxRetries) {
      this.log("Network restored, attempting to retry registration");
      await this.delay(NETWORK_RESTORE_DELAY_MS);
      await this.register();
    }
  }

  /**
   * Classifies an error based on its message content.
   * Used to determine retry behavior and callback invocation.
   *
   * @param error - The error to classify
   * @returns The classified error type
   */
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

  /**
   * Logs an error to the error history and console.
   * Maintains a circular buffer of the most recent errors.
   *
   * @param error - The error that occurred
   * @param type - The classified error type
   * @param retryCount - Current retry attempt count
   */
  private logError(error: Error, type: ErrorType, retryCount: number): void {
    const context: ErrorContext = {
      type,
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
      retryCount,
    };

    this.errorHistory.push(context);

    if (this.errorHistory.length > MAX_ERROR_HISTORY) {
      this.errorHistory.shift();
    }

    console.error(
      `[SW Error] Type: ${type}, Retry: ${retryCount}/${this.options.maxRetries}`,
      error,
    );
  }

  /**
   * Logs a debug message if debug mode is enabled.
   * @param message - Message to log
   * @param args - Additional arguments to log
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.options.debug) {
      console.log(`[SW] ${message}`, ...args);
    }
  }

  /**
   * Calculates the delay before the next retry attempt.
   * Uses exponential backoff with jitter if enabled.
   *
   * @param attempt - The current attempt number (1-based)
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.options.exponentialBackoff) {
      return this.options.retryDelay;
    }

    const exponentialDelay = this.options.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * RETRY_JITTER_MS;
    return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY_MS);
  }

  /**
   * Creates a promise that resolves after the specified delay.
   * @param ms - Delay in milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Determines whether a failed operation should be retried.
   *
   * @param error - The error that occurred
   * @param retryCount - Current retry attempt count
   * @returns true if the operation should be retried
   */
  private shouldRetry(error: Error, retryCount: number): boolean {
    if (retryCount >= this.options.maxRetries) {
      return false;
    }

    const errorType = this.classifyError(error);

    if (errorType === ErrorType.NETWORK && !this.isOnline) {
      this.log("Skipping retry - device is offline");
      return false;
    }

    return (
      errorType === ErrorType.NETWORK ||
      errorType === ErrorType.UPDATE ||
      errorType === ErrorType.REGISTRATION
    );
  }

  /**
   * Sets up Workbox event listeners for service worker lifecycle events.
   */
  private setupEventListeners(): void {
    if (!this.wb) return;

    this.wb.addEventListener("installed", (event) => {
      this.log("Service worker installed", event);
      this.options.onInstalled?.();
    });

    this.wb.addEventListener("waiting", (event) => {
      this.log("Service worker waiting", event);
      this.showUpdatePrompt();
      this.options.onWaiting?.();
    });

    this.wb.addEventListener("controlling", () => {
      this.log("Service worker controlling");
      window.location.reload();
    });

    this.wb.addEventListener("message", (event) => {
      if (event.data.type === "CACHE_UPDATED") {
        this.log("Cache updated", event.data);
        this.options.onUpdate?.();
      }
    });

    this.wb.addEventListener("redundant", (event) => {
      console.warn("[SW] Service worker became redundant", event);
    });
  }

  /**
   * Shows an update prompt to the user.
   * Uses the onUpdateAvailable callback if provided, otherwise falls back to DOM-based prompt.
   *
   * @param reloadOnly - If true, the update only requires a page reload (no SW skip waiting)
   */
  private showUpdatePrompt(reloadOnly: boolean = false): void {
    const applyUpdate = () => {
      if (reloadOnly) {
        window.location.reload();
      } else {
        this.wb?.messageSkipWaiting();
      }
    };

    // Use callback if provided (for React/MobX integration)
    if (this.options.onUpdateAvailable) {
      this.options.onUpdateAvailable(reloadOnly, applyUpdate);
      return;
    }

    // Initialize i18n lazily for DOM-based prompt
    initializeI18n();

    // Fallback to DOM-based prompt
    createUpdatePrompt({
      message: i18n.t("Common:NewVersionAvailable"),
      updateButtonText: i18n.t("Common:Load"),
      dismissButtonText: "Later",
      onUpdate: applyUpdate,
      autoHideDelay: 30000,
    });
  }

  /**
   * Fetches version information from the server.
   * @returns Version info object or null if fetch fails
   */
  private async fetchVersionInfo(): Promise<VersionInfo | null> {
    try {
      const response = await fetch("/version.json", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn("[SW] Failed to fetch version info:", error);
      return null;
    }
  }

  /**
   * Checks if a new application version is available by comparing build hashes.
   * @returns true if a new version is detected
   */
  private async checkForVersionUpdate(): Promise<boolean> {
    const versionInfo = await this.fetchVersionInfo();
    if (!versionInfo) return false;

    // First time - store the current build hash
    if (!this.currentBuildHash) {
      this.currentBuildHash = versionInfo.buildHash;
      this.log("Initial build hash:", this.currentBuildHash);
      return false;
    }

    // Check if build hash changed
    if (versionInfo.buildHash !== this.currentBuildHash) {
      this.log(
        `New version detected! Current: ${this.currentBuildHash}, New: ${versionInfo.buildHash}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Starts the periodic update check timer.
   * Checks both version.json and service worker for updates.
   */
  private startUpdateTimer(): void {
    if (this.options.updateInterval && this.options.updateInterval > 0) {
      this.updateTimer = window.setInterval(async () => {
        if (!this.isOnline) {
          this.log("Skipping update check - device is offline");
          return;
        }

        this.log("Checking for updates...");

        // Check for version.json changes (detects any script changes)
        const hasNewVersion = await this.checkForVersionUpdate();
        if (hasNewVersion) {
          this.showUpdatePrompt(true); // reloadOnly=true for version updates
          return;
        }

        // Also check for service worker updates
        this.wb?.update().catch((error) => {
          const errorType = this.classifyError(error);
          this.logError(error, errorType, 0);

          if (errorType === ErrorType.UPDATE && this.isOnline) {
            this.log("Will retry update check on next interval");
          }

          this.options.onError?.(error, 0);
        });
      }, this.options.updateInterval);
    }
  }

  /**
   * Stops the periodic update check timer.
   */
  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  /**
   * Checks if the service worker file is available on the server.
   * @returns true if the service worker file exists and is accessible
   */
  private async swAvailable(): Promise<boolean> {
    try {
      if (typeof window === "undefined") return false;
      const url = new URL(this.swUrl, window.location.href).toString();
      let res: Response | undefined;
      try {
        res = await fetch(url, { method: "HEAD", cache: "no-store" });
      } catch {
        res = await fetch(url, { method: "GET", cache: "no-store" });
      }
      return !!res && res.ok;
    } catch (error) {
      console.warn("[SW] Availability check failed:", error);
      return false;
    }
  }

  /**
   * Registers the service worker with automatic retry on failure.
   *
   * This method:
   * - Checks for service worker support
   * - Skips registration on Next.js SSR pages
   * - Verifies the service worker file is available
   * - Sets up periodic update checks
   * - Handles visibility change events for update checks
   *
   * @returns The ServiceWorkerRegistration if successful, undefined otherwise
   * @throws Error if registration fails after all retry attempts
   */
  async register(): Promise<ServiceWorkerRegistration | undefined> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("[SW] Service worker not supported");
      return;
    }

    this.registrationAttempts++;

    try {
      if ((window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__) {
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
          return this.retryRegistration();
        }

        return;
      }

      const registration = await this.wb.register();
      console.log("[SW] Service worker registered successfully:", registration);
      console.log(
        `[SW] Registration succeeded on attempt ${this.registrationAttempts}`,
      );

      // Initialize build hash for version checking
      await this.checkForVersionUpdate();

      this.retryCount = 0;
      this.registrationAttempts = 0;

      this.startUpdateTimer();

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.log("Tab visible, checking for updates...");
          this.wb?.update().catch((err) => {
            const errorType = this.classifyError(err);
            this.logError(err, errorType, 0);
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
        return this.retryRegistration();
      }

      this.options.onError?.(err, this.retryCount);

      if (errorType === ErrorType.NETWORK) {
        this.options.onNetworkError?.(err);
      }

      throw err;
    }
  }

  /**
   * Retries service worker registration with exponential backoff.
   * @returns The registration if successful, undefined otherwise
   */
  private async retryRegistration(): Promise<
    ServiceWorkerRegistration | undefined
  > {
    this.retryCount++;
    const retryDelay = this.calculateRetryDelay(this.retryCount);

    this.log(
      `Retrying registration (${this.retryCount}/${this.options.maxRetries}) in ${Math.round(retryDelay)}ms...`,
    );

    this.options.onRetry?.(this.retryCount, this.options.maxRetries);

    await this.delay(retryDelay);

    return this.register();
  }

  /**
   * Unregisters the service worker and stops update checks.
   *
   * @returns true if the service worker was successfully unregistered
   */
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

  /**
   * Gets the current service worker registration.
   *
   * @returns The current registration or undefined if not registered
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if ("serviceWorker" in navigator) {
      return navigator.serviceWorker.getRegistration();
    }
  }

  /**
   * Forces the waiting service worker to become active immediately.
   * This will trigger a page reload via the 'controlling' event.
   */
  forceUpdate(): void {
    this.wb?.messageSkipWaiting();
  }

  /**
   * Returns a copy of the error history for debugging.
   *
   * @returns Array of error context objects
   */
  getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  /**
   * Returns the current health status of the service worker manager.
   * Useful for debugging and monitoring.
   *
   * @returns Health status object with connectivity and error information
   */
  getHealthStatus(): HealthStatus {
    return {
      isOnline: this.isOnline,
      retryCount: this.retryCount,
      maxRetries: this.options.maxRetries,
      registrationAttempts: this.registrationAttempts,
      errorCount: this.errorHistory.length,
      lastError: this.errorHistory[this.errorHistory.length - 1],
    };
  }

  /**
   * Clears the error history and resets retry counters.
   * Useful for recovering from a series of failures.
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryCount = 0;
    this.registrationAttempts = 0;
  }

  /**
   * Manually triggers a registration retry, resetting the retry counter.
   * Useful for user-initiated recovery attempts.
   *
   * @returns The registration if successful, undefined otherwise
   */
  async manualRetry(): Promise<ServiceWorkerRegistration | undefined> {
    this.log("Manual retry triggered");
    this.retryCount = 0;
    return this.register();
  }

  /**
   * Sets a callback to be invoked when an update is available.
   * Allows React/MobX components to handle update prompts.
   *
   * @param callback - Function called with (reloadOnly, applyUpdate)
   */
  setUpdateCallback(
    callback: (reloadOnly: boolean, applyUpdate: () => void) => void,
  ): void {
    this.options.onUpdateAvailable = callback;
  }
}

const serviceWorker = new ServiceWorker();

export default serviceWorker;
