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
import React from "react";
import { inject, observer } from "mobx-react";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { isLockedSharedRoom as isLockedSharedRoomUtil } from "@docspace/shared/utils";
import { FolderType } from "@docspace/shared/enums";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";
import InfoPanelStore, { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import ItemTitle from "./sub-components/ItemTitle";
import SeveralItems from "./sub-components/SeveralItems";
import NoItem from "./sub-components/NoItem";

import Users from "./views/Users";
import Groups from "./views/Groups";
import Gallery from "./views/Gallery";
import FilesView from "./views/FilesView";

import commonStyles from "./helpers/Common.module.scss";

type BodyProps = {
  selection: InfoPanelStore["infoPanelSelection"];
  roomsView: InfoPanelStore["roomsView"];
  fileView: InfoPanelStore["fileView"];
  getIsFiles: InfoPanelStore["getIsFiles"];
  getIsRooms: InfoPanelStore["getIsRooms"];
  setView: InfoPanelStore["setView"];

  maxImageUploadSize: SettingsStore["maxImageUploadSize"];

  editRoomDialogProps: DialogsStore["editRoomDialogProps"];
  createRoomDialogProps: DialogsStore["createRoomDialogProps"];
  templateEventVisible: DialogsStore["templateEventVisible"];

  avatarEditorDialogVisible: AvatarEditorDialogStore["avatarEditorDialogVisible"];
  image: AvatarEditorDialogStore["image"];

  setAvatarEditorDialogVisible: AvatarEditorDialogStore["setAvatarEditorDialogVisible"];
  onSaveRoomLogo: AvatarEditorDialogStore["onSaveRoomLogo"];
  onChangeFile: AvatarEditorDialogStore["onChangeFile"];
  setImage: AvatarEditorDialogStore["setImage"];

  contactsTab: UsersStore["contactsTab"];
};

const InfoPanelBodyContent = ({
  selection,
  contactsTab,

  roomsView,
  fileView,
  getIsFiles,
  getIsRooms,
  setView,

  maxImageUploadSize,

  editRoomDialogProps,
  createRoomDialogProps,
  templateEventVisible,

  avatarEditorDialogVisible,
  image,

  setAvatarEditorDialogVisible,
  onSaveRoomLogo,
  onChangeFile,
  setImage,
}: BodyProps) => {
  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isGallery = window.location.pathname.includes("form-gallery");
  const isGroups = contactsTab === "groups";
  const isGuests = contactsTab === "guests";
  const isUsers = contactsTab === "inside_group" || contactsTab === "people";

  const isRoom = selection && "expired" in selection && "external" in selection;
  const isFolder = selection && "isFolder" in selection && !!selection.isFolder;

  const isRoot = isFolder && selection?.id === selection?.rootFolderId;

  const isLockedSharedRoom = isRoom && isLockedSharedRoomUtil(selection);

  const isSeveralItems = Array.isArray(selection) && selection.length > 1;
  const isNoItem =
    !selection ||
    (isRoom && selection.expired && selection.external) ||
    isLockedSharedRoom ||
    (isRoot && !isGallery);

  const [currentView, setCurrentView] = React.useState(
    isRooms ? roomsView : fileView,
  );

  const defferedCurrentView = React.useDeferredValue(currentView);

  React.useEffect(() => {
    setCurrentView(isRooms ? roomsView : fileView);
  }, [isRooms, roomsView, fileView]);

  React.useEffect(() => {
    if (
      fileView === InfoPanelView.infoShare &&
      selection &&
      "isFolder" in selection &&
      selection?.isFolder
    ) {
      setView(InfoPanelView.infoDetails);
    }
  }, [fileView, selection]);

  const getView = () => {
    if (isUsers || isGuests) return <Users isGuests={isGuests} />;

    if (isGroups) return <Groups />;

    if (isGallery) return <Gallery />;

    if (isSeveralItems || Array.isArray(selection))
      return <SeveralItems selectedItems={selection} />;

    if (isNoItem || !selection) {
      const lockedSharedRoomProps = isLockedSharedRoom
        ? { isLockedSharedRoom, infoPanelSelection: selection }
        : {};
      return (
        <NoItem
          isRooms={isRooms}
          isFiles={isFiles}
          {...lockedSharedRoomProps}
        />
      );
    }

    return (
      <React.Suspense
        fallback={
          <InfoPanelViewLoader
            view={
              currentView === InfoPanelView.infoMembers
                ? "members"
                : currentView === InfoPanelView.infoHistory
                  ? "history"
                  : "details"
            }
          />
        }
      >
        <FilesView
          currentView={defferedCurrentView}
          selection={selection}
          isArchive={selection.rootFolderType === FolderType.Archive}
        />
      </React.Suspense>
    );
  };

  return (
    <div className={commonStyles.infoPanelBody}>
      {!isNoItem &&
      !Array.isArray(selection) &&
      (isUsers || isGuests || isGroups || isGallery) ? (
        <ItemTitle
          infoPanelSelection={selection}
          isContacts={isUsers || isGuests || isGroups}
          isNoItem={isNoItem ?? false}
          isGallery={isGallery}
        />
      ) : null}
      {getView()}

      {avatarEditorDialogVisible &&
      !editRoomDialogProps.visible &&
      !createRoomDialogProps.visible &&
      !Array.isArray(selection) ? (
        <AvatarEditorDialog
          image={image}
          onChangeImage={setImage}
          onClose={() => setAvatarEditorDialogVisible(false)}
          onSave={(img: unknown) =>
            !templateEventVisible
              ? onSaveRoomLogo(selection?.id, img, selection, true)
              : setAvatarEditorDialogVisible(false)
          }
          onChangeFile={onChangeFile}
          classNameWrapperImageCropper="icon-editor"
          visible={image.uploadedFile}
          maxImageSize={maxImageUploadSize}
        />
      ) : null}
    </div>
  );
};

export default inject(
  ({
    infoPanelStore,
    settingsStore,
    avatarEditorDialogStore,
    dialogsStore,
    peopleStore,
  }: TStore) => {
    const { contactsTab } = peopleStore.usersStore;
    const {
      roomsView,
      fileView,

      getIsFiles,
      getIsRooms,
      setView,
    } = infoPanelStore;

    const { editRoomDialogProps, createRoomDialogProps, templateEventVisible } =
      dialogsStore;

    const {
      avatarEditorDialogVisible,
      image,

      setAvatarEditorDialogVisible,
      onSaveRoomLogo,
      onChangeFile,
      setImage,
    } = avatarEditorDialogStore;

    const selection = infoPanelStore.infoPanelSelection;

    return {
      contactsTab,
      selection,

      roomsView,
      fileView,
      getIsFiles,
      getIsRooms,
      setView,

      maxImageUploadSize: settingsStore.maxImageUploadSize,

      editRoomDialogProps,
      createRoomDialogProps,
      templateEventVisible,

      avatarEditorDialogVisible,
      image,

      setAvatarEditorDialogVisible,
      onSaveRoomLogo,
      onChangeFile,
      setImage,
    };
  },
)(observer(InfoPanelBodyContent));
