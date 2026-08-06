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

import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import type {
  NavMenuGroup,
  NavMenuItem,
} from "@docspace/ui-kit/components/nav-menu";

import type { Section } from "SRC_DIR/helpers/plugins/enums";
import { getPluginSectionPath } from "SRC_DIR/helpers/plugins/navigation";
import type PluginStore from "SRC_DIR/store/PluginStore";

export type PluginNavigationItems = NonNullable<
  PluginStore["articleNavigationItemsList"]
>;

type UsePluginNavGroupProps = {
  section?: Section;
  items?: PluginNavigationItems | null;
};

type UsePluginNavGroupResult = {
  pluginGroup: NavMenuGroup | null;
  activePluginItemId?: string;
};

const PLUGIN_GROUP_ID = "plugin-navigation";

const EMPTY_RESULT: UsePluginNavGroupResult = { pluginGroup: null };

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const getNavItemId = (itemKey: string) => `${PLUGIN_GROUP_ID}-${itemKey}`;

export const usePluginNavGroup = ({
  section,
  items,
}: UsePluginNavGroupProps): UsePluginNavGroupResult => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return useMemo(() => {
    if (!section || !items?.length) return EMPTY_RESULT;

    const sectionItems = items.filter(
      ({ value }) => !value.appears || value.appears.includes(section),
    );

    if (sectionItems.length === 0) return EMPTY_RESULT;

    const navItems = sectionItems.map<NavMenuItem>(({ key, value }) => {
      const { label, icon } = value;
      const path = getPluginSectionPath(section, key);

      return {
        id: getNavItemId(key),
        label,
        icon,
        onClick: () => navigate(path),
      };
    });

    const activeItem = sectionItems.find(({ key }) =>
      isActivePath(pathname, getPluginSectionPath(section, key)),
    );

    return {
      pluginGroup: { id: PLUGIN_GROUP_ID, items: navItems },
      activePluginItemId: activeItem && getNavItemId(activeItem.key),
    };
  }, [section, items, pathname, navigate]);
};
