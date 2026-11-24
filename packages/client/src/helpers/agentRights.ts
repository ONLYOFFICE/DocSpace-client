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

import { ShareAccessRights } from "@docspace/shared/enums";

/**
 * An agent (an AI project room) as any of its entry points holds it: a room
 * of the Files list, the open folder of the agent's page, or a project read
 * through the projects API. Only the fields the rights are read from.
 */
export type TAgentRightsSource = {
  inRoom?: boolean | null;
  access?: number | null;
  createdBy?: { id?: string | null } | null;
  security?: Partial<Record<string, boolean>> | null;
  aiProject?: { canEditSettings?: boolean | null } | null;
};

/** What the user is offered on one agent (`ai-agent-access`). */
export type TAgentRights = {
  /** In the agent: its chat, and the agent in the agents menus. */
  isMember: boolean;
  /** The Agent owner, who changes the owner before leaving. */
  isOwner: boolean;
  chat: boolean;
  info: boolean;
  /** Edit agent, and the "Manage ..." rows of its skill sets and knowledge bases. */
  edit: boolean;
  /** Share agent: inviting, changing roles and removing members. */
  share: boolean;
  delete: boolean;
  changeOwner: boolean;
  leave: boolean;
  pin: boolean;
  /** Notifications on and off. */
  mute: boolean;
};

/**
 * Every agent action, answered in one place from the rights the server
 * returns for this agent and this user (the room's `security`) and from
 * whether the user is in the agent. The card menu, the page menu and
 * header, the chat panel's "Agent actions" and the Info panel all ask it,
 * so they give the same answer.
 *
 * A DocSpace admin outside the agent reads it with the room's full rights,
 * yet is offered only what does not need membership: Agent info, pin, copy
 * link, change owner and Delete agent. The chat, Edit agent, Share agent,
 * notifications and leave are for members. The Agent owner is told by the
 * room's owner when the user is known, else by the access the room answers.
 */
export const getAgentRights = (
  agent: TAgentRightsSource | null | undefined,
  userId?: string | null,
): TAgentRights => {
  const security = agent?.security ?? {};
  const isMember = !!agent?.inRoom;
  const ownerId = agent?.createdBy?.id;
  const isOwner =
    isMember &&
    (userId && ownerId
      ? ownerId === userId
      : // `AiProjectAccess.Owner`: the room's full access.
        agent?.access === ShareAccessRights.FullAccess);
  const canEditSettings =
    agent?.aiProject?.canEditSettings ?? !!security.EditRoom;
  return {
    isMember,
    isOwner,
    chat: isMember,
    info: isMember || !!security.Read,
    edit: isMember && !!canEditSettings,
    share: isMember && !!security.EditAccess,
    delete: !!security.Delete,
    changeOwner: !!security.ChangeOwner,
    leave: isMember && !isOwner,
    pin: !!security.Pin,
    mute: isMember && !!security.Mute,
  };
};
