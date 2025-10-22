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
import React, { useMemo } from "react";

import { isLockedSharedRoom as isLockedSharedRoomUtil } from "@docspace/shared/utils";
import { FolderType } from "@docspace/shared/enums";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import {
  isRoom as isRoomUtil,
  isFolder as isFolderUtil,
} from "@docspace/shared/utils/typeGuards";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";
import { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";

import { BodyProps } from "./Body.types";

import ItemTitle from "./sub-components/ItemTitle";
import SeveralItems from "./sub-components/SeveralItems";
import NoItem from "./sub-components/NoItem";

import Users from "./views/Users";
import Groups from "./views/Groups";
import FilesView from "./views/FilesView";

import commonStyles from "./helpers/Common.module.scss";

const InfoPanelBodyGeneral = ({
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
  checkIsExpiredLinkAsync,
}: BodyProps) => {
  const isFiles = getIsFiles();
  const isRooms = getIsRooms();
  const isGroups = contactsTab === "groups";
  const isGuests = contactsTab === "guests";
  const isUsers = contactsTab === "inside_group" || contactsTab === "people";
  const isTemplatesRoom =
    !Array.isArray(selection) &&
    selection?.rootFolderType === FolderType.RoomTemplates;

  const isRoom = isRoomUtil(selection);
  const isFolder = selection && "isFolder" in selection && !!selection.isFolder;

  const isRoot = isFolder && selection?.id === selection?.rootFolderId;
  const id = !Array.isArray(selection) ? selection?.id : null;

  const isLockedSharedRoom = isRoom && isLockedSharedRoomUtil(selection);

  const isSeveralItems = Array.isArray(selection) && selection.length > 1;
  const isNoItem =
    !selection ||
    (!Array.isArray(selection) &&
      selection.isLinkExpired &&
      selection.external) ||
    isLockedSharedRoom ||
    isRoot;

  const currentView = useMemo(() => {
    return isRoom || isTemplatesRoom ? roomsView : fileView;
  }, [isRoom, roomsView, fileView, isTemplatesRoom]);

  const deferredCurrentView = React.useDeferredValue(currentView);

  React.useEffect(() => {
    if (
      fileView === InfoPanelView.infoShare &&
      selection &&
      isFolderUtil(selection) &&
      !selection?.canShare &&
      !isTemplatesRoom
    ) {
      setView(InfoPanelView.infoDetails);
    }
  }, [fileView, selection, isTemplatesRoom]);

  const isExpiredLink = useEventCallback(() =>
    checkIsExpiredLinkAsync(selection),
  );

  React.useEffect(() => {
    if (!id) return;

    isExpiredLink();
  }, [id, isExpiredLink]);

  const getView = () => {
    if (isUsers || isGuests) return <Users isGuests={isGuests} />;

    if (isGroups) return <Groups />;

    if (isSeveralItems || Array.isArray(selection))
      return <SeveralItems selectedItems={selection} />;

    if (isNoItem || !selection) {
      const lockedSharedRoomProps = isLockedSharedRoom
        ? { isLockedSharedRoom }
        : {};
      return (
        <NoItem
          isRooms={isRooms}
          isFiles={isFiles}
          isTemplatesRoom={isTemplatesRoom}
          infoPanelSelection={selection}
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
          currentView={deferredCurrentView}
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
      (isUsers || isGuests || isGroups) ? (
        <ItemTitle
          infoPanelSelection={selection}
          isContacts={isUsers || isGuests || isGroups}
          isNoItem={isNoItem ?? false}
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

export default InfoPanelBodyGeneral;
