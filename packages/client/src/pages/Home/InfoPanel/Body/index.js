import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import ViewHelper from "./helpers/ViewHelper";
import ItemTitle from "./sub-components/ItemTitle";
import Search from "./sub-components/Search";

import { StyledInfoPanelBody } from "./styles/common";
import { useParams } from "react-router-dom";

const InfoPanelBodyContent = ({
  infoPanelSelection,
  setNewInfoPanelSelection,
  isItemChanged,
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
  showSearchBlock,
  setShowSearchBlock,
  ...props
}) => {
  const { groupId } = useParams();

  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [selectedFolder, setSelectedFolder] = useState(props.selectedFolder);

  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isGallery = getIsGallery();
  const isInsideGroup = getIsGroups() && groupId;
  const isGroups =
    getIsGroups() ||
    (isInsideGroup && (!selectedItems.length || !!selectedItems[0].manager));
  const isPeople =
    getIsPeople() ||
    (isInsideGroup && selectedItems.length && !selectedItems[0].manager);

  const isSeveralItems = props.selectedItems?.length > 1;

  const isNoItemGallery = isGallery && !gallerySelected;
  const isNoItemPeople = isPeople && !isInsideGroup && !selectedItems.length;
  const isNoItemGroups = isGroups && !isInsideGroup && !selectedItems.length;
  const isRoot =
    infoPanelSelection?.isFolder &&
    infoPanelSelection?.id === infoPanelSelection?.rootFolderId;
  const isNoItem =
    !infoPanelSelection ||
    isNoItemPeople ||
    isNoItemGallery ||
    isNoItemGroups ||
    (isRoot && !isGallery);

  const defaultProps = {
    infoPanelSelection,
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
      props.selectedFolder,
    );
    if (selectedFolderChanged) setSelectedFolder(props.selectedFolder);
  }, [props.selectedFolder]);

  // Updating infoPanelSelection after selectFolder change
  // if it is located in another room

  // Setting infoPanelSelection after selectedItems or selectedFolder update
  useEffect(() => {
    setNewInfoPanelSelection();
  }, [selectedItems, selectedFolder, groupId]);

  // * DEV-ONLY - Logs selection change
  // useEffect(() => {
  //   console.log("\nfor-dev  Selected items: ", selectedItems);
  //   console.log("\nfor-dev  Selected folder: ", selectedFolder);
  // }, [selectedItems, selectedFolder]);

  return (
    <StyledInfoPanelBody>
      {showSearchBlock && <Search />}

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

export default inject(
  ({ selectedFolderStore, oformsStore, infoPanelStore }) => {
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
      getIsPeople,
      getIsGroups,
      showSearchBlock,
      setShowSearchBlock,
    } = infoPanelStore;

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
      getIsPeople,
      getIsGroups,
      getIsGallery,

      selectedItems: infoPanelSelectedItems,
      selectedFolder: getInfoPanelSelectedFolder(),

      isRootFolder,
      gallerySelected,

      showSearchBlock,
      setShowSearchBlock,
    };
  },
)(observer(InfoPanelBodyContent));
