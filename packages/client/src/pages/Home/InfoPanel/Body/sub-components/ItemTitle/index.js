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
  setCalendarDay,
  roomsView,
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

  const openHistory = roomsView === "info_history";
  if (isGallery)
    return (
      <GalleryItemTitle
        currentColorScheme={currentColorScheme}
        gallerySelected={gallerySelected}
        getIcon={getIcon}
      />
    );

  return (
    <RoomsItemHeader
      openHistory={openHistory}
      setCalendarDay={setCalendarDay}
    />
  );
};

export default inject(({ auth, settingsStore, peopleStore, oformsStore }) => {
  const { currentColorScheme } = auth.settingsStore;
  const { roomsView, setCalendarDay } = auth.infoPanelStore;
  const { getIcon } = settingsStore;
  const { getUserContextOptions } = peopleStore.contextOptionsStore;
  const { gallerySelected } = oformsStore;

  return {
    currentColorScheme,
    gallerySelected,
    getUserContextOptions,
    getIcon,
    setCalendarDay,
    roomsView,
  };
})(observer(ItemTitle));
