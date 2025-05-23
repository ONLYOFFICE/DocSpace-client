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

import { Tabs } from "@docspace/shared/components/tabs";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getObjectByLocation } from "@docspace/shared/utils/common";

const MyDocumentsTabs = ({
  isPersonalRoom,
  isRecentTab,
  setFilter,
  showTabsLoader,
  isRoot,
  user,
  setChangeDocumentsTabs,
  isPersonalReadOnly,
}) => {
  const { t } = useTranslation(["Common", "Files"]);

  if (isPersonalReadOnly) return null;

  const tabs = [
    {
      id: "my",
      name: t("Common:MyDocuments"),
    },
    {
      id: "recent",
      name: t("Files:RecentlyAccessible"),
    },
  ];

  const onSelect = (e) => {
    const filter = FilesFilter.getDefault();
    const url = window.DocSpace.location.pathname;

    const recent = e.id === "recent";

    const filterStorageItem = user?.id
      ? recent
        ? localStorage.getItem(`UserFilterRecent=${user.id}`)
        : localStorage.getItem(`UserFilter=${user.id}`)
      : null;

    if (filterStorageItem) {
      const splitFilter = filterStorageItem.split(",");

      filter.sortBy = splitFilter[0];
      filter.sortOrder = splitFilter[1];
    } else if (recent) filter.sortBy = "LastOpened";

    if (recent) {
      filter.folder = e.id;
      filter.searchArea = 3;
    } else filter.searchArea = null;

    setChangeDocumentsTabs(true);
    setFilter(filter);
    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`);
  };

  const showTabs = (isPersonalRoom || isRecentTab) && isRoot;
  const startSelectId =
    tabs.length &&
    getObjectByLocation(window.DocSpace.location)?.folder === "recent"
      ? tabs[1].id
      : tabs[0].id;

  if (showTabs && showTabsLoader) return <SectionSubmenuSkeleton />;

  return showTabs ? (
    <Tabs items={tabs} selectedItemId={startSelectId} onSelect={onSelect} />
  ) : null;
};

export default inject(
  ({
    treeFoldersStore,
    filesStore,
    clientLoadingStore,
    userStore,
    selectedFolderStore,
  }) => {
    const { isPersonalRoom, isRecentTab, isRoot, isPersonalReadOnly } =
      treeFoldersStore;
    const { setFilter } = filesStore;
    const { showTabsLoader } = clientLoadingStore;
    const { user } = userStore;
    const { setChangeDocumentsTabs } = selectedFolderStore;

    return {
      isPersonalRoom,
      isRecentTab,
      setFilter,
      showTabsLoader,
      isRoot,
      user,
      setChangeDocumentsTabs,
      isPersonalReadOnly,
    };
  },
)(observer(MyDocumentsTabs));
