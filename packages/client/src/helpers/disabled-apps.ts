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

import { isArbiterEnabled } from "@docspace/shared/utils/arbiter";
import { isPrivateRoomsEnabled } from "@docspace/shared/utils/privateRooms";

import type { AppId } from "./apps-catalog";

const TEMPORARILY_DISABLED_APPS: ReadonlySet<string> = new Set<AppId>();

// Apps that are built but not released yet, each hidden behind its own opt-in
// flag so testers can still reach them. Private rooms ("e2e-rooms") wait on the
// editors side of the feature, see @docspace/shared/utils/privateRooms.
const UNRELEASED_APPS: ReadonlyMap<AppId, () => boolean> = new Map([
  ["e2e-rooms" as AppId, isPrivateRoomsEnabled],
  ["ai-arbiter" as AppId, isArbiterEnabled],
]);

const isAppUnreleased = (id: string): boolean => {
  const isFeatureEnabled = UNRELEASED_APPS.get(id as AppId);

  return isFeatureEnabled ? !isFeatureEnabled() : false;
};

export const isAppTemporarilyDisabled = (id: string): boolean =>
  TEMPORARILY_DISABLED_APPS.has(id) || isAppUnreleased(id);
