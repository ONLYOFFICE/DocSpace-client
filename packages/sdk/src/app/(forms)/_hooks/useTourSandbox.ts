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

"use client";

import React from "react";
import { runInAction } from "mobx";

import { ShareAccessRights } from "@docspace/shared/enums";

import { useFormsTourStore } from "../_store/FormsTourStore";
import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsDbSettingsStore } from "../_store/FormsDbSettingsStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsListStore } from "../_store/FormsListStore";

type Snapshot = {
  aiAgentEnabled?: boolean;
  askFromDBAgentId?: number | null;
  sendToDb?: boolean;
  userAccess?: number | null;
};

export default function useTourSandbox(fetchSection: () => void) {
  const tourStore = useFormsTourStore();
  const aiStore = useFormsAiAgentStore();
  const dbSettingsStore = useFormsDbSettingsStore();
  const formsSettingsStore = useFormsSettingsStore();
  const formsListStore = useFormsListStore();

  const snapshotRef = React.useRef<Snapshot | null>(null);
  const prevRunning = React.useRef(tourStore.isRunning);

  React.useEffect(() => {
    const wasRunning = prevRunning.current;
    const isRunning = tourStore.isRunning;
    prevRunning.current = isRunning;

    if (!wasRunning && isRunning) {
      runInAction(() => {
        const snapshot: Snapshot = {};

        if (!aiStore.aiAgentEnabled) {
          snapshot.aiAgentEnabled = aiStore.aiAgentEnabled;
          aiStore.aiAgentEnabled = true;
        }
        if (!aiStore.askFromDBAgentId) {
          snapshot.askFromDBAgentId = aiStore.askFromDBAgentId;
          aiStore.askFromDBAgentId = -999;
        }
        if (!dbSettingsStore.sendToDb) {
          snapshot.sendToDb = dbSettingsStore.sendToDb;
          dbSettingsStore.setSendToDb(true);
        }
        if (!formsSettingsStore.hasManagementAccess) {
          snapshot.userAccess = formsSettingsStore.userAccess as number;
          formsSettingsStore.userAccess = ShareAccessRights.RoomManager;
        }

        snapshotRef.current = snapshot;
      });
      return;
    }

    if (wasRunning && !isRunning) {
      const snapshot = snapshotRef.current;
      snapshotRef.current = null;

      formsListStore.reset();
      fetchSection();

      if (!snapshot) return;
      runInAction(() => {
        if ("aiAgentEnabled" in snapshot) {
          aiStore.aiAgentEnabled = snapshot.aiAgentEnabled as boolean;
        }
        if ("askFromDBAgentId" in snapshot) {
          aiStore.askFromDBAgentId = snapshot.askFromDBAgentId as number | null;
        }
        if ("sendToDb" in snapshot) {
          dbSettingsStore.setSendToDb(snapshot.sendToDb as boolean);
        }
        if ("userAccess" in snapshot) {
          formsSettingsStore.userAccess = snapshot.userAccess as number;
        }
      });
    }
  }, [
    tourStore.isRunning,
    aiStore,
    dbSettingsStore,
    formsSettingsStore,
    formsListStore,
    fetchSection,
  ]);
}
