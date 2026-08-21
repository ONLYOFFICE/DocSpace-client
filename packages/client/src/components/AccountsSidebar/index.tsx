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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type { NavMenuGroup, NavMenuItem } from "@docspace/ui-kit/components/nav-menu";
import { PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import AccountsFilter from "@docspace/shared/api/people/filter";

import AppsSidebar from "SRC_DIR/components/AppsSidebar";
import {
  PEOPLE_ROUTE_WITH_FILTER,
  GROUPS_ROUTE_WITH_FILTER,
  GUESTS_ROUTE_WITH_FILTER,
} from "SRC_DIR/helpers/contacts";
import { Section } from "SRC_DIR/helpers/plugins/enums";

const MEMBERS_ID = "accounts-members";
const GROUPS_ID = "accounts-groups";
const GUESTS_ID = "accounts-guests";

type AccountsSidebarProps = {
  isNavLoading?: boolean;
};

const AccountsSidebar = ({ isNavLoading }: AccountsSidebarProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = React.useMemo(() => {
    const { pathname } = location;
    if (pathname.includes("/groups")) return GROUPS_ID;
    if (pathname.includes("/guests")) return GUESTS_ID;
    if (pathname.includes("/people") || pathname.includes("/accounts"))
      return MEMBERS_ID;
    return undefined;
  }, [location]);

  // Navigate straight to the `*/filter` routes with default filter params.
  // Navigating to the bare routes (e.g. `/accounts/people`) forces an extra
  // `<Navigate replace />` redirect hop, which remounts the view and shows the
  // body skeleton on every section switch.
  // `linkData` renders the item as a real router link (right-click / Ctrl-click
  // / middle-click open the section in a new tab), while `onClick` keeps the
  // plain click an in-app navigation.
  const navToFilterRoute = React.useCallback(
    (route: string): Pick<NavMenuItem, "linkData" | "onClick"> => {
      const params = AccountsFilter.getDefault().toUrlParams();
      const path = `/${route}?${params}`;
      return { linkData: { path }, onClick: () => navigate(path) };
    },
    [navigate],
  );

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const items: NavMenuItem[] = [
      {
        id: MEMBERS_ID,
        label: t("Common:Members"),
        icon: getCatalogIconUrlByType(PageType.account),
        ...navToFilterRoute(PEOPLE_ROUTE_WITH_FILTER),
      },
      {
        id: GROUPS_ID,
        label: t("Common:Groups"),
        icon: getCatalogIconUrlByType(PageType.groups),
        ...navToFilterRoute(GROUPS_ROUTE_WITH_FILTER),
      },
      {
        id: GUESTS_ID,
        label: t("Common:Guests"),
        icon: getCatalogIconUrlByType(PageType.guests),
        ...navToFilterRoute(GUESTS_ROUTE_WITH_FILTER),
      },
    ];
    return [{ id: "accounts", items }];
  }, [t, navToFilterRoute]);

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      variant="secondary"
      isNavLoading={isNavLoading}
      pluginSection={Section.Accounts}
    />
  );
};

export default inject<TStore>(({ clientLoadingStore }) => ({
  isNavLoading: clientLoadingStore.showArticleLoader,
}))(observer(AccountsSidebar));
