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

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type {
  TFile,
  TFilesSettings,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TDefaultProvider } from "@docspace/shared/api/ai/types";
import { ShareAccessRights } from "@docspace/ui-kit/enums";

import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsUserStore } from "../_store/FormsUserStore";
import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsDbSettingsStore } from "../_store/FormsDbSettingsStore";
import { useFormsListStore } from "../_store/FormsListStore";

export type CommonData = {
  roomId: string | number;
  libraryId?: string | number;
  socketUrl: string;
  filesSettings: TFilesSettings;
  user?: TUser;
  defaultProvider?: TDefaultProvider;
  roomSecurity?: TFolderSecurity;
  roomAccess?: ShareAccessRights;
  saveFormAsXLSX?: boolean;
  sendFormToExternalDB?: boolean;
  doneFolderId?: number;
  inProgressFolderId?: number;
  initialFiles?: TFile[];
  initialTotal?: number;
};

export default function useInitCommonStores(commonData: CommonData): boolean {
  const formsSettingsStore = useFormsSettingsStore();
  const formsUserStore = useFormsUserStore();
  const formsAiAgentStore = useFormsAiAgentStore();
  const formsDbSettingsStore = useFormsDbSettingsStore();
  const formsListStore = useFormsListStore();
  const filesSettingsStore = useFilesSettingsStore();
  const settingsStore = useSettingsStore();
  const [isReady, setIsReady] = useState(false);
  const initialised = useRef(false);

  // useLayoutEffect runs synchronously BEFORE child useEffects, guaranteeing
  // that MobX stores are populated before page components check them.
  // This is critical: React fires child effects before parent effects,
  // so a regular useEffect here would run AFTER MyFormsPage's mount effect.
  useLayoutEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    formsSettingsStore.setConfig({
      roomId: commonData.roomId,
      libraryId: commonData.libraryId,
      socketUrl: commonData.socketUrl,
    });
    formsSettingsStore.setFilesSettings(commonData.filesSettings);
    filesSettingsStore.setFilesSettings(commonData.filesSettings);

    if (commonData.roomSecurity) {
      formsSettingsStore.setFolderSecurity(commonData.roomSecurity);
    }
    if (commonData.roomAccess !== undefined) {
      formsSettingsStore.setUserAccess(commonData.roomAccess);
    }

    formsDbSettingsStore.setCollectXlsx(Boolean(commonData.saveFormAsXLSX));
    formsDbSettingsStore.setSendToDb(Boolean(commonData.sendFormToExternalDB));

    if (commonData.user) {
      formsUserStore.setUser(commonData.user);
    }

    if (commonData.defaultProvider) {
      formsAiAgentStore.setDefaultProvider(commonData.defaultProvider);
    }

    // Pre-cache virtual folder IDs so pages don't need extra SSR fetches
    if (commonData.doneFolderId) {
      formsAiAgentStore.setDoneFolderId(commonData.doneFolderId);
    }
    if (commonData.inProgressFolderId) {
      formsSettingsStore.setInProgressFolderId(commonData.inProgressFolderId);
    }

    // Hydrate initial my-forms file list from layout SSR (first load only)
    if (commonData.initialFiles) {
      const roomId = Number(commonData.roomId);
      const files = roomId
        ? commonData.initialFiles.filter((f) => f.folderId === roomId)
        : commonData.initialFiles;
      formsListStore.setItems(files, commonData.initialTotal ?? files.length);
      formsListStore.setFolders([]);
      formsListStore.setIsLoading(false);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!window.ClientConfig) {
      window.ClientConfig = {} as NonNullable<typeof window.ClientConfig>;
    }

    const prevIsFrame = window.ClientConfig.isFrame;
    window.ClientConfig.isFrame = true;

    settingsStore.setFilesViewAs("tile");

    return () => {
      if (window.ClientConfig) {
        window.ClientConfig.isFrame = prevIsFrame;
      }
    };
  }, [settingsStore]);

  return isReady;
}
