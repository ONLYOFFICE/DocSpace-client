// (c) Copyright Ascensio System SIA 2009-2024
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
import { useTranslation } from "react-i18next";

import { Tabs } from "@docspace/shared/components/tabs";
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
