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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import RoomSelector from "@onlyoffice/apps-ui-kit/selectors/Room";
import type { TSelectorItem } from "@onlyoffice/apps-ui-kit/components/selector";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { RoomSearchArea } from "@docspace/shared/enums";
import {
  AI_PROJECT_MAX_ROOMS_PER_TYPE,
  INSTRUCTIONS_ROOM_TYPE,
  KNOWLEDGE_ROOM_TYPE,
} from "@docspace/shared/api/ai/projects";
import type {
  TAiProjectCover,
  TAiProjectSource,
} from "@docspace/shared/api/ai/projects";

import { useStore } from "SRC_DIR/store/useStore";

import { roomLinkRefusal } from "../../utils";

export type TAgentRoomType = typeof INSTRUCTIONS_ROOM_TYPE | typeof KNOWLEDGE_ROOM_TYPE;

type AgentRoomsSelectorProps = {
  roomType: TAgentRoomType;
  /** The rooms of that type the agent links: ticked, listed first. */
  selected: TAiProjectSource[];
  onSubmit: (rooms: TAiProjectSource[]) => void;
  onClose: () => void;
  /**
   * Opens as a panel of its own, as the chat's room pickers do; without it
   * the selector fills the container it is put in (the agent's form).
   */
  useAside?: boolean;
};

/**
 * The picked rooms as the agent links them, with the logo the selector read
 * with each room, so the saved agent shows them without reading them back.
 */
const toSources = (items: TSelectorItem[], roomType: TAgentRoomType): TAiProjectSource[] =>
  items.map((item) => {
    const room = item as { color?: string; cover?: TAiProjectCover; icon?: string; iconOriginal?: string };
    return {
      id: Number(item.id),
      title: item.label,
      roomType,
      available: true,
      archived: false,
      logo: {
        color: room.color ? `#${room.color.replace("#", "")}` : "",
        cover: room.cover ?? null,
        medium: typeof room.icon === "string" ? room.icon : undefined,
        original: room.iconOriginal,
      },
    };
  });

/**
 * The selector of an agent's Skill sets (Instructions rooms) or Knowledge
 * bases (Knowledge rooms): the one of the agent's form, and of every
 * "Manage ..." of the agent outside it - its Info panel's Context tab and
 * its chat's composer. Rooms that cannot be linked are listed greyed out
 * with the reason; ticking one past the limit is told.
 */
const AgentRoomsSelector = ({ roomType, selected, onSubmit, onClose, useAside }: AgentRoomsSelectorProps) => {
  const { t } = useTranslation(["Common"]);
  // With vectorization off a Knowledge room cannot be searched, so none can
  // be linked: the selector lists them greyed out, with the reason.
  const vectorizationEnabled = useStore("settingsStore").aiConfig?.vectorizationEnabled !== false;
  const isKnowledge = roomType === KNOWLEDGE_ROOM_TYPE;

  // The limit is never shown up front: only ticking a room past it is told.
  const onRoomsLimitReached = () =>
    toastr.warning(
      isKnowledge
        ? t("Common:AIProjectKnowledgeRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE })
        : t("Common:AIProjectInstructionsRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE }),
    );

  // Why a room cannot be linked, or `null` when it can. The server links
  // only rooms the user may manage, and refuses the whole save over one that
  // is not: those are listed greyed out. A room linked already stays
  // selected and is kept.
  const getRoomDisabledReason = (room: { security?: { EditRoom?: boolean } | null }) => {
    switch (roomLinkRefusal(room, isKnowledge, vectorizationEnabled)) {
      case "vectorizationOff":
        return t("Common:KnowledgeRoomsNeedVectorization");
      case "noManageRights":
        return t("Common:YouDontHaveEnoughPermission");
      default:
        return null;
    }
  };

  const headerLabel = isKnowledge ? t("Common:AIProjectKnowledgeRooms") : t("Common:SkillSets");
  const common = {
    isMultiSelect: true,
    // Room rows come with `disableMultiSelect`; this overrules it, as the
    // "add rooms to a group" dialog does.
    forceIsMultiSelect: true,
    maxSelectedItems: AI_PROJECT_MAX_ROOMS_PER_TYPE,
    onSelectLimitReached: onRoomsLimitReached,
    roomType,
    // Instructions and Knowledge rooms live under the "AI rooms" root, not in Rooms.
    searchArea: RoomSearchArea.AiHub,
    isRoomDisabled: (room: { security?: { EditRoom?: boolean } | null }) => getRoomDisabledReason(room) !== null,
    getRoomDisabledText: (room: { security?: { EditRoom?: boolean } | null }) =>
      getRoomDisabledReason(room) ?? undefined,
    withSearch: true,
    withCancelButton: true as const,
    cancelButtonLabel: t("Common:CancelButton"),
    onCancel: onClose,
    submitButtonLabel: t("Common:SelectAction"),
    selectedItems: selected.map((room) => ({ id: room.id, label: room.title })) as unknown as TSelectorItem[],
    sortSelectedFirst: true,
    onSubmit: (items: TSelectorItem[]) => onSubmit(toSources(items, roomType)),
  };

  return useAside ? (
    <RoomSelector
      {...common}
      useAside
      onClose={onClose}
      withHeader
      headerProps={{ headerLabel, onCloseClick: onClose, isCloseable: true }}
    />
  ) : (
    <RoomSelector
      {...common}
      onClose={onClose}
      withHeader
      headerProps={{
        headerLabel,
        onCloseClick: onClose,
        onBackClick: onClose,
        withoutBackButton: false,
        withoutBorder: false,
      }}
    />
  );
};

export default observer(AgentRoomsSelector);
