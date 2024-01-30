import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";

import ViewHelper from "./helpers/ViewHelper";
import ItemTitle from "./sub-components/ItemTitle";

import { StyledInfoPanelBody } from "./styles/common";
import { useParams } from "react-router-dom";
import { getRoomInfo } from "@docspace/shared/api/rooms";

const InfoPanelBodyContent = ({
  selection,
  setSelection,
  calculateSelection,
  normalizeSelection,
  isItemChanged,
  selectionParentRoom,
  setSelectionParentRoom,
  roomsView,
  fileView,
  getIsFiles,
  getIsRooms,
  getIsAccounts,
  getIsPeople,
  getIsGroups,
  getIsGallery,
  gallerySelected,
  isRootFolder,
  ...props
}) => {
  const { groupId } = useParams();

  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [selectedFolder, setSelectedFolder] = useState(props.selectedFolder);

  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isGallery = getIsGallery();
  const isInsideGroup = getIsGroups() && groupId;
  console.log("isInsideGroup", isInsideGroup);
  const isGroups =
    getIsGroups() ||
    (isInsideGroup && (!selectedItems.length || !!selectedItems[0].manager));
  const isPeople =
    getIsPeople() ||
    (isInsideGroup && selectedItems.length && !selectedItems[0].manager);
  console.log("isPeople", isPeople);

  const isSeveralItems = props.selectedItems?.length > 1;

  console.log("selection", selection);

  const isNoItemGallery = isGallery && !gallerySelected;
  const isNoItemPeople = isPeople && !isInsideGroup && !selectedItems.length;
  const isNoItemGroups = isGroups && !isInsideGroup && !selectedItems.length;
  const itemIsRoot =
    selection?.isSelectedFolder && selection?.id === selection?.rootFolderId;
  const isNoItem =
    isNoItemPeople ||
    isNoItemGallery ||
    isNoItemGroups ||
    (itemIsRoot && !isGallery);

  const defaultProps = {
    selection,
    isFiles,
    isRooms,
    isPeople,
    isGroups,
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
    groupsProps: {},
    galleryProps: {},
    pluginProps: { isRooms, roomsView, fileView },
  });

  const getView = () => {
    const currentView = isRooms ? roomsView : fileView;

    console.log(isNoItem, isSeveralItems, isGallery, isPeople, isGroups);

    if (isNoItem) return viewHelper.NoItemView();
    if (isSeveralItems) return viewHelper.SeveralItemsView();

    if (isGallery) return viewHelper.GalleryView();
    if (isPeople) return viewHelper.AccountsView();
    if (isGroups) return viewHelper.GroupsView();

    switch (currentView) {
      case "info_members":
        return viewHelper.MembersView();
      case "info_history":
        return viewHelper.HistoryView();
      case "info_details":
        return viewHelper.DetailsView();
      case "info_share":
        return viewHelper.ShareView();
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

  // Updating selectionParentRoom after selectFolder change
  // if it is located in another room

  const updateSelectionParentRoomAction = useCallback(async () => {
    if (!isRooms) return;
    if (selection?.isRoom && roomsView === "members") return;

    const currentFolderRoomId =
      selectedFolder?.pathParts &&
      selectedFolder?.pathParts?.length > 1 &&
      selectedFolder.pathParts[1].id;

    const storeRoomId = selectionParentRoom?.id;
    if (!currentFolderRoomId || currentFolderRoomId === storeRoomId) return;

    const newSelectionParentRoom = await getRoomInfo(currentFolderRoomId);

    if (storeRoomId === newSelectionParentRoom.id) return;

    setSelectionParentRoom(normalizeSelection(newSelectionParentRoom));
  }, [selectedFolder]);

  useEffect(() => {
    updateSelectionParentRoomAction();
  }, [selectedFolder, updateSelectionParentRoomAction]);

  // Setting selection after selectedItems or selectedFolder update
  useEffect(() => {
    setSelection(calculateSelection());
  }, [selectedItems, selectedFolder, groupId]);

  // * DEV-ONLY - Logs selection change
  useEffect(() => {
    console.log("\nfor-dev  Selected items: ", selectedItems);
    console.log("\nfor-dev  Selected folder: ", selectedFolder);
  }, [selectedItems, selectedFolder]);

  if (!selection && !isGallery) return null;

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
    selection,
    setSelection,
    calculateSelection,
    normalizeSelection,
    isItemChanged,
    selectionParentRoom,
    setSelectionParentRoom,
    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsPeople,
    getIsGroups,
    getIsGallery,
  } = auth.infoPanelStore;

  const { gallerySelected } = oformsStore;

  const { isRootFolder } = selectedFolderStore;

  const selectedItems = auth.infoPanelStore.getSelectedItems();

  const selectedFolder = auth.infoPanelStore.getSelectedFolder();

  return {
    selection,
    setSelection,
    calculateSelection,
    normalizeSelection,
    isItemChanged,

    selectionParentRoom,
    setSelectionParentRoom,
    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsPeople,
    getIsGroups,
    getIsGallery,

    selectedItems,
    selectedFolder,

    isRootFolder,
    gallerySelected,
  };
})(observer(InfoPanelBodyContent));
