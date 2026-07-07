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

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TAgent } from "@docspace/shared/api/ai/types";

import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import MuteReactSvgUrl from "PUBLIC_DIR/images/icons/16/mute.react.svg?url";
import UnmuteReactSvgUrl from "PUBLIC_DIR/images/unmute.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import DotsHorizontalUrl from "PUBLIC_DIR/images/icons/16/dots-horizontal.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import {
  useAgentsListStore,
  useAgentDialogsStore,
  useAgentsUserStore,
  useAgentInfoPanelStore,
} from "../../_store";

const buildAgentLink = (agent: TAgent) =>
  `${window.location.origin}/ai-agents/${agent.id}`;

/**
 * Builds the per-agent context menu — 1-to-1 with the client
 * `ContextOptionsStore.getFilesContextOptions` AI-agent branch
 * (ContextOptionsStore.js:2136-2802). Items, order, icons, separators and
 * keys are aligned so QA visual diff against the client kebab is "no diff".
 *
 * "More options" entries (Download / Agent info / Change owner) are nested
 * via `ContextMenuType.items` — ui-kit supports recursive submenus.
 */
export const useAgentContextOptions = () => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const listStore = useAgentsListStore();
  const dialogsStore = useAgentDialogsStore();
  const userStore = useAgentsUserStore();
  const infoPanelStore = useAgentInfoPanelStore();

  return React.useCallback(
    (agent: TAgent): ContextMenuModel[] => {
      const sec = agent.security;
      const currentUserId = userStore.user?.id;

      // ----- Submenu under "More options" -----
      const moreOptionsItems: ContextMenuModel[] = [];

      // Download
      if (sec?.Download) {
        moreOptionsItems.push({
          id: "option_download",
          key: "download",
          label: t("Common:Download", { defaultValue: "Download" }),
          icon: DownloadReactSvgUrl,
          onClick: () => {
            void listStore.downloadAgent(agent);
            toastr.success(
              t("Common:ArchivingData", { defaultValue: "Archiving data" }),
            );
          },
        });
      }

      // Agent info
      moreOptionsItems.push({
        id: "option_room-info",
        key: "room-info",
        label: t("Common:AgentInfo", { defaultValue: "Agent info" }),
        icon: InfoOutlineReactSvgUrl,
        onClick: () => infoPanelStore.showInfoPanel(agent, "details"),
      });

      // Change owner
      if (sec?.ChangeOwner) {
        moreOptionsItems.push({
          id: "option_change-room-owner",
          key: "change-agent-owner",
          label: t("Common:OwnerChange", { defaultValue: "Change owner" }),
          icon: ReconnectSvgUrl,
          // Route to the agent edit dialog (which embeds the inline
          // ChangeRoomOwner control). The standalone "Change Room Owner"
          // dialog is not yet ported into the SDK.
          onClick: () => dialogsStore.setEditAgentDialogVisible(true, agent),
        });
      }

      // ----- Top-level items -----
      const items: ContextMenuModel[] = [];

      // 1. Select
      items.push({
        id: "option_select",
        key: "select",
        label: t("Common:SelectAction", { defaultValue: "Select" }),
        icon: CheckBoxReactSvgUrl,
        onClick: () => listStore.toggleAgentSelection(agent),
      });

      // 2. Open
      items.push({
        id: "option_open",
        key: "open",
        label: t("Common:Open", { defaultValue: "Open" }),
        icon: FolderReactSvgUrl,
        onClick: () => router.push(`/ai-agents/${agent.id}?tab=chat`),
      });

      items.push({ key: "separator0", isSeparator: true });

      // 3. Pin / Unpin
      if (sec?.Pin) {
        const isPinned = !!agent.pinned;
        items.push({
          id: isPinned ? "option_unpin-room" : "option_pin-room",
          key: isPinned ? "unpin-room" : "pin-room",
          label: isPinned
            ? t("Common:Unpin", { defaultValue: "Unpin" })
            : t("Common:PinToTop", { defaultValue: "Pin to top" }),
          icon: isPinned ? UnpinReactSvgUrl : PinReactSvgUrl,
          onClick: () => {
            void listStore.togglePinAgent(agent).catch((e) => {
              toastr.error(e instanceof Error ? e.message : String(e));
            });
          },
        });
      }

      // 4. Disable / Enable notifications (mute)
      if (sec?.Mute && agent.inRoom) {
        const isMuted = !!agent.mute;
        items.push({
          id: isMuted ? "option_unmute-room" : "option_mute-room",
          key: isMuted ? "unmute-room" : "mute-room",
          label: isMuted
            ? t("Common:EnableNotifications", {
                defaultValue: "Enable notifications",
              })
            : t("Common:DisableNotifications", {
                defaultValue: "Disable notifications",
              }),
          icon: isMuted ? UnmuteReactSvgUrl : MuteReactSvgUrl,
          onClick: () => listStore.toggleMuteAgent(agent, t),
        });
      }

      items.push({ key: "separator1", isSeparator: true });

      // 5. Edit Agent
      if (sec?.EditRoom !== false) {
        items.push({
          id: "option_edit-agent",
          key: "edit-agent",
          label: t("Common:EditAgent", { defaultValue: "Edit agent" }),
          icon: SettingsReactSvgUrl,
          onClick: () => dialogsStore.setEditAgentDialogVisible(true, agent),
        });
      }

      // 6. Invite contacts — intentionally omitted in the SDK menu.
      //    The client InvitePanel pulls in too many client-only deps
      //    (AccessSelector, LinkSettingsPanel, withCultureNames, ~7 store
      //    fields across 5 stores) and ~60 locale keys spread over 4
      //    namespaces. We don't surface a half-broken stub — the entry is
      //    dropped until the panel can be ported in full.

      // 7. Copy link
      if (sec?.CopyLink !== false) {
        items.push({
          id: "option_link-for-room-members",
          key: "link-for-room-members",
          label: t("Common:CopyLink", { defaultValue: "Copy link" }),
          icon: InvitationLinkReactSvgUrl,
          onClick: () => {
            const url = buildAgentLink(agent);
            void navigator.clipboard
              .writeText(url)
              .then(() => {
                toastr.success(
                  t("Common:LinkCopySuccess", {
                    defaultValue: "Link copied to the clipboard",
                  }),
                );
              })
              .catch((err) => {
                toastr.error(err instanceof Error ? err.message : String(err));
              });
          },
        });
      }

      // 8. More options (nested) — only show when there's at least one
      // sub-item to surface.
      if (moreOptionsItems.length > 0) {
        items.push({
          id: "option_more-options",
          key: "more-options",
          label: t("Common:MoreOptions", { defaultValue: "More options" }),
          icon: DotsHorizontalUrl,
          items: moreOptionsItems,
        });
      }

      items.push({ key: "separator5", isSeparator: true });

      // 9. Leave the agent — only when the viewer is a non-owner member of
      // the room.
      if (currentUserId && agent.inRoom && !sec?.EditRoom) {
        items.push({
          id: "option_leave-room",
          key: "leave-room",
          label: t("Common:LeaveTheAgent", {
            defaultValue: "Leave the agent",
          }),
          icon: LeaveRoomSvgUrl,
          onClick: () => {
            const isOwner = agent.createdBy?.id === currentUserId;
            dialogsStore.setLeaveAgentDialogVisible(true, agent, isOwner);
          },
        });
      }

      // 10. Delete agent
      if (sec?.Delete) {
        items.push({
          id: "option_delete",
          key: "delete",
          label: t("Common:DeleteAgent", { defaultValue: "Delete agent" }),
          icon: TrashReactSvgUrl,
          onClick: () => dialogsStore.setDeleteAgentDialogVisible(true, agent),
        });
      }

      return items;
    },
    [t, dialogsStore, listStore, userStore, infoPanelStore, router],
  );
};

export default useAgentContextOptions;
