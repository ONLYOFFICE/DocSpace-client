import React from "react";
import { inject, observer } from "mobx-react";

import AccountsItemTitle from "./AccountsItemTitle";
import FilesItemTitle from "./FilesItemTitle";
import GalleryItemTitle from "./GalleryItemTitle";

const ItemTitle = ({
  selection,
  gallerySelected,
  isRooms,
  isAccounts,
  isGallery,
  isSeveralItems,
  selectionLength,
  selectionParentRoom,
  roomsView,
  getIcon,
  getUserContextOptions,
  setCalendarDay,
}) => {
  if (!selection) return null;

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
      <GalleryItemTitle gallerySelected={gallerySelected} getIcon={getIcon} />
    );

  const filesItemSelection =
    isRooms &&
    !isSeveralItems &&
    roomsView === "info_members" &&
    !selection.isRoom &&
    !!selectionParentRoom
      ? selectionParentRoom
      : selection;

  const openHistory = roomsView === "info_history";

  return (
    <FilesItemTitle
      selectionLength={selectionLength}
      selection={filesItemSelection}
      isSeveralItems={isSeveralItems}
      getIcon={getIcon}
      openHistory={openHistory}
      setCalendarDay={setCalendarDay}
    />
  );
};

export default inject(({ auth, settingsStore, peopleStore, oformsStore }) => {
  const { selectionParentRoom, roomsView, setCalendarDay } =
    auth.infoPanelStore;
  const { getIcon } = settingsStore;
  const { getUserContextOptions } = peopleStore.contextOptionsStore;
  const { gallerySelected } = oformsStore;

  return {
    gallerySelected,
    getUserContextOptions,
    selectionParentRoom,
    roomsView,
    getIcon,
    setCalendarDay,
  };
})(observer(ItemTitle));
