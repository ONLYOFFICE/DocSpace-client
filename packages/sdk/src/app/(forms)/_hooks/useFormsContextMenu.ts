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

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import { FormsSection } from "@/types/forms";

import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import useFormsActions from "./useFormsActions";
import { sectionFromPathname } from "../_utils/sectionFromPathname";

export type TFormsContextMenuItem = {
  id: string;
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export default function useFormsContextMenu() {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const { openPanelWithAgent, askFromDBAgentId } = useFormsAiAgentStore();
  const { hasManagementAccess } = useFormsSettingsStore();

  const {
    openForm,
    deleteFromList,
    downloadFile,
    startFilling,
    resetFilling,
    downloadFolder,
    deleteFolderFromList,
  } = useFormsActions({ t });

  const getContextMenuModel = useCallback(
    (file: TFile): TFormsContextMenuItem[] => {
      const model: TFormsContextMenuItem[] = [];

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

      switch (activeSection) {
        case FormsSection.MyForms: {
          if (canEdit) {
            model.push({
              id: "option_edit",
              key: "edit",
              label: t("Common:EditButton"),
              icon: PencilReactSvgUrl,
              onClick: () => openForm(file, "edit"),
              disabled: false,
            });
          }

          if (canFillForm) {
            model.push({
              id: "option_fill-form",
              key: "fill-form",
              label: t("Common:FillFormButton"),
              icon: FormFillRectSvgUrl,
              onClick: () => openForm(file, "fill"),
              disabled: false,
            });

            if (askFromDBAgentId && hasManagementAccess) {
              model.push({
                id: "option_ask-from-db",
                key: "ask-from-db",
                label: t("Common:AskFromDB"),
                icon: AiAgentsReactSvgUrl,
                onClick: () => openPanelWithAgent(askFromDBAgentId, file),
                disabled: false,
              });
            }
          }

          if (canStartFilling) {
            model.push({
              id: "option_start-filling",
              key: "start-filling",
              label: t("Common:StartFilling"),
              icon: FormFillRectSvgUrl,
              onClick: () => startFilling(file),
              disabled: false,
            });
          }

          if (canResetFilling) {
            model.push({
              id: "option_reset-filling",
              key: "reset-filling",
              label: t("Common:ResetAndStartFilling"),
              icon: BackupSvgUrl,
              onClick: () => resetFilling(file),
              disabled: false,
            });
          }

          model.push({
            id: "option_view",
            key: "view",
            label: t("Common:View"),
            icon: EyeReactSvgUrl,
            onClick: () => openForm(file, "view"),
            disabled: false,
          });

          if (canDownload) {
            model.push({
              id: "option_download",
              key: "download",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadFile(file.id),
              disabled: false,
            });
          }

          if (canDelete) {
            model.push({
              id: "option_delete",
              key: "delete",
              label: t("Common:Delete"),
              icon: TrashReactSvgUrl,
              onClick: () => deleteFromList(file.id),
              disabled: false,
            });
          }
          break;
        }

        case FormsSection.InProgress: {
          if (canFillForm) {
            model.push({
              id: "option_fill-form",
              key: "fill-form",
              label: t("Common:FillFormButton"),
              icon: FormFillRectSvgUrl,
              onClick: () => openForm(file, "fill"),
              disabled: false,
            });
          }

          model.push({
            id: "option_view",
            key: "view",
            label: t("Common:View"),
            icon: EyeReactSvgUrl,
            onClick: () => openForm(file, "view"),
            disabled: false,
          });

          if (canDownload) {
            model.push({
              id: "option_download",
              key: "download",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadFile(file.id),
              disabled: false,
            });
          }
          break;
        }

        case FormsSection.CompletedForms: {
          model.push({
            id: "option_view",
            key: "view",
            label: t("Common:View"),
            icon: EyeReactSvgUrl,
            onClick: () => openForm(file, "view"),
            disabled: false,
          });

          if (canDownload) {
            model.push({
              id: "option_download",
              key: "download",
              label: t("Common:Download"),
              icon: DownloadReactSvgUrl,
              onClick: () => downloadFile(file.id),
              disabled: false,
            });
          }
          break;
        }
      }

      return model;
    },
    [
      t,
      activeSection,
      openForm,
      deleteFromList,
      downloadFile,
      startFilling,
      resetFilling,
      openPanelWithAgent,
      askFromDBAgentId,
      hasManagementAccess,
    ],
  );

  const getFolderContextMenuModel = useCallback(
    (folder: TFolder, onOpen?: () => void): TFormsContextMenuItem[] => {
      const model: TFormsContextMenuItem[] = [];

      if (onOpen) {
        model.push({
          id: "option_open-folder",
          key: "open-folder",
          label: t("Common:Open"),
          icon: EyeReactSvgUrl,
          onClick: onOpen,
          disabled: false,
        });
      }

      if (folder.security?.Download) {
        model.push({
          id: "option_download-folder",
          key: "download-folder",
          label: t("Common:Download"),
          icon: DownloadReactSvgUrl,
          onClick: () => downloadFolder(folder.id),
          disabled: false,
        });
      }

      if (folder.security?.Delete) {
        model.push({
          id: "option_delete-folder",
          key: "delete-folder",
          label: t("Common:Delete"),
          icon: TrashReactSvgUrl,
          onClick: () => deleteFolderFromList(folder.id),
          disabled: false,
        });
      }

      return model;
    },
    [t, downloadFolder, deleteFolderFromList],
  );

  return { getContextMenuModel, getFolderContextMenuModel };
}
