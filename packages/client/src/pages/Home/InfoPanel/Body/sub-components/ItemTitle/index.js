import { inject, observer } from "mobx-react";

import AccountsItemTitle from "./AccountsItemTitle";
import GalleryItemTitle from "./GalleryItemTitle";
import RoomsItemHeader from "./Rooms";

const ItemTitle = ({
  infoPanelSelection,
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
  if (!infoPanelSelection) return null;
  if (isNoItem) return null;

  if (isAccounts)
    return (
      <AccountsItemTitle
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
