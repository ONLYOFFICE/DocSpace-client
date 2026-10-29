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

import React from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";
import { aiProjectToRoom } from "@docspace/shared/api/ai/projects";

import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
// The icons of the matching items of the rooms context menu
// (filesContextOptions.helpers / folderModel.helpers), so the two menus read alike.
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import LeaveReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { errorMessage } from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { isOwner, projectLink } from "../utils";

type Options = {
  /** The list menu starts with "Open"; the project header's does not. */
  withOpen?: boolean;
  onOpen?: (project: TAiProject) => void;
};

/**
 * The context menu of a project, by the caller's role: the owner gets
 * everything, a project manager everything but ownership and deletion, a
 * member only pin, notifications, link, info and leave. The dialogs are the room ones
 * (invite panel, change owner, leave, info panel), opened through the
 * stores on the project put into the files selection as a room.
 */
export const useProjectContextMenu = (
  store: AiProjectsStore,
  { withOpen = false, onOpen }: Options = {},
) => {
  const { t } = useTranslation(["Common"]);
  const dialogsStore = useStore("dialogsStore");
  const filesStore = useStore("filesStore");
  const infoPanelStore = useStore("infoPanelStore");

  return React.useCallback(
    (project: TAiProject): ContextMenuModel[] => {
      const { security } = project;
      const model: ContextMenuModel[] = [];
      const selectAsRoom = () => filesStore.setBufferSelection(aiProjectToRoom(project) as never);

      if (withOpen) {
        model.push({
          key: "open",
          label: t("Common:Open"),
          icon: FolderReactSvgUrl,
          onClick: () => onOpen?.(project),
        });
        model.push({ key: "sep-open", isSeparator: true });
      }

      if (security.Pin) {
        model.push({
          key: "pin",
          label: project.pinned ? t("Common:Unpin") : t("Common:PinToTop"),
          icon: project.pinned ? UnpinReactSvgUrl : PinReactSvgUrl,
          onClick: () => void store.togglePin(project),
        });
      }

      if (security.Mute) {
        model.push({
          key: project.mute ? "unmute" : "mute",
          label: project.mute ? t("Common:EnableNotifications") : t("Common:DisableNotifications"),
          icon: project.mute ? UnmuteReactSvgUrl : MuteReactSvgUrl,
          onClick: () => {
            const muting = !project.mute;
            store
              .toggleMute(project)
              .then(() =>
                toastr.success(
                  muting
                    ? t("Common:AIProjectNotificationsDisabled")
                    : t("Common:AIProjectNotificationsEnabled"),
                ),
              )
              .catch((e: unknown) => toastr.error(errorMessage(e)));
          },
        });
      }

      if (security.EditRoom) {
        model.push({ key: "sep-edit", isSeparator: true });
        model.push({
          key: "edit",
          label: t("Common:AIProjectEdit"),
          icon: SettingsReactSvgUrl,
          onClick: () => store.openEditDialog(project),
        });
      }
      if (security.Duplicate) {
        model.push({
          key: "duplicate",
          label: t("Common:Duplicate"),
          icon: DuplicateReactSvgUrl,
          onClick: () => void store.duplicateProject(project),
        });
      }
      if (security.EditAccess) {
        model.push({
          key: "invite",
          label: t("Common:InviteContacts"),
          icon: PersonReactSvgUrl,
          onClick: () =>
            dialogsStore.setInvitePanelOptions({
              visible: true,
              roomId: project.id,
              hideSelector: false,
              defaultAccess: AiProjectAccess.Member,
            }),
        });
      }
      if (security.ChangeOwner) {
        model.push({
          key: "change-owner",
          label: t("Common:AIProjectChangeOwner"),
          icon: ReconnectSvgUrl,
          onClick: () => {
            selectAsRoom();
            dialogsStore.setChangeRoomOwnerIsVisible(true);
          },
        });
      }

      model.push({
        key: "copy-link",
        label: t("Common:CopyLink"),
        icon: InvitationLinkReactSvgUrl,
        onClick: () => {
          copyShareLink(projectLink(project));
          toastr.success(t("Common:LinkCopySuccess"));
        },
      });
      model.push({
        key: "info",
        label: t("Common:AIProjectInfo"),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => {
          selectAsRoom();
          infoPanelStore.setIsVisible(true);
        },
      });

      if (security.Leave && !isOwner(project)) {
        model.push({ key: "sep-leave", isSeparator: true });
        model.push({
          key: "leave",
          label: t("Common:AIProjectLeave"),
          icon: LeaveReactSvgUrl,
          onClick: () => store.openLeave(project),
        });
      }
      if (security.Delete) {
        model.push({ key: "sep-delete", isSeparator: true });
        model.push({
          key: "delete",
          label: t("Common:AIProjectDelete"),
          icon: RemoveReactSvgUrl,
          onClick: () => store.openDelete(project),
        });
      }
      return model;
    },
    [store, t, withOpen, onOpen, dialogsStore, filesStore, infoPanelStore],
  );
};

export default useProjectContextMenu;
