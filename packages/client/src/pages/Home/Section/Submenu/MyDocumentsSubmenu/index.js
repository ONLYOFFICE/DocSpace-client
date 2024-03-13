import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Submenu } from "@docspace/shared/components/submenu";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getObjectByLocation } from "@docspace/shared/utils/common";

const MyDocumentsSubmenu = ({
  isPersonalRoom,
  isRecentTab,
  setFilter,
  showBodyLoader,
  isRoot,
}) => {
  const { t } = useTranslation(["Common", "Files"]);

  const submenu = [
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

    if (e.id === "recent") {
      filter.folder = e.id;
      filter.searchArea = 3;
      filter.sortBy = "LastOpened";
    } else {
      filter.searchArea = null;
    }

    setFilter(filter);
    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`);
  };

  const showSubmenu = (isPersonalRoom || isRecentTab) && isRoot;
  const startSelect =
    getObjectByLocation(window.DocSpace.location)?.folder === "recent" ? 1 : 0;

  if (showSubmenu && showBodyLoader) return <SectionSubmenuSkeleton />;

  return showSubmenu ? (
    <Submenu data={submenu} startSelect={startSelect} onSelect={onSelect} />
  ) : null;
};

export default inject(
  ({ treeFoldersStore, filesStore, clientLoadingStore }) => {
    const { isPersonalRoom, isRecentTab, isRoot } = treeFoldersStore;
    const { setFilter } = filesStore;
    const { showBodyLoader } = clientLoadingStore;

    return {
      isPersonalRoom,
      isRecentTab,
      setFilter,
      showBodyLoader,
      isRoot,
    };
  },
)(observer(MyDocumentsSubmenu));
