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
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Tabs } from "@docspace/ui-kit/components/tabs";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getObjectByLocation } from "@docspace/shared/utils/common";
import { RoomSearchArea } from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

const RoomTemplatesTabs = ({
  setFilter,
  showTabsLoader,
  isRoot,
  isRoomsFolderRoot,
  isTemplatesFolder,
  withTabs,
  userId,
}) => {
  const { t } = useTranslation(["Common"]);

  const [selectedTab, setSelectedTab] = React.useState("rooms");

  const tabs = [
    {
      id: "rooms",
      name: t("Common:Rooms"),
    },
    {
      id: "templates",
      name: t("Common:Templates"),
    },
  ];

  const showTabs =
    (isRoomsFolderRoot || isTemplatesFolder) && isRoot && withTabs;

  const onSelect = (e) => {
    const templates = e.id === "templates";

    setSelectedTab(e.id);

    const newRoomsFilter = RoomsFilter.getDefault(
      userId,
      templates ? RoomSearchArea.Templates : RoomSearchArea.Active,
    );

    const params = newRoomsFilter.toUrlParams(userId, true);

    const path = getCategoryUrl(CategoryType.Shared);

    setFilter(newRoomsFilter);
    window.DocSpace.navigate(`${path}?${params}`, {
      replace: true,
    });
  };

  React.useEffect(() => {
    const templatesTab =
      getObjectByLocation(window.DocSpace.location)?.searchArea ===
      RoomSearchArea.Templates;
    setSelectedTab(templatesTab ? "templates" : "rooms");
  }, [window.DocSpace.location]);

  if (showTabs && showTabsLoader) return <SectionSubmenuSkeleton />;

  return showTabs ? (
    <Tabs
      items={tabs}
      selectedItemId={selectedTab}
      onSelect={onSelect}
      withAnimation
    />
  ) : null;
};

export default inject(
  ({
    authStore,
    treeFoldersStore,
    filesStore,
    clientLoadingStore,
    userStore,
  }) => {
    const { isRoomAdmin, isAdmin } = authStore;
    const { isRoomsFolderRoot, isTemplatesFolder, isRoot } = treeFoldersStore;
    const { setFilter } = filesStore;
    const { showTabsLoader } = clientLoadingStore;

    return {
      setFilter,
      showTabsLoader,
      isRoot,
      isRoomsFolderRoot,
      isTemplatesFolder,
      withTabs: isRoomAdmin || isAdmin,
      userId: userStore.user?.id,
    };
  },
)(observer(RoomTemplatesTabs));
