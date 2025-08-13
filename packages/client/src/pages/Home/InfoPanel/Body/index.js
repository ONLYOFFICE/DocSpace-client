// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { RoomsType } from "@docspace/shared/enums";
import { isLockedSharedRoom as isLockedSharedRoomUtil } from "@docspace/shared/utils";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";
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
  getIsContacts,
  getIsGallery,
  gallerySelected,
  isRootFolder,
  showSearchBlock,
  setShowSearchBlock,
  uploadFile,
  avatarEditorDialogVisible,
  setAvatarEditorDialogVisible,
  editRoomDialogProps,
  createRoomDialogProps,
  onSaveRoomLogo,
  uploadedFile,
  maxImageUploadSize,
  selection,
  setImage,
  image,
  onChangeFile,
  templateEventVisible,
  setIsShareFormData,
  ...props
}) => {
  const { groupId } = useParams();

  const { t } = useTranslation("Common");

  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [selectedFolder, setSelectedFolder] = useState(props.selectedFolder);

  const contactsView = getIsContacts();

  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isGallery = !!gallerySelected;
  const isGroups = contactsView === "groups";
  const isGuests = contactsView === "guests";
  const isUsers =
    (contactsView === "inside_group" && groupId) || contactsView === "people";

  const isSeveralItems = props.selectedItems?.length > 1;

  const isLockedSharedRoom = isLockedSharedRoomUtil(infoPanelSelection);

  const isNoItemGallery = isGallery && !gallerySelected;
  const isRoot =
    infoPanelSelection?.isFolder &&
    infoPanelSelection?.id === infoPanelSelection?.rootFolderId;
  const isNoItem =
    !infoPanelSelection ||
    (infoPanelSelection.expired && infoPanelSelection.external) ||
    isLockedSharedRoom ||
    ((isUsers || isGuests || isGroups) && !selectedItems.length) ||
    isNoItemGallery ||
    (isRoot && !isGallery);

  const defaultProps = {
    infoPanelSelection,
    isFiles,
    isRooms,
    isUsers,
    isGroups,
    isGuests,
    isGallery,
    isRootFolder: selectedFolder.id === selectedFolder.rootFolderId,
    isSeveralItems,
    isVDR: selectedItems[0]?.roomType === RoomsType.VirtualDataRoom,
    isLockedSharedRoom,
    onOpenPanel: setIsShareFormData,
    onlyOneLink: infoPanelSelection?.isPDFForm,
  };

  const viewHelper = new ViewHelper({
    defaultProps,
    detailsProps: {},
    membersProps: {},
    historyProps: { selectedFolder },
    usersProps: {},
    groupsProps: {},
    galleryProps: {},
    pluginProps: { isRooms, roomsView, fileView },
  });

  // const onChangeFile = async (e) => {
  //   const uploadedFile = await uploadFile(t, e);
  //   setImage({ ...image, uploadedFile: uploadedFile });
  // };

  const onChangeIcon = (icon) => {
    setImage(icon);
  };

  const getView = () => {
    const currentView = isRooms ? roomsView : fileView;

    if (isNoItem) return viewHelper.NoItemView();
    if (isSeveralItems) return viewHelper.SeveralItemsView();

    if (isGallery) return viewHelper.GalleryView();
    if (isUsers || isGuests) return viewHelper.UsersView();
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

      default:
        break;
    }

    if (currentView.indexOf("info_plugin") > -1) return viewHelper.PluginView();
  };

  /// ///////////////////////////////////////////////////////

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
      {!isNoItem ? (
        <ItemTitle
          {...defaultProps}
          selectionLength={selectedItems.length}
          isNoItem={isNoItem}
        />
      ) : null}
      {getView()}

      {avatarEditorDialogVisible &&
      !editRoomDialogProps.visible &&
      !createRoomDialogProps.visible ? (
        <AvatarEditorDialog
          t={t}
          image={image}
          onChangeImage={onChangeIcon}
          onClose={() => setAvatarEditorDialogVisible(false)}
          onSave={(img) =>
            !templateEventVisible
              ? onSaveRoomLogo(selection.id, img, selection, true)
              : setAvatarEditorDialogVisible(false)
          }
          onChangeFile={onChangeFile}
          classNameWrapperImageCropper="icon-editor"
          visible={image.uploadedFile}
          maxImageSize={maxImageUploadSize}
        />
      ) : null}
    </StyledInfoPanelBody>
  );
};

export default inject(
  ({
    selectedFolderStore,
    oformsStore,
    infoPanelStore,
    settingsStore,
    avatarEditorDialogStore,
    dialogsStore,
  }) => {
    const {
      infoPanelSelection,
      setNewInfoPanelSelection,
      isItemChanged,
      roomsView,
      fileView,
      getIsFiles,
      getIsRooms,
      getIsGallery,
      infoPanelSelectedItems,
      getInfoPanelSelectedFolder,
      getIsContacts,
      showSearchBlock,
      setShowSearchBlock,
    } = infoPanelStore;

    const {
      editRoomDialogProps,
      createRoomDialogProps,
      templateEventVisible,
      setIsShareFormData,
    } = dialogsStore;

    const selection =
      infoPanelSelection?.length > 1 ? null : infoPanelSelection;
    const {
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      onSaveRoomLogo,
      onChangeFile,
      uploadedFile,
      setImage,
      image,
    } = avatarEditorDialogStore;

    const { gallerySelected } = oformsStore;
    const { isRootFolder } = selectedFolderStore;

    return {
      infoPanelSelection,
      setNewInfoPanelSelection,
      isItemChanged,
      selection,

      roomsView,
      fileView,
      getIsFiles,
      getIsRooms,
      getIsContacts,
      getIsGallery,

      selectedItems: infoPanelSelectedItems,
      selectedFolder: getInfoPanelSelectedFolder(),

      isRootFolder,
      gallerySelected,

      showSearchBlock,
      setShowSearchBlock,

      maxImageUploadSize: settingsStore.maxImageUploadSize,
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      editRoomDialogProps,
      createRoomDialogProps,
      onSaveRoomLogo,
      onChangeFile,
      uploadedFile,
      setImage,
      image,
      templateEventVisible,
      setIsShareFormData,
    };
  },
)(observer(InfoPanelBodyContent));
