import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";

import ViewHelper from "./helpers/ViewHelper";
import ItemTitle from "./sub-components/ItemTitle";

import { StyledInfoPanelBody } from "./styles/common";
import { getRoomInfo } from "@docspace/shared/api/rooms";

const InfoPanelBodyContent = ({
  infoPanelSelection,
  setInfoPanelSelection,
  calculateSelection,
  normalizeSelection,
  isItemChanged,
  roomsView,
  fileView,
  getIsFiles,
  getIsRooms,
  getIsAccounts,
  getIsGallery,
  gallerySelected,
  isRootFolder,
  ...props
}) => {
  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [selectedFolder, setSelectedFolder] = useState(props.selectedFolder);

  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isAccounts = getIsAccounts();
  const isGallery = getIsGallery();

  const isSeveralItems = props.selectedItems?.length > 1;

  const isNoItemGallery = isGallery && !gallerySelected;
  const itemIsRoot =
    infoPanelSelection?.isSelectedFolder &&
    infoPanelSelection?.id === infoPanelSelection?.rootFolderId;
  const isNoItem =
    !isSeveralItems && (isNoItemGallery || (itemIsRoot && !isGallery));

  const defaultProps = {
    infoPanelSelection,
    isFiles,
    isRooms,
    isAccounts,
    isGallery,
    isRootFolder: selectedFolder.id === selectedFolder.rootFolderId,
    isSeveralItems,
  };

  const viewHelper = new ViewHelper({
    defaultProps: defaultProps,
    detailsProps: {},
    membersProps: {},
    historyProps: { selectedFolder },
    accountsProps: {},
    galleryProps: {},
    pluginProps: { isRooms, roomsView, fileView },
  });

  const getView = () => {
    const currentView = isRooms ? roomsView : fileView;

    if (isNoItem) return viewHelper.NoItemView();
    if (isSeveralItems) return viewHelper.SeveralItemsView();
    if (isGallery) return viewHelper.GalleryView();
    if (isAccounts) return viewHelper.AccountsView();

    switch (currentView) {
      case "info_members":
        return viewHelper.MembersView();
      case "info_history":
        return viewHelper.HistoryView();
      case "info_details":
        return viewHelper.DetailsView();
    }

    if (currentView.indexOf("info_plugin") > -1) return viewHelper.PluginView();
  };

  //////////////////////////////////////////////////////////

  // Updating SelectedItems only if
  // a) Length of an array changed
  // b) Single chosen item changed
  useEffect(() => {
    const selectedItemsLengthChanged =
      selectedItems.length !== props.selectedItems.length;

    const singleSelectedItemChanged =
      selectedItems[0] &&
      props.selectedItems[0] &&
      isItemChanged(selectedItems[0], props.selectedItems[0]);

    if (selectedItemsLengthChanged || singleSelectedItemChanged)
      setSelectedItems(props.selectedItems);
  }, [props.selectedItems]);

  // Updating SelectedFolder only if
  //   a) Selected folder changed
  useEffect(() => {
    const selectedFolderChanged = isItemChanged(
      selectedFolder,
      props.selectedFolder
    );
    if (selectedFolderChanged) setSelectedFolder(props.selectedFolder);
  }, [props.selectedFolder]);

  // Updating infoPanelSelection after selectFolder change
  // if it is located in another room

  // TODO: INFO PANEL
  // const updateSelectionParentRoomAction = useCallback(async () => {
  //   if (!isRooms) return;
  //   if (infoPanelSelection?.isRoom && roomsView === "members") return;

  //   const currentFolderRoomId =
  //     selectedFolder?.pathParts &&
  //     selectedFolder?.pathParts?.length > 1 &&
  //     selectedFolder.pathParts[1].id;

  //   const storeRoomId = infoPanelSelection?.id;
  //   if (!currentFolderRoomId || currentFolderRoomId === storeRoomId) return;

  //   const newSelectionParentRoom = await getRoomInfo(currentFolderRoomId);

  //   if (storeRoomId === newSelectionParentRoom.id) return;

  //   setInfoPanelSelection(normalizeSelection(newSelectionParentRoom));
  // }, [selectedFolder]);

  // useEffect(() => {
  //   console.log("updateSelectionParentRoomAction1");
  //   updateSelectionParentRoomAction();
  // }, [selectedFolder, updateSelectionParentRoomAction]);

  // Setting infoPanelSelection after selectedItems or selectedFolder update
  useEffect(() => {
    // console.log("InfoPanel body calculate", calculateSelection());
    setInfoPanelSelection(calculateSelection());
  }, [selectedItems, selectedFolder]);

  if (!infoPanelSelection && !isGallery) return null;

  return (
    <StyledInfoPanelBody>
      {!isNoItem && (
        <ItemTitle
          {...defaultProps}
          selectionLength={selectedItems.length}
          isNoItem={isNoItem}
        />
      )}
      {getView()}
    </StyledInfoPanelBody>
  );
};

export default inject(({ auth, selectedFolderStore, oformsStore }) => {
  const {
    infoPanelSelection,
    setInfoPanelSelection,
    calculateSelection,
    normalizeSelection,
    isItemChanged,
    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsGallery,
  } = auth.infoPanelStore;

  const { gallerySelected } = oformsStore;

  const { isRootFolder } = selectedFolderStore;

  const selectedItems = auth.infoPanelStore.getSelectedItems();

  const selectedFolder = auth.infoPanelStore.getSelectedFolder();

  return {
    infoPanelSelection,
    setInfoPanelSelection,
    calculateSelection,
    normalizeSelection,
    isItemChanged,

    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsGallery,

    selectedItems,
    selectedFolder,

    isRootFolder,
    gallerySelected,
  };
})(observer(InfoPanelBodyContent));
