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

import {
  LIVE_CHAT_LOCAL_STORAGE_KEY,
  PUBLIC_STORAGE_KEY,
} from "@docspace/shared/constants";

/**
 * Central registry of localStorage keys used by client stores.
 *
 * Key names and serialization formats are frozen for backward
 * compatibility with values already persisted in users' browsers —
 * never rename a key or change its stored format.
 */
export const PersistenceKeys = {
  /** JSON string[] — names of dismissed campaign banners (CampaignsStore) */
  closedCampaigns: "closed_campaigns",
  /** Numeric string — index of the current campaign banner (CampaignsStore) */
  bannerIndex: "bannerIndex",
  /** Raw view mode string: "tile" | "table" | "row" (FilesStore) */
  viewAs: "viewAs",
  /** Presence flag ("true") — submit-to-gallery tile hidden (OformsStore) */
  submitToGalleryTileIsHidden: "submitToGalleryTileIsHidden",
  /** "true" | "false" — live chat visibility (ProfileActionsStore) */
  liveChatState: LIVE_CHAT_LOCAL_STORAGE_KEY,
  /** Presence flag set by the public room auth window (PublicRoomStore) */
  publicAuth: PUBLIC_STORAGE_KEY,
  /** JSON boolean — skip the AI connect dialog (AskAIConnectDialog, ContextOptionsStore) */
  skipAiModal: "formRoom.skipAIConnectModal",
  /** Presence flag — enterprise license alert dismissed (PaymentStore) */
  enterpriseAlertClose: "enterpriseAlertClose",
} as const;

export type PersistenceKey =
  (typeof PersistenceKeys)[keyof typeof PersistenceKeys];

/**
 * Some keys are built per user/table at runtime (e.g. TableStore column
 * settings: `${TABLE_ROOMS_COLUMNS}=${userId}`). `string & {}` keeps
 * autocomplete for registry keys while still accepting those dynamic keys.
 */
type StorageKey = PersistenceKey | (string & {});

const storageAvailable = () => typeof window !== "undefined";

/** Raw string read — for legacy keys stored as plain (non-JSON) strings. */
export const getPersistedString = (key: StorageKey): string | null => {
  if (!storageAvailable()) return null;
  return window.localStorage.getItem(key);
};

/** Raw string write — for legacy keys stored as plain (non-JSON) strings. */
export const setPersistedString = (key: StorageKey, value: string): void => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key, value);
};

/** JSON-typed read: parses the stored value, returns `fallback` when absent. */
export const getPersisted = <T>(key: StorageKey, fallback: T): T => {
  if (!storageAvailable()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return JSON.parse(raw) as T;
};

/** JSON-typed write. */
export const setPersisted = <T>(key: StorageKey, value: T): void => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

/**
 * `true` when the key holds a non-empty value (presence-flag pattern).
 * Truthy check, matching the historical `!!localStorage.getItem(key)` sites.
 */
export const hasPersisted = (key: StorageKey): boolean => {
  if (!storageAvailable()) return false;
  return Boolean(window.localStorage.getItem(key));
};

export const removePersisted = (key: StorageKey): void => {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(key);
};
