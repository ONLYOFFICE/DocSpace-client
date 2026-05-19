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

import type { PropsWithChildren } from "react";

import type { AuthStore } from "../store/AuthStore";
import type { UserStore } from "../store/UserStore";
import type { SettingsStore } from "../store/SettingsStore";
import type { CurrentTariffStatusStore } from "../store/CurrentTariffStatusStore";

export interface PrivateRouteProps
  extends PropsWithChildren,
    Pick<AuthStore, "isAuthenticated" | "isLoaded" | "isAdmin" | "isLogout">,
    Pick<
      SettingsStore,
      | "wizardCompleted"
      | "tenantStatus"
      | "isPortalDeactivate"
      | "enablePortalRename"
      | "limitedAccessSpace"
      | "baseDomain"
      | "displayAbout"
      | "limitedAccessDevToolsForUsers"
      | "aiServicesEnabled"
    >,
    Pick<CurrentTariffStatusStore, "isNotPaidPeriod">,
    Pick<UserStore, "user"> {
  restricted?: boolean;
  withManager?: boolean;
  withCollaborator?: boolean;
  identityServerEnabled?: boolean;
  isCommunity?: boolean;
  isEnterprise?: boolean;
  standalone: boolean;
  requireAIServices?: boolean;
}

export interface PublicRouteProps
  extends PropsWithChildren,
    Pick<AuthStore, "isAuthenticated">,
    Pick<
      SettingsStore,
      | "wizardCompleted"
      | "tenantStatus"
      | "isPortalDeactivate"
      | "isFirstLoaded"
    > {}
