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

import { inject, observer } from "mobx-react";

import {
  INSTRUCTIONS_ROOM_TYPE,
  KNOWLEDGE_ROOM_TYPE,
  type TAiProjectSource,
} from "@docspace/shared/api/ai/projects";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import AgentRoomsSelector from "SRC_DIR/pages/AiProjects/sub-components/dialogs/AgentRoomsSelector";

type AiProjectRoomsDialogProps = {
  aiProjectsStore: AiProjectsStore;
};

/**
 * The selector of an agent's Skill sets or Knowledge bases outside its form,
 * mounted with the other Files panels: "Manage skill sets..." and "Manage
 * knowledge bases..." of the agent's Info panel and of its chat open it.
 * The pick is saved to the agent at once.
 */
const AiProjectRoomsDialog = ({ aiProjectsStore }: AiProjectRoomsDialogProps) => {
  const state = aiProjectsStore.roomsSelector;
  if (!state) return null;

  const { id, kind, rooms } = state;
  const onSubmit = (picked: TAiProjectSource[]) => {
    aiProjectsStore.closeRoomsSelector();
    void aiProjectsStore.setRooms(id, kind, picked);
  };

  return (
    <AgentRoomsSelector
      useAside
      roomType={kind === "instructions" ? INSTRUCTIONS_ROOM_TYPE : KNOWLEDGE_ROOM_TYPE}
      selected={rooms}
      onSubmit={onSubmit}
      onClose={aiProjectsStore.closeRoomsSelector}
    />
  );
};

export default inject(({ aiProjectsStore }: TStore) => ({ aiProjectsStore }))(
  observer(AiProjectRoomsDialog),
);
