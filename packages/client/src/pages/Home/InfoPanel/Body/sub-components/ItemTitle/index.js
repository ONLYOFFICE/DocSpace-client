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
  setCalendarDay,
  roomsView,
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

export default inject(
  ({
    settingsStore,
    filesSettingsStore,
    peopleStore,
    oformsStore,
    infoPanelStore,
  }) => {
    const { currentColorScheme } = settingsStore;
    const { getIcon } = filesSettingsStore;
    const { getUserContextOptions } = peopleStore.contextOptionsStore;
    const { gallerySelected } = oformsStore;
    const { roomsView, setCalendarDay } = infoPanelStore;

    return {
      currentColorScheme,
      gallerySelected,
      getUserContextOptions,
      getIcon,
      roomsView,
      setCalendarDay,
    };
  }
)(observer(ItemTitle));
