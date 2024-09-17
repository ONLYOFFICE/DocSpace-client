// (c) Copyright Ascensio System SIA 2009-2024
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
import { useContext } from "react";

import { observer, inject } from "mobx-react";
//import { useLocation } from "react-router-dom";

import { Context } from "@docspace/shared/utils";
import { Events, FileExtensions } from "@docspace/shared/enums";

import RootFolderContainer from "./RootFolderContainer";
import EmptyFilterContainer from "./EmptyFilterContainer";
import EmptyFolderContainer from "./EmptyFolderContainer";
import RoomNoAccessContainer from "./RoomNoAccessContainer";

const linkStyles = {
  isHovered: true,
  type: "action",
  fontWeight: "600",
  className: "empty-folder_link",
  display: "flex",
};

const EmptyContainer = ({
  isFiltered,
  //isLoading,
  parentId,
  theme,
  type,

  isRoomNotFoundOrMoved,
  isGracePeriod,
  setQuotaWarningDialogVisible,
  isRoot,
  isPublicRoom,
  isEmptyPage,
  isWarningRoomsDialog,
}) => {
  //const location = useLocation();

  const { sectionWidth } = useContext(Context);

  linkStyles.color = theme.filesEmptyContainer.linkColor;

  const onCreate = (e) => {
    const format = e.currentTarget.dataset.format || null;

    const event = new Event(Events.CREATE);

    const isPDF = format === FileExtensions.PDF;

    const payload = {
      extension: format,
      id: -1,
      edit: isPDF,
    };
    event.payload = payload;

    window.dispatchEvent(event);
  };

  const onCreateRoom = (e) => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
  };

  if (isRoomNotFoundOrMoved) {
    return (
      <RoomNoAccessContainer
        linkStyles={linkStyles}
        sectionWidth={sectionWidth}
      />
    );
  }

  const isRootEmptyPage = parentId === 0 || (isPublicRoom && isRoot);

  //isLoading && location?.state ? location.state?.isRoot : parentId === 0;

  return isFiltered ? (
    <EmptyFilterContainer linkStyles={linkStyles} />
  ) : isRootEmptyPage ? (
    <RootFolderContainer
      onCreate={onCreate}
      linkStyles={linkStyles}
      onCreateRoom={onCreateRoom}
      sectionWidth={sectionWidth}
    />
  ) : (
    <EmptyFolderContainer
      sectionWidth={sectionWidth}
      onCreate={onCreate}
      linkStyles={linkStyles}
      type={type}
      isEmptyPage={isEmptyPage}
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    dialogsStore,
    currentQuotaStore,
    selectedFolderStore,
    clientLoadingStore,
    currentTariffStatusStore,
    publicRoomStore,
  }) => {
    const { isErrorRoomNotAvailable, isFiltered } = filesStore;
    const { isLoading } = clientLoadingStore;

    const { isGracePeriod } = currentTariffStatusStore;

    const { setQuotaWarningDialogVisible } = dialogsStore;
    const { isPublicRoom } = publicRoomStore;

    const isRoomNotFoundOrMoved =
      isFiltered === null && isErrorRoomNotAvailable;

    const isRoot = selectedFolderStore.pathParts?.length === 1;
    const { isWarningRoomsDialog } = currentQuotaStore;

    return {
      theme: settingsStore.theme,
      isFiltered,
      isLoading,

      parentId: selectedFolderStore.parentId,
      isRoomNotFoundOrMoved,
      isGracePeriod,
      setQuotaWarningDialogVisible,
      type: selectedFolderStore.type,
      isRoot,
      isPublicRoom,
      isWarningRoomsDialog,
    };
  },
)(observer(EmptyContainer));
