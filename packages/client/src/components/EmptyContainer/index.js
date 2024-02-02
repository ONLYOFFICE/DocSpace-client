import { observer, inject } from "mobx-react";
//import { useLocation } from "react-router-dom";

import RootFolderContainer from "./RootFolderContainer";
import EmptyFilterContainer from "./EmptyFilterContainer";
import EmptyFolderContainer from "./EmptyFolderContainer";
import { Events } from "@docspace/shared/enums";
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

  sectionWidth,
  isRoomNotFoundOrMoved,
  isGracePeriod,
  setInviteUsersWarningDialogVisible,
  isRoot,
  isPublicRoom,
}) => {
  //const location = useLocation();

  linkStyles.color = theme.filesEmptyContainer.linkColor;

  const onCreate = (e) => {
    const format = e.currentTarget.dataset.format || null;

    const event = new Event(Events.CREATE);

    const payload = {
      extension: format,
      id: -1,
    };
    event.payload = payload;

    window.dispatchEvent(event);
  };

  const onCreateRoom = (e) => {
    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
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
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    dialogsStore,

    selectedFolderStore,
    clientLoadingStore,
    currentTariffStatusStore,
    publicRoomStore,
  }) => {
    const { isErrorRoomNotAvailable, isFiltered } = filesStore;
    const { isLoading } = clientLoadingStore;

    const { isGracePeriod } = currentTariffStatusStore;

    const { setInviteUsersWarningDialogVisible } = dialogsStore;
    const { isPublicRoom } = publicRoomStore;

    const isRoomNotFoundOrMoved =
      isFiltered === null &&
      selectedFolderStore.parentId === null &&
      isErrorRoomNotAvailable;

    const isRoot = selectedFolderStore.pathParts?.length === 1;

    return {
      theme: settingsStore.theme,
      isFiltered,
      isLoading,

      parentId: selectedFolderStore.parentId,
      isRoomNotFoundOrMoved,
      isGracePeriod,
      setInviteUsersWarningDialogVisible,
      type: selectedFolderStore.type,
      isRoot,
      isPublicRoom,
    };
  }
)(observer(EmptyContainer));
