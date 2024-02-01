import { inject, observer } from "mobx-react";

import AccountsItemTitle from "./AccountsItemTitle";
import GalleryItemTitle from "./GalleryItemTitle";
import RoomsItemHeader from "./Rooms";
import GroupsItemTitle from "./GroupsItemTitle";

const ItemTitle = ({
  selection,
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
  onSearchClick,
}) => {
  if (!selection) return null;
  if (isNoItem) return null;

  if (isPeople)
    return (
      <AccountsItemTitle
        selection={selection}
        isSeveralItems={isSeveralItems}
        getUserContextOptions={getUserContextOptions}
        selectionLength={selectionLength}
      />
    );

  if (isGroups)
    return (
      <GroupsItemTitle
        selection={selection}
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

  return <RoomsItemHeader onSearchClick={onSearchClick} />;
};

export default inject(({ auth, settingsStore, peopleStore, oformsStore }) => {
  const { currentColorScheme } = auth.settingsStore;
  const { getIcon } = settingsStore;
  const { getUserContextOptions } = peopleStore.contextOptionsStore;
  const { gallerySelected } = oformsStore;

  return {
    currentColorScheme,
    gallerySelected,
    getUserContextOptions,
    getIcon,
  };
})(observer(ItemTitle));
