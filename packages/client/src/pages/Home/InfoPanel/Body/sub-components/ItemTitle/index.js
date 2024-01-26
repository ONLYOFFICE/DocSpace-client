import { inject, observer } from "mobx-react";

import AccountsItemTitle from "./AccountsItemTitle";
import GalleryItemTitle from "./GalleryItemTitle";
import RoomsItemHeader from "./Rooms";

const ItemTitle = ({
  selection,
  gallerySelected,
  isNoItem,
  isAccounts,
  isGallery,
  isSeveralItems,
  selectionLength,
  currentColorScheme,
  getIcon,
  getUserContextOptions,
}) => {
  if (!selection) return null;
  if (isNoItem) return null;

  if (isAccounts)
    return (
      <AccountsItemTitle
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
  }
)(observer(ItemTitle));
