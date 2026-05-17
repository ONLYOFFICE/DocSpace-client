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

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type {
  TFile,
  TFilesSettings,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";
import type { TDefaultProvider } from "@docspace/shared/api/ai/types";
import { ShareAccessRights } from "@docspace/ui-kit/enums";
import { FormsSection } from "@/types/forms";

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
  initialFolders?: TFolder[];
  initialSection?: FormsSection;
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

    if (commonData.doneFolderId) {
      formsAiAgentStore.setDoneFolderId(commonData.doneFolderId);
    }
    if (commonData.inProgressFolderId) {
      formsSettingsStore.setInProgressFolderId(commonData.inProgressFolderId);
    }

    if (commonData.initialFiles) {
      const roomId = Number(commonData.roomId);
      const files = roomId
        ? commonData.initialFiles.filter((f) => f.folderId === roomId)
        : commonData.initialFiles;
      formsListStore.setSection(FormsSection.MyForms);
      const FORMS_PAGE_COUNT = 25;
      const apiExhausted = commonData.initialFiles.length < FORMS_PAGE_COUNT;
      const total = apiExhausted ? files.length : files.length + 1;
      formsListStore.setItems(files, total);
      formsListStore.setFolders([]);
      formsListStore.setIsLoading(false);
    } else if (
      commonData.initialFolders &&
      commonData.initialFolders.length > 0 &&
      commonData.initialSection &&
      (commonData.initialSection === FormsSection.InProgress ||
        commonData.initialSection === FormsSection.CompletedForms)
    ) {
      formsListStore.setSection(commonData.initialSection);
      formsListStore.setItems([], 0);
      formsListStore.setFolders(commonData.initialFolders);
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
