import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Submenu } from "@docspace/shared/components/submenu";
import Loaders from "@docspace/common/components/Loaders";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getObjectByLocation } from "@docspace/shared/utils/common";

const SectionSubmenuContent = ({
  isPersonalRoom,
  isRecentTab,
  setFilter,
  showBodyLoader,
  isRoot,
}) => {
  const { t } = useTranslation("Files");

  const submenu = [
    {
      id: "my",
      name: t("MyDocuments"),
    },
    {
      id: "recent",
      name: t("RecentlyAccessible"),
    },
  ];

  const onSelect = (e) => {
    const filter = FilesFilter.getDefault();
    const url = window.DocSpace.location.pathname;

    if (e.id === "recent") {
      filter.folder = e.id;
      filter.searchArea = 3;
    } else {
      filter.searchArea = null;
    }

    setFilter(filter);
    window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`);
  };

  const showSubmenu = (isPersonalRoom || isRecentTab) && isRoot;
  const startSelect =
    getObjectByLocation(window.DocSpace.location)?.folder === "recent" ? 1 : 0;

  if (showSubmenu && showBodyLoader) return <Loaders.SectionSubmenuLoader />;

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
  }
)(observer(SectionSubmenuContent));
