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

import { useEffect } from "react";
import { Navigate } from "react-router";
import { inject, observer } from "mobx-react";

type ProtectedAppRouteProps = {
  // Several ids let a route shared by two apps through as long as either of
  // them is on.
  appId: string | string[];
  isInstalled: (id: string) => boolean;
  isAppsLoaded: boolean;
  ensureAppsLoaded: () => void;
  canManageApps: boolean;
  isGuest: boolean;
  children: React.ReactNode;
};

const GUEST_RESTRICTED_APPS = new Set(["ai-files"]);

const ProtectedAppRoute = ({
  appId,
  isInstalled,
  isAppsLoaded,
  ensureAppsLoaded,
  canManageApps,
  isGuest,
  children,
}: ProtectedAppRouteProps) => {
  useEffect(() => {
    ensureAppsLoaded();
  }, [ensureAppsLoaded]);

  // `isInstalled` is optimistic until the list arrives, so a route that can
  // actually be switched off (standalone) has to wait for the real answer.
  if (canManageApps && !isAppsLoaded) return null;

  const appIds = Array.isArray(appId) ? appId : [appId];

  if (isGuest && appIds.every((id) => GUEST_RESTRICTED_APPS.has(id)))
    return <Navigate to="/dashboard" replace />;

  return appIds.some(isInstalled) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default inject<TStore>(({ appsStore, userStore }) => ({
  isInstalled: appsStore.isInstalled,
  isAppsLoaded: appsStore.isLoaded,
  ensureAppsLoaded: appsStore.ensureLoaded,
  canManageApps: appsStore.canManageApps,
  isGuest: userStore.user?.isVisitor ?? false,
}))(observer(ProtectedAppRoute));
