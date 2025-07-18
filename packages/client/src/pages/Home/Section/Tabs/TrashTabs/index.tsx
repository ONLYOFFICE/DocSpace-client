// (c) Copyright Ascensio System SIA 2009-2025
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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Tabs, TTabItem } from "@docspace/shared/components/tabs";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { TUser } from "@docspace/shared/api/people/types";
import { useLocation, Location } from "react-router";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import FilesFilter from "@docspace/shared/api/files/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

type TrashTabsProps = {
  setFilter: (filter: RoomsFilter | FilesFilter) => void;
  showTabsLoader: boolean;
  withTabs: boolean;
  userId: TUser["id"];
};

const TrashTabs = ({
  setFilter,
  showTabsLoader,
  withTabs,
  userId,
}: TrashTabsProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();

  const items: TTabItem[] = [
    {
      id: "trash-files",
      name: t("Common:TrashMyDocuments"),
      content: null,
    },
    {
      id: "trash-rooms",
      name: t("Common:TrashRooms"),
      content: null,
    },
  ];

  const onSelect = (e: TTabItem) => {
    const trashMyDocuments = e.id === "trash-files";

    const newFilter = trashMyDocuments
      ? FilesFilter.getDefault()
      : RoomsFilter.getDefault(userId, RoomSearchArea.Trash);

    const params = newFilter.toUrlParams(userId);

    const path = trashMyDocuments
      ? getCategoryUrl(CategoryType.TrashFiles)
      : getCategoryUrl(CategoryType.TrashRooms);

    setFilter(newFilter);

    window.DocSpace.navigate(`${path}?${params}`, {
      replace: true,
    });
  };

  const getContactsView = (
    location?: Location,
  ): "trash-files" | "trash-rooms" => {
    const { pathname } =
      location ??
      window.DocSpace?.location ??
      (window.location as unknown as Location);

    if (pathname.includes("/trash/files")) return "trash-files";

    if (pathname.includes("/trash/rooms")) return "trash-rooms";

    return "trash-files";
  };

  const currentSelectId = getContactsView(location);

  if (showTabsLoader) return <SectionSubmenuSkeleton />;

  return (
    <Tabs
      className="accounts-tabs"
      selectedItemId={currentSelectId}
      items={items}
      onSelect={onSelect}
    />
  );
};

export default inject(
  ({
    clientLoadingStore,
    filesStore,
  }: {
    clientLoadingStore: ClientLoadingStore;
    filesStore: FilesStore;
  }) => {
    const { showTabsLoader } = clientLoadingStore;
    const { setFilter } = filesStore;

    return {
      setFilter,
      showTabsLoader,
    };
  },
)(observer(TrashTabs));
