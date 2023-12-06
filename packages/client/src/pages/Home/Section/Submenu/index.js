import { inject, observer } from "mobx-react";

import Submenu from "@docspace/components/submenu";
import FilesFilter from "@docspace/common/api/files/filter";
import { getObjectByLocation } from "@docspace/common/utils";

const SectionSubmenuContent = ({ isPersonalRoom, isRecentTab, setFilter }) => {
  const submenu = [
    {
      id: "my",
      name: "My documents",
    },
    {
      id: "recent",
      name: "Recently accessible via link",
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

  const showSubmenu = isPersonalRoom || isRecentTab;
  const startSelect =
    getObjectByLocation(window.DocSpace.location)?.folder === "recent" ? 1 : 0;

  return showSubmenu ? (
    <Submenu data={submenu} startSelect={startSelect} onSelect={onSelect} />
  ) : null;
};

export default inject(({ treeFoldersStore, filesStore }) => {
  const { isPersonalRoom, isRecentTab } = treeFoldersStore;
  const { setFilter } = filesStore;

  return {
    isPersonalRoom,
    isRecentTab,
    setFilter,
  };
})(observer(SectionSubmenuContent));
