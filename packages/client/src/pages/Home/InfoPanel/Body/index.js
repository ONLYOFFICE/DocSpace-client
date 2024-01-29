import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import ViewHelper from "./helpers/ViewHelper";
import ItemTitle from "./sub-components/ItemTitle";

import { StyledInfoPanelBody } from "./styles/common";

const InfoPanelBodyContent = ({
  infoPanelSelection,
  setNewInfoPanelSelection,
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
  const isRoot =
    infoPanelSelection?.isFolder &&
    infoPanelSelection?.id === infoPanelSelection?.rootFolderId;
  const isNoItem =
    !infoPanelSelection ||
    (!isSeveralItems && (isNoItemGallery || (isRoot && !isGallery)));

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

  // Updating infoPanelSelection after selectFolder change
  // if it is located in another room

  // Setting infoPanelSelection after selectedItems or selectedFolder update
  useEffect(() => {
    setNewInfoPanelSelection();
  }, [selectedItems, selectedFolder]);

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
    setNewInfoPanelSelection,
    isItemChanged,
    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsGallery,
    infoPanelSelectedItems,
    getInfoPanelSelectedFolder,
  } = auth.infoPanelStore;

  const { gallerySelected } = oformsStore;
  const { isRootFolder } = selectedFolderStore;

  return {
    infoPanelSelection,
    setNewInfoPanelSelection,
    isItemChanged,

    roomsView,
    fileView,
    getIsFiles,
    getIsRooms,
    getIsAccounts,
    getIsGallery,

    selectedItems: infoPanelSelectedItems,
    selectedFolder: getInfoPanelSelectedFolder(),

    isRootFolder,
    gallerySelected,
  };
})(observer(InfoPanelBodyContent));
