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

import { FolderType } from "@docspace/shared/enums";
import { isOAuthFrame } from "@docspace/shared/utils/oauthToken";

import { getUrlByDefaultFolderType } from "./utils";

export type TStartPageContext = {
  /** The portal's AI switch. Gates the AI Agents section entirely. */
  aiServicesEnabled?: boolean;
  /** Guests have no personal Files section. */
  isGuest?: boolean;
};

/**
 * Whether the section a Default Homepage value points at is reachable for this
 * user right now. Both the setting's own option list and entry routing ask
 * this, so a section that has been taken away can never stay selected in one
 * place while still being navigated to in the other.
 *
 * The AI Agents routes sit behind `PrivateRoute requireAIServices`, so sending
 * a user there with AI services off answers 404 rather than opening a section.
 */
export const isStartPageAvailable = (
  folderType: FolderType,
  { aiServicesEnabled = true, isGuest = false }: TStartPageContext = {},
) => {
  if (folderType === FolderType.AIAgents) return aiServicesEnabled;
  if (folderType === FolderType.USER) return !isGuest;

  return true;
};

/**
 * The Default Homepage value to actually act on. Home is the fallback, both
 * for a portal that has never set the value and for a setting whose section is
 * no longer available to this user.
 *
 * The stored value is deliberately left untouched: losing access to a section
 * is often temporary (a portal turns AI back on, a guest is promoted), and
 * rewriting the user's own choice on their behalf would not survive that.
 */
export const getEffectiveDefaultFolderType = (
  folderType: FolderType | undefined,
  context: TStartPageContext = {},
) => {
  const type = folderType ?? FolderType.DEFAULT;

  return isStartPageAvailable(type, context) ? type : FolderType.DEFAULT;
};

/**
 * Where the app opens: the URL of this user's Default Homepage.
 *
 * Embedded OAuth frames are the one exception. They host an integration that
 * expects the file view, and the Overview is a full portal home page (profile
 * card, create tiles, welcome tour) that has no meaning inside a picker, so a
 * frame that has no explicit setting of its own opens Rooms instead of Home.
 * An explicitly chosen section is still honoured there.
 */
export const getDefaultStartPageUrl = (
  folderType: FolderType | undefined,
  context: TStartPageContext = {},
): string => {
  const type = getEffectiveDefaultFolderType(folderType, context);

  if (type === FolderType.DEFAULT && isOAuthFrame())
    return getUrlByDefaultFolderType(FolderType.Rooms);

  return getUrlByDefaultFolderType(type);
};