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
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type { NavMenuGroup, NavMenuItem } from "@docspace/ui-kit/components/nav-menu";
import { PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import AppsSidebar from "SRC_DIR/components/AppsSidebar";

const MEMBERS_ID = "accounts-members";
const GROUPS_ID = "accounts-groups";
const GUESTS_ID = "accounts-guests";

const AccountsSidebar = () => {
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

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const items: NavMenuItem[] = [
      {
        id: MEMBERS_ID,
        label: t("Common:Members"),
        icon: getCatalogIconUrlByType(PageType.account),
        onClick: () => navigate("/accounts/people"),
      },
      {
        id: GROUPS_ID,
        label: t("Common:Groups"),
        icon: getCatalogIconUrlByType(PageType.groups),
        onClick: () => navigate("/accounts/groups"),
      },
      {
        id: GUESTS_ID,
        label: t("Common:Guests"),
        icon: getCatalogIconUrlByType(PageType.guests),
        onClick: () => navigate("/accounts/guests"),
      },
    ];
    return [{ id: "accounts", items }];
  }, [t, navigate]);

  return (
    <AppsSidebar groups={groups} activeId={activeId} variant="secondary" />
  );
};

export default AccountsSidebar;
