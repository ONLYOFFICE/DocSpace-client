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

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import BackupSvgUrl from "PUBLIC_DIR/images/icons/16/backup.svg?url";
import AiAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/ai-agents.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import SpreadsheetSvgUrl from "PUBLIC_DIR/images/icons/16/spreadsheet.svg?url";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { frameCallEvent } from "@docspace/shared/utils/common";

import { FormsSection } from "@/types/forms";
import type { CustomContextMenuAction } from "@/types/forms";

import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsDbSettingsStore } from "../_store/FormsDbSettingsStore";
import { useFormsCustomActionsStore } from "../_store/FormsCustomActionsStore";
import useFormsActions from "./useFormsActions";
import { sectionFromPathname } from "../_utils/sectionFromPathname";

type ContextMenuItem = {
  id: string;
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
  isSeparator?: false;
};

type ContextMenuSeparator = {
  id: string;
  key: string;
  label: "";
  icon: "";
  onClick: () => void;
  disabled: false;
  isSeparator: true;
};

export type TFormsContextMenuItem = ContextMenuItem | ContextMenuSeparator;

const CUSTOM_ACTIONS_KEY = "custom-actions";

const makeSeparator = (key: string): ContextMenuSeparator => ({
  id: `separator_${key}`,
  key,
  label: "",
  icon: "",
  onClick: () => {},
  disabled: false,
  isSeparator: true,
});

const isSeparatorItem = (
  item: TFormsContextMenuItem,
): item is ContextMenuSeparator => item.isSeparator === true;

const dropDanglingSeparators = (
  items: TFormsContextMenuItem[],
): TFormsContextMenuItem[] => {
  const result: TFormsContextMenuItem[] = [];
  for (const item of items) {
    if (isSeparatorItem(item)) {
      const last = result[result.length - 1];
      if (!last || isSeparatorItem(last)) continue;
      result.push(item);
    } else {
      result.push(item);
    }
  }
  while (result.length && isSeparatorItem(result[result.length - 1])) {
    result.pop();
  }
  return result;
};

export default function useFormsContextMenu() {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const { openPanelWithAgent, askFromDBAgentId } = useFormsAiAgentStore();
  const { hasManagementAccess } = useFormsSettingsStore();
  const { sendToDb } = useFormsDbSettingsStore();

  const {
    openForm,
    deleteFromList,
    downloadFile,
    startFilling,
    resetFilling,
    stopFilling,
    syncXlsxData,
    downloadFolder,
    deleteFolderFromList,
  } = useFormsActions({ t });
  const { fileActions, folderActions } = useFormsCustomActionsStore();

  const buildCustomItems = useCallback(
    (
      actions: CustomContextMenuAction[],
      type: "file" | "folder",
      item: TFile | TFolder,
    ): ContextMenuItem[] => {
      const filtered = actions.filter(
        (a) => !a.section || a.section.includes(activeSection),
      );

      return filtered.map((action) => ({
        id: `custom_${action.key}`,
        key: action.key,
        label: action.label,
        icon: action.icon ?? "",
        disabled: false,
        onClick: () => {
          frameCallEvent({
            event: "onCustomAction",
            data: { action: action.key, type, item },
          });
        },
      }));
    },
    [activeSection],
  );

  const getContextMenuModel = useCallback(
    (file: TFile): TFormsContextMenuItem[] => {
      const isPreparing = file.isFillingPreparing;
      const canEdit =
        !isPreparing &&
        file.security?.Edit &&
        file.viewAccessibility?.WebEdit;
      const canFillForm =
        !isPreparing &&
        file.security?.FillForms &&
        file.viewAccessibility?.WebRestrictedEditing;
      const canDownload = file.security?.Download;
      const canDelete = file.security?.Delete;
      const canStartFilling = !isPreparing && file.security?.StartFilling;
      const canResetFilling = !isPreparing && file.security?.ResetFilling;
      const canStopFilling = file.security?.StopFilling;
      const canUpdateXlsx = file.security?.UpdateXlsx;
      const canAskFromDb =
        Boolean(askFromDBAgentId) && hasManagementAccess && sendToDb;

      const optionsModel: Partial<
        Record<string, TFormsContextMenuItem | null>
      > = {
        "fill-form": canFillForm
          ? {
              id: "option_fill-form",
              key: "fill-form",
              label: t("Common:FillFormButton"),
              icon: FormFillRectSvgUrl,
              onClick: () => openForm(file, "fill"),
              disabled: false,
            }
          : null,
        edit: canEdit
          ? {
              id: "option_edit",
              key: "edit",
              label: t("Common:EditButton"),
              icon: PencilReactSvgUrl,
              onClick: () => openForm(file, "edit"),
              disabled: false,
            }
          : null,
        separator0: makeSeparator("separator0"),
        "update-xlsx-data": canUpdateXlsx
          ? {
              id: "option_update-xlsx-data",
              key: "update-xlsx-data",
              label: t("Common:SyncXlsxData"),
              icon: SpreadsheetSvgUrl,
              onClick: () => syncXlsxData(file),
              disabled: false,
            }
          : null,
        "separator-after-xlsx": makeSeparator("separator-after-xlsx"),
        "ask-from-db":
          canFillForm && canAskFromDb && askFromDBAgentId
            ? {
                id: "option_ask-from-db",
                key: "ask-from-db",
                label: t("Common:AskFromDB"),
                icon: AiAgentsReactSvgUrl,
                onClick: () => openPanelWithAgent(askFromDBAgentId, file),
                disabled: false,
              }
            : null,
        separator6: makeSeparator("separator6"),
        "start-filling": canStartFilling
          ? {
              id: "option_start-filling",
              key: "start-filling",
              label: t("Common:StartFilling"),
              icon: FormFillRectSvgUrl,
              onClick: () => startFilling(file),
              disabled: false,
            }
          : null,
        "reset-filling": canResetFilling
          ? {
              id: "option_reset-filling",
              key: "reset-filling",
              label: t("Common:ResetAndStartFilling"),
              icon: BackupSvgUrl,
              onClick: () => resetFilling(file),
              disabled: false,
            }
          : null,
        view: {
          id: "option_view",
          key: "view",
          label: t("Common:View"),
          icon: EyeReactSvgUrl,
          onClick: () => openForm(file, "view"),
          disabled: false,
        },
        separator1: makeSeparator("separator1"),
        download: canDownload
          ? {
              id: "option_download",
              key: "download",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadFile(file.id),
              disabled: false,
            }
          : null,
        separator5: makeSeparator("separator5"),
        "separator-after-custom": makeSeparator("separator-after-custom"),
        delete: canDelete
          ? {
              id: "option_delete",
              key: "delete",
              label: t("Common:Delete"),
              icon: TrashReactSvgUrl,
              onClick: () => deleteFromList(file.id),
              disabled: false,
            }
          : null,
        "stop-filling": canStopFilling
          ? {
              id: "option_stop-filling",
              key: "stop-filling",
              label: t("Common:StopFilling"),
              icon: AccessNoneReactSvgUrl,
              onClick: () => stopFilling(file),
              disabled: false,
            }
          : null,
      };

      const sectionKeys: Record<FormsSection, string[]> = {
        [FormsSection.MyForms]: [
          "fill-form",
          "edit",
          "view",
          "separator0",
          "update-xlsx-data",
          "separator-after-xlsx",
          "ask-from-db",
          "separator6",
          "start-filling",
          "reset-filling",
          "separator1",
          "download",
          "separator5",
          CUSTOM_ACTIONS_KEY,
          "separator-after-custom",
          "stop-filling",
          "delete",
        ],
        [FormsSection.InProgress]: [
          "fill-form",
          "view",
          "separator0",
          "update-xlsx-data",
          "separator1",
          "download",
          "separator5",
          CUSTOM_ACTIONS_KEY,
          "separator-after-custom",
          "stop-filling",
        ],
        [FormsSection.CompletedForms]: [
          "view",
          "separator1",
          "download",
          "separator5",
          CUSTOM_ACTIONS_KEY,
        ],
        [FormsSection.Library]: [],
        [FormsSection.Settings]: [],
      };

      const keys = sectionKeys[activeSection] ?? [];
      const customItems = buildCustomItems(fileActions, "file", file);

      const expanded: TFormsContextMenuItem[] = [];
      for (const key of keys) {
        if (key === CUSTOM_ACTIONS_KEY) {
          expanded.push(...customItems);
          continue;
        }
        const item = optionsModel[key];
        if (item) expanded.push(item);
      }

      return dropDanglingSeparators(expanded);
    },
    [
      t,
      activeSection,
      openForm,
      deleteFromList,
      downloadFile,
      startFilling,
      resetFilling,
      stopFilling,
      syncXlsxData,
      openPanelWithAgent,
      askFromDBAgentId,
      hasManagementAccess,
      sendToDb,
      fileActions,
      buildCustomItems,
    ],
  );

  const getFolderContextMenuModel = useCallback(
    (folder: TFolder, onOpen?: () => void): TFormsContextMenuItem[] => {
      const canDownload = folder.security?.Download;
      const canDelete = folder.security?.Delete;
      const canUpdateXlsx = folder.security?.UpdateXlsx;

      const optionsModel: Partial<
        Record<string, TFormsContextMenuItem | null>
      > = {
        "open-folder": onOpen
          ? {
              id: "option_open-folder",
              key: "open-folder",
              label: t("Common:Open"),
              icon: EyeReactSvgUrl,
              onClick: onOpen,
              disabled: false,
            }
          : null,
        separator0: makeSeparator("separator0"),
        "update-xlsx-data": canUpdateXlsx
          ? {
              id: "option_update-xlsx-data",
              key: "update-xlsx-data",
              label: t("Common:SyncXlsxData"),
              icon: SpreadsheetSvgUrl,
              onClick: () => syncXlsxData(folder),
              disabled: false,
            }
          : null,
        separator1: makeSeparator("separator1"),
        "download-folder": canDownload
          ? {
              id: "option_download-folder",
              key: "download-folder",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadFolder(folder.id),
              disabled: false,
            }
          : null,
        separator5: makeSeparator("separator5"),
        "separator-after-custom": makeSeparator("separator-after-custom"),
        "delete-folder": canDelete
          ? {
              id: "option_delete-folder",
              key: "delete-folder",
              label: t("Common:Delete"),
              icon: TrashReactSvgUrl,
              onClick: () => deleteFolderFromList(folder.id),
              disabled: false,
            }
          : null,
      };

      const keys = [
        "open-folder",
        "separator0",
        "update-xlsx-data",
        "separator1",
        "download-folder",
        "separator5",
        CUSTOM_ACTIONS_KEY,
        "separator-after-custom",
        "delete-folder",
      ];
      const customItems = buildCustomItems(folderActions, "folder", folder);

      const expanded: TFormsContextMenuItem[] = [];
      for (const key of keys) {
        if (key === CUSTOM_ACTIONS_KEY) {
          expanded.push(...customItems);
          continue;
        }
        const item = optionsModel[key];
        if (item) expanded.push(item);
      }

      return dropDanglingSeparators(expanded);
    },
    [
      t,
      downloadFolder,
      deleteFolderFromList,
      syncXlsxData,
      folderActions,
      buildCustomItems,
    ],
  );

  return { getContextMenuModel, getFolderContextMenuModel };
}
