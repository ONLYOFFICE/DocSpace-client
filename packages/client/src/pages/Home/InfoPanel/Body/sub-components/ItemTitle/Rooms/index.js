import { useRef } from "react";
import { withTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { StyledTitle } from "../../../styles/common";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import RoomsContextBtn from "./context-btn";
import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

const RoomsItemHeader = ({
  t,
  selection,
  infoPanelSelection,
  setIsMobileHidden,
  isGracePeriod,
  setInvitePanelOptions,
  setInviteUsersWarningDialogVisible,
  isPublicRoomType,
  roomsView,
  setSelected,
  setBufferSelection,
}) => {
  const itemTitleRef = useRef();

  if (!selection) return null;

  const icon = selection.icon;
  const isLoadedRoomIcon = !!selection.logo?.medium;
  const showDefaultRoomIcon = !isLoadedRoomIcon && selection.isRoom;
  const security = infoPanelSelection ? infoPanelSelection.security : {};
  const canInviteUserInRoomAbility = security?.EditAccess;
  const showInviteUserIcon = selection?.isRoom && roomsView === "info_members";

  const onSelectItem = () => {
    setSelected("none");
    setBufferSelection(selection);
  };

  const onCloseItem = () => {
    setSelected("none");
  };

  const onClickInviteUsers = () => {
    setIsMobileHidden(true);
    const parentRoomId = infoPanelSelection.id;

    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    setInvitePanelOptions({
      visible: true,
      roomId: parentRoomId,
      hideSelector: false,
      defaultAccess: isPublicRoomType
        ? ShareAccessRights.RoomManager
        : ShareAccessRights.ReadOnly,
    });
  };

  return (
    <StyledTitle ref={itemTitleRef}>
      <div className="item-icon">
        {showDefaultRoomIcon ? (
          <RoomIcon
            color={selection.logo.color}
            title={selection.title}
            isArchive={selection.isArchive}
          />
        ) : (
          <img
            className={`icon ${selection.isRoom && "is-room"}`}
            src={icon}
            alt="thumbnail-icon"
          />
        )}
      </div>

      <Text className="text">{selection.title}</Text>

      <div className="info_title-icons">
        {canInviteUserInRoomAbility && showInviteUserIcon && (
          <IconButton
            id="info_add-user"
            className={"icon"}
            title={t("Common:AddUsers")}
            iconName={PersonPlusReactSvgUrl}
            isFill={true}
            onClick={onClickInviteUsers}
            size={16}
          />
        )}

        <RoomsContextBtn
          selection={selection}
          itemTitleRef={itemTitleRef}
          onSelectItem={onSelectItem}
          onCloseItem={onCloseItem}
        />
      </div>
    </StyledTitle>
  );
};

export default inject(
  ({ auth, dialogsStore, selectedFolderStore, filesStore }) => {
    const { infoPanelSelection, roomsView } = auth.infoPanelStore;

    const selection = infoPanelSelection.length > 1 ? null : infoPanelSelection;

    return {
      selection,
      roomsView,
      infoPanelSelection: auth.infoPanelStore.infoPanelSelection,
      setIsMobileHidden: auth.infoPanelStore.setIsMobileHidden,

      isGracePeriod: auth.currentTariffStatusStore.isGracePeriod,

      setInvitePanelOptions: dialogsStore.setInvitePanelOptions,
      setInviteUsersWarningDialogVisible:
        dialogsStore.setInviteUsersWarningDialogVisible,

      isPublicRoomType:
        (selectedFolderStore.roomType ??
          auth.infoPanelStore.infoPanelSelection?.roomType) ===
        RoomsType.PublicRoom,

      setSelected: filesStore.setSelected,
      setBufferSelection: filesStore.setBufferSelection,
    };
  }
)(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
  ])(observer(RoomsItemHeader))
);
