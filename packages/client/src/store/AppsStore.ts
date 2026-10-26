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

// (c) Copyright Ascensio System SIA 2009-2026
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

import { makeAutoObservable, runInAction, when } from "mobx";

import SocketHelper, {
  SocketCommands,
  SocketEvents,
  type TChangeAppEnabledData,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import {
  getApps,
  getAppSettings,
  setAppEnabled,
  setAppSettings,
} from "@docspace/shared/api/apps";
import type { TApp } from "@docspace/shared/api/apps/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import {
  isPrivateRoomsEnabled,
  isPrivateRoomsOptInValue,
} from "@docspace/shared/utils/privateRooms";
import { isSdkFrameWindow } from "@docspace/shared/utils/common";
import { isAppTemporarilyDisabled } from "SRC_DIR/helpers/disabled-apps";

const PRIVATE_ROOMS_APP_ID = "e2e-rooms";

// How long an SDK frame waits for its configuration before it treats the
// host as not opted in.
const FRAME_CONFIG_TIMEOUT = 5000;

class AppsStore {
  apps: TApp[] = [];

  isLoaded = false;

  isLoading = false;

  // The last fetch of the list failed. A route that waits for the list stops
  // waiting then, and lets the optimistic `isInstalled` decide, rather than
  // leaving its section blank until the page is reloaded.
  isLoadFailed = false;

  settingsStore: SettingsStore;

  // Spec: private-rooms/sidebar-section, "Section availability"
  privateRoomsOptIn = isPrivateRoomsEnabled();

  // Spec: private-rooms/feature-gating, "Client in an embedded frame takes the host opt-in"
  framePrivateRoomsOptIn = false;

  // An SDK frame learns the host's opt-in only from its configuration.
  isFrameOptInSettled = !isSdkFrameWindow();

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;

    makeAutoObservable(this);

    this.subscribeToSocket();

    if (!this.isFrameOptInSettled) {
      when(() => !!this.settingsStore.frameConfig, {
        timeout: FRAME_CONFIG_TIMEOUT,
      })
        .then(() =>
          this.settleFrameOptIn(this.settingsStore.frameConfig?.privateRooms),
        )
        .catch(() => this.settleFrameOptIn(false));
    }
  }

  settleFrameOptIn = (value: unknown) => {
    this.framePrivateRoomsOptIn = isPrivateRoomsOptInValue(value);
    this.isFrameOptInSettled = true;
  };

  /** Resolves once an SDK frame knows whether its host opted in. */
  waitForFrameOptIn = async () => {
    if (this.isFrameOptInSettled) return;
    await when(() => this.isFrameOptInSettled);
  };

  private subscribeToSocket = () => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "apps",
    });

    SocketHelper?.on(
      SocketEvents.ChangeAppEnabled,
      this.handleAppEnabledChange,
    );
  };

  fetchApps = async () => {
    if (this.isLoading) return;

    runInAction(() => {
      this.isLoading = true;
    });

    try {
      const apps = await getApps();
      runInAction(() => {
        this.apps = apps ?? [];
        this.isLoaded = true;
        this.isLoadFailed = false;
      });
    } catch (err) {
      console.error("Failed to load apps", err);
      runInAction(() => {
        this.isLoadFailed = true;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  ensureLoaded = () => {
    if (!this.isLoaded && !this.isLoading) this.fetchApps();
  };

  handleAppEnabledChange = (data: TChangeAppEnabledData) => {
    const { id, enabled } = data;

    runInAction(() => {
      const app = this.apps.find((a) => a.id === id);
      if (app) {
        app.enabled = enabled;
      } else {
        this.apps.push({ id, enabled });
      }
    });
  };

  isEnabled = (id: string): boolean => {
    if (isAppTemporarilyDisabled(id)) return false;
    return this.apps.find((a) => a.id === id)?.enabled ?? false;
  };

  // Apps can be switched off only on a standalone installation. In SaaS every
  // app is on and stays on: the switch is not offered and the server's enabled
  // flags are not consulted.
  get canManageApps() {
    return this.settingsStore.standalone;
  }

  // Whether the app is on offer - in the sidebar, on the dashboard and at its
  // URL. Optimistic until the list arrives, since every app ships enabled by
  // default: the sidebar must not flash the whole catalog under "Not installed"
  // on load. A route that has to decide for real waits for `isLoaded` itself,
  // unless the list failed to load (`isLoadFailed`).
  isInstalled = (id: string): boolean => {
    if (isAppTemporarilyDisabled(id)) return false;
    if (!this.canManageApps || !this.isLoaded) return true;
    return this.isEnabled(id);
  };

  // The Private section: the opt-in captured at load, and the E2E rooms app
  // read as `isInstalled` reads it, without asking the flag again.
  get isPrivateRoomsSectionAvailable() {
    if (!this.privateRoomsOptIn && !this.framePrivateRoomsOptIn) return false;
    if (!this.canManageApps || !this.isLoaded) return true;
    return (
      this.apps.find((a) => a.id === PRIVATE_ROOMS_APP_ID)?.enabled ?? false
    );
  }

  getSettings = <T = Record<string, unknown>>(id: string): T | undefined => {
    return this.apps.find((a) => a.id === id)?.settings as T | undefined;
  };

  // Fetches the app's persisted settings from the server and caches them.
  // Returns null when the tenant has no overrides for this app.
  fetchAppSettings = async <T extends Record<string, unknown>>(
    id: string,
  ): Promise<T | null> => {
    const settings = await getAppSettings<T>(id);
    runInAction(() => {
      const idx = this.apps.findIndex((a) => a.id === id);
      const next = settings ?? undefined;
      if (idx >= 0) {
        this.apps[idx] = { ...this.apps[idx], settings: next };
      } else {
        this.apps.push({ id, enabled: false, settings: next });
      }
    });
    return settings;
  };

  // Source of truth for "has this app been configured": always asks the
  // server, so a stale local cache cannot trigger a duplicate install flow.
  needsSetupAsync = async (id: string): Promise<boolean> => {
    if (id === "ai-forms") {
      const settings = await this.fetchAppSettings<{ roomId?: number }>(id);
      return !settings?.roomId;
    }
    if (id === "ai-arbiter") {
      const settings = await this.fetchAppSettings<{ installed?: boolean }>(id);
      return !settings?.installed;
    }
    if (id === "ai-agents") return false;
    const settings = await this.fetchAppSettings(id);
    return !settings;
  };

  enable = async (id: string, enabled: boolean) => {
    const updated = await setAppEnabled(id, enabled);
    runInAction(() => {
      const idx = this.apps.findIndex((a) => a.id === id);
      if (idx >= 0) this.apps[idx] = updated;
      else this.apps.push(updated);
    });
    return updated;
  };

  saveSettings = async <T extends Record<string, unknown> | null>(
    id: string,
    settings: T,
  ) => {
    const updated = await setAppSettings(id, settings);
    runInAction(() => {
      const idx = this.apps.findIndex((a) => a.id === id);
      if (idx >= 0) this.apps[idx] = updated;
      else this.apps.push(updated);
    });
    return updated;
  };

  installAiForms = async (roomId: number, libraryId?: number) => {
    await this.saveSettings("ai-forms", { roomId, libraryId });
    await this.enable("ai-forms", true);
  };

  // Disable ai-forms and wipe its stored settings so a subsequent re-enable
  // goes through the full install flow (new room + library) rather than
  // silently re-pointing at the orphaned rooms.
  uninstallAiForms = async () => {
    await this.enable("ai-forms", false);
    await this.saveSettings("ai-forms", null);
  };

  installAiArbiter = async () => {
    await this.saveSettings("ai-arbiter", { installed: true });
    await this.enable("ai-arbiter", true);
  };

  uninstallAiArbiter = async () => {
    await this.enable("ai-arbiter", false);
    await this.saveSettings("ai-arbiter", null);
  };

  // Re-enable a previously configured app without recreating its resources.
  // Returns false when the server reports no configuration yet — callers
  // should open the install dialog in that case.
  activate = async (id: string): Promise<boolean> => {
    const needsSetup = await this.needsSetupAsync(id);
    if (needsSetup) return false;
    if (!this.isEnabled(id)) await this.enable(id, true);
    return true;
  };
}

export default AppsStore;
