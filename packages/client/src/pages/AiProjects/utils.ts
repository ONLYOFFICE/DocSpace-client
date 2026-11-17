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

import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";
import { isChatCapableProfile } from "@docspace/shared/api/ai/enums";

export const isManager = (project: TAiProject) =>
  project.access === AiProjectAccess.Owner ||
  project.access === AiProjectAccess.ProjectManager;

export const isOwner = (project: TAiProject) =>
  project.access === AiProjectAccess.Owner;

/** Who may create projects and hold the owner / manager roles. */
export const canManageProjects = (user?: {
  isOwner?: boolean;
  isAdmin?: boolean;
  isRoomAdmin?: boolean;
} | null) => !!user && (!!user.isOwner || !!user.isAdmin || !!user.isRoomAdmin);

/**
 * The agent cannot chat, and nothing can be sent in its chat until its model
 * is changed: its own model is gone or cannot chat, or it has none and the
 * portal has no chat model for it to run on (the `Chat` assignment, else the
 * `Default` slot, as the server picks the round's model). `portalHasChatModel`
 * is `null` while unknown; a project read without its settings, or whose
 * model could not be read, is not judged.
 */
export const isAgentModelUnavailable = (
  project: TAiProject,
  portalHasChatModel: boolean | null,
) => {
  const { profile, partial, modelUnread } = project.aiProject;
  if (profile) return profile.available === false;
  return !partial && !modelUnread && portalHasChatModel === false;
};

/** Whether the portal's chat model (`Chat`, else `Default`) exists and can chat. */
export const hasPortalChatModel = (
  chatProfile: { capabilities?: number } | null,
  defaultProfile: { capabilities?: number } | null,
) => {
  const profile = chatProfile ?? defaultProfile;
  return !!profile && isChatCapableProfile(profile);
};

/** The project's address in the AI Rooms section, as a room's "Copy link" gives it. */
export const projectLink = (project: TAiProject) =>
  `${window.location.origin}/ai-rooms/${project.id}/filter?folder=${project.id}`;

/**
 * The model the project form saves. An agent edited without a model of its
 * own (`isEdit` with no `profileId`: none stored, none picked in the form)
 * saves none, so it stays on the portal's chat model and follows it; the
 * default the form shows is not written. A stored model missing from the
 * model list is gone (removed, disabled, no longer chat-capable), so the
 * option shown in its place, the default, is saved instead. Until the whole
 * list is in, a missing model may only be one not read yet: it is saved as
 * it is. `undefined` leaves the model as it is.
 */
export const savedProjectProfileId = (
  profileId: string | null,
  optionKeys: string[],
  shownKey: string | undefined,
  profilesLoaded: boolean,
  isEdit = false,
): string | null | undefined => {
  if (isEdit && profileId === null) return undefined;
  if (!profilesLoaded && profileId && !optionKeys.includes(profileId)) return profileId;
  return shownKey ?? profileId;
};

/**
 * Why a room of the agent form's room picker cannot be linked, or `null`
 * when it can: a Knowledge room while vectorization is off, or a room the
 * user may not manage - the server links only those, and refuses the whole
 * save over one that is not.
 */
export const roomLinkRefusal = (
  room: { security?: { EditRoom?: boolean } | null },
  isKnowledge: boolean,
  vectorizationEnabled: boolean,
): "vectorizationOff" | "noManageRights" | null => {
  if (isKnowledge && !vectorizationEnabled) return "vectorizationOff";
  if (!room.security?.EditRoom) return "noManageRights";
  return null;
};
