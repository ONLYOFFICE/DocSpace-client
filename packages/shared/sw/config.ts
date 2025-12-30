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

import packageJson from "../package.json";

const APP_VERSION = packageJson.version;

// ============================================================================
// Constants
// ============================================================================

/** Maximum number of errors to keep in history */
export const MAX_ERROR_HISTORY = 10;

/** Maximum retry delay in milliseconds (30 seconds) */
export const MAX_RETRY_DELAY_MS = 30000;

/** Random jitter range for retry delays in milliseconds */
export const RETRY_JITTER_MS = 1000;

/** Delay before retrying after network restore in milliseconds */
export const NETWORK_RESTORE_DELAY_MS = 1000;

// ============================================================================
// Enums
// ============================================================================

/**
 * Classification of service worker errors for retry logic.
 */
export enum ErrorType {
  /** Network-related errors (fetch failures, offline, connection issues) */
  NETWORK = "NETWORK",
  /** Service worker registration errors */
  REGISTRATION = "REGISTRATION",
  /** Service worker update errors */
  UPDATE = "UPDATE",
  /** Unclassified errors */
  UNKNOWN = "UNKNOWN",
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Context information for a service worker error.
 * Used for error tracking and debugging.
 */
export interface ErrorContext {
  /** The type/classification of the error */
  type: ErrorType;
  /** Human-readable error message */
  message: string;
  /** The original Error object */
  originalError: Error;
  /** Unix timestamp when the error occurred */
  timestamp: number;
  /** Number of retry attempts when this error occurred */
  retryCount: number;
}

/**
 * Version information from the server's version.json file.
 * Used to detect application updates.
 */
export interface VersionInfo {
  /** Semantic version string (e.g., "1.2.3") */
  version: string;
  /** Unique build hash for cache busting */
  buildHash: string;
  /** ISO date string of when the build was created */
  buildDate: string;
}

/**
 * Health status of the service worker manager.
 * Provides diagnostic information about the current state.
 */
export interface HealthStatus {
  /** Whether the device currently has network connectivity */
  isOnline: boolean;
  /** Current retry attempt count */
  retryCount: number;
  /** Maximum allowed retry attempts */
  maxRetries: number;
  /** Total registration attempts made */
  registrationAttempts: number;
  /** Number of errors in the error history */
  errorCount: number;
  /** The most recent error, if any */
  lastError?: ErrorContext;
}

/**
 * Configuration for cache storage limits.
 */
export interface CacheConfig {
  /** Maximum number of entries to store in the cache */
  maxEntries: number;
  /** Maximum age of cached entries in seconds */
  maxAgeSeconds: number;
}

/**
 * A route pattern with its description for navigation handling.
 */
export interface RoutePattern {
  /** Regular expression to match against the URL path */
  pattern: RegExp;
  /** Human-readable description of what this pattern matches */
  description: string;
}

/**
 * Configuration for navigation request handling.
 */
export interface NavigationConfig {
  /** Patterns for SSR (Server-Side Rendered) applications that should bypass the service worker */
  ssrApps: RoutePattern[];
  /** Patterns for URLs that should not be handled by the service worker */
  denylist: RoutePattern[];
}

/**
 * Complete configuration for the service worker manager.
 * Includes caching, navigation, retry logic, and callback options.
 */
export interface SWConfig {
  /** Application version string */
  version: string;
  /** Prefix for cache names */
  cachePrefix: string;
  /** Suffix for cache names (typically includes version) */
  cacheSuffix: string;
  /** Navigation request handling configuration */
  navigation: NavigationConfig;
  /** Cache storage configuration */
  cache: {
    /** Configuration for static assets cache */
    static: CacheConfig;
    /** Configuration for locale/translation files cache */
    locales: CacheConfig;
  };
  /** Interval in milliseconds between automatic update checks */
  updateInterval: number;
  /** Maximum number of retry attempts for failed operations */
  maxRetries: number;
  /** Base delay in milliseconds between retry attempts */
  retryDelay: number;
  /** Whether to use exponential backoff for retry delays */
  exponentialBackoff: boolean;
  /** Enable debug logging */
  debug: boolean;

  // Callback options
  /** Called when the service worker cache is updated */
  onUpdate?: () => void;
  /** Called when the service worker is first installed */
  onInstalled?: () => void;
  /** Called when a new service worker is waiting to activate */
  onWaiting?: () => void;
  /** Called when an error occurs during registration or update */
  onError?: (error: Error, retryCount?: number) => void;
  /** Called specifically for network-related errors */
  onNetworkError?: (error: Error) => void;
  /** Called before each retry attempt */
  onRetry?: (attempt: number, maxAttempts: number) => void;
  /** Called when an update is available; provides a function to apply the update */
  onUpdateAvailable?: (reloadOnly: boolean, applyUpdate: () => void) => void;
}

export const SW_CONFIG: SWConfig = {
  version: APP_VERSION,
  cachePrefix: "docspace",
  cacheSuffix: `v${APP_VERSION}`,

  navigation: {
    ssrApps: [
      {
        pattern: /^\/login(\/|$)/,
        description: "Login app - Next.js SSR authentication pages",
      },
      {
        pattern: /^\/management(\/|$)/,
        description: "Management app - Next.js SSR admin portal",
      },
      {
        pattern: /^\/doceditor(\/|$)/,
        description: "DocEditor app - Next.js SSR document editor",
      },
      {
        pattern: /^\/sdk(\/|$)/,
        description: "SDK app - Next.js SSR developer documentation",
      },
    ],

    denylist: [
      {
        pattern: /^\/__/,
        description: "Internal paths (Webpack HMR, debug endpoints)",
      },
      {
        pattern: /\/[^/?]+\.[^/]+$/,
        description:
          "Direct file access with extensions (bypasses SPA routing)",
      },
    ],
  },

  cache: {
    static: {
      maxEntries: 60,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
    locales: {
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    },
  },

  updateInterval: 60 * 1000, // 1 minute // 60 * 60 * 1000, // 1 hour
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  exponentialBackoff: true,
  debug: true,
};

export default SW_CONFIG;
