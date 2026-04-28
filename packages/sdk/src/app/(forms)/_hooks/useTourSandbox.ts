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
