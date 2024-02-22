import { inject, observer } from "mobx-react";

import AccountsItemTitle from "./AccountsItemTitle";
import GalleryItemTitle from "./GalleryItemTitle";
import RoomsItemHeader from "./Rooms";
import GroupsItemTitle from "./GroupsItemTitle";

const ItemTitle = ({
  infoPanelSelection,
  gallerySelected,
  isNoItem,
  isPeople,
  isGroups,
  isGallery,
  isSeveralItems,
  selectionLength,
  currentColorScheme,
  getIcon,
  getUserContextOptions,
}) => {
  if (!infoPanelSelection) return null;
  if (isNoItem) return null;

  if (isPeople)
    return (
      <AccountsItemTitle
        infoPanelSelection={infoPanelSelection}
        isSeveralItems={isSeveralItems}
        getUserContextOptions={getUserContextOptions}
        selectionLength={selectionLength}
      />
    );

  if (isGroups)
    return (
      <GroupsItemTitle
        infoPanelSelection={infoPanelSelection}
        isSeveralItems={isSeveralItems}
        getUserContextOptions={getUserContextOptions}
        selectionLength={selectionLength}
      />
    );

  if (isGallery)
    return (
      <GalleryItemTitle
        currentColorScheme={currentColorScheme}
        gallerySelected={gallerySelected}
        getIcon={getIcon}
      />
    );

  return <RoomsItemHeader />;
};

export default inject(
  ({ settingsStore, filesSettingsStore, peopleStore, oformsStore }) => {
    const { currentColorScheme } = settingsStore;
    const { getIcon } = filesSettingsStore;
    const { getUserContextOptions } = peopleStore.contextOptionsStore;
    const { gallerySelected } = oformsStore;

    return {
      currentColorScheme,
      gallerySelected,
      getUserContextOptions,
      getIcon,
    };
  },
)(observer(ItemTitle));
