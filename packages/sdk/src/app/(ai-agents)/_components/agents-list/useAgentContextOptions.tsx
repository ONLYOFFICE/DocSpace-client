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
import { useTranslation } from "react-i18next";

import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { TAgent } from "@docspace/shared/api/ai/types";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import PinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

import {
  useAgentsListStore,
  useAgentDialogsStore,
  useAgentsUserStore,
} from "../../_store";

const buildAgentLink = (agent: TAgent) =>
  `${window.location.origin}/ai-agents/${agent.id}`;

/**
 * Builds the per-agent context menu — mirrors the AI-agent-specific
 * branches of client `ContextOptionsStore.getFilesContextOptions`
 * (edit-agent / copy-link / change-owner / delete). Items the SDK can't
 * surface (room-info, leave-room, invite, ask-AI, etc.) are intentionally
 * omitted.
 */
export const useAgentContextOptions = () => {
  const { t } = useTranslation(["Common"]);
  const listStore = useAgentsListStore();
  const dialogsStore = useAgentDialogsStore();
  const userStore = useAgentsUserStore();

  return React.useCallback(
    (agent: TAgent): ContextMenuModel[] => {
      const sec = agent.security;

      const items: ContextMenuModel[] = [];

      // edit-agent
      if (sec?.EditRoom !== false) {
        items.push({
          id: "option_edit-agent",
          key: "edit-agent",
          label: t("Common:EditAgent", { defaultValue: "Edit agent" }),
          icon: SettingsReactSvgUrl,
          onClick: () => dialogsStore.setEditAgentDialogVisible(true, agent),
        });
      }

      // copy-link
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

      // pin / unpin
      if (sec?.Pin) {
        const isPinned = !!agent.pinned;
        items.push({
          id: isPinned ? "option_unpin-room" : "option_pin-room",
          key: isPinned ? "unpin-room" : "pin-room",
          label: isPinned
            ? t("Common:Unpin", { defaultValue: "Unpin" })
            : t("Common:Pin", { defaultValue: "Pin" }),
          icon: isPinned ? UnpinReactSvgUrl : PinReactSvgUrl,
          onClick: () => {
            void listStore.togglePinAgent(agent).catch((e) => {
              toastr.error(e instanceof Error ? e.message : String(e));
            });
          },
        });
      }

      // leave-room (only when current user is a non-owner member of the room)
      const currentUserId = userStore.user?.id;
      if (currentUserId && agent.inRoom && !agent.security?.EditRoom) {
        items.push({
          id: "option_leave-room",
          key: "leave-room",
          label: t("Common:LeaveTheAgent", { defaultValue: "Leave the agent" }),
          icon: LeaveRoomSvgUrl,
          onClick: () => {
            const isOwner = agent.createdBy?.id === currentUserId;
            dialogsStore.setLeaveAgentDialogVisible(true, agent, isOwner);
          },
        });
      }

      // change-agent-owner — SDK doesn't ship the standalone dialog; route
      // to the agent edit dialog (which embeds the inline ChangeRoomOwner
      // control) as a reasonable bridge.
      if (sec?.ChangeOwner) {
        items.push({
          id: "option_change-room-owner",
          key: "change-agent-owner",
          label: t("Common:OwnerChange", {
            defaultValue: "Change owner",
          }),
          icon: ReconnectSvgUrl,
          onClick: () => dialogsStore.setEditAgentDialogVisible(true, agent),
        });
      }

      // delete
      if (sec?.Delete) {
        if (items.length > 0) {
          items.push({ key: "agent-context-separator", isSeparator: true });
        }
        items.push({
          id: "option_delete",
          key: "delete",
          label: t("Common:DeleteAgent", { defaultValue: "Delete agent" }),
          icon: TrashReactSvgUrl,
          onClick: () => {
            dialogsStore.setDeleteAgentDialogVisible(true, agent);
          },
        });
      }

      return items;
    },
    [t, dialogsStore, listStore, userStore],
  );
};

export default useAgentContextOptions;
