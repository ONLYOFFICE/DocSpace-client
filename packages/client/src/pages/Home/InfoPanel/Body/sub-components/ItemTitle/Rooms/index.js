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

import { useRef } from "react";
import { withTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import Planet12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/planet.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { StyledTitle } from "../../../styles/common";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import RoomsContextBtn from "./context-btn";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";

const RoomsItemHeader = ({
  t,
  selection,
  infoPanelSelection,
  setIsMobileHidden,
  isGracePeriod,
  setInvitePanelOptions,
  setInviteUsersWarningDialogVisible,
  roomsView,
  setSelection,
  setBufferSelection,
  isArchive,
  hasLinks,
  setShowSearchBlock,
  roomType,
}) => {
  const itemTitleRef = useRef();

  if (!selection) return null;

  const icon = selection.icon;
  const isLoadedRoomIcon = !!selection.logo?.medium;
  const showDefaultRoomIcon = !isLoadedRoomIcon && selection.isRoom;
  const security = infoPanelSelection ? infoPanelSelection.security : {};
  const canInviteUserInRoomAbility = security?.EditAccess;
  const showPlanetIcon =
    (selection.roomType === RoomsType.PublicRoom ||
      selection.roomType === RoomsType.CustomRoom) &&
    hasLinks;

  const badgeUrl = showPlanetIcon ? Planet12ReactSvgUrl : null;
  const isRoomMembersPanel = selection?.isRoom && roomsView === "info_members";

  const onSelectItem = () => {
    setSelection([]);
    setBufferSelection(selection);
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
      defaultAccess: getDefaultAccessUser(roomType),
    });
  };

  const onSearchClick = () => setShowSearchBlock(true);

  return (
    <StyledTitle ref={itemTitleRef}>
      <div className="item-icon">
        <RoomIcon
          color={selection.logo?.color}
          title={selection.title}
          isArchive={isArchive}
          showDefault={showDefaultRoomIcon}
          imgClassName={`icon ${selection.isRoom && "is-room"}`}
          imgSrc={icon}
          badgeUrl={badgeUrl ? badgeUrl : ""}
        />
      </div>

      <Text className="text">{selection.title}</Text>

      <div className="info_title-icons">
        {isRoomMembersPanel && (
          <IconButton
            id="info_search"
            className="icon"
            title={t("Common:Search")}
            iconName={SearchIconReactSvgUrl}
            onClick={onSearchClick}
            size={16}
          />
        )}

        {canInviteUserInRoomAbility && isRoomMembersPanel && (
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
        />
      </div>
    </StyledTitle>
  );
};

export default inject(
  ({
    currentTariffStatusStore,
    dialogsStore,
    selectedFolderStore,
    filesStore,
    infoPanelStore,
    publicRoomStore,
  }) => {
    const {
      infoPanelSelection,
      roomsView,
      setIsMobileHidden,
      setShowSearchBlock,
    } = infoPanelStore;
    const { externalLinks } = publicRoomStore;

    const selection = infoPanelSelection.length > 1 ? null : infoPanelSelection;
    const isArchive = selection?.rootFolderType === FolderType.Archive;

    const roomType =
      selectedFolderStore.roomType ??
      infoPanelStore.infoPanelSelection?.roomType;

    return {
      selection,
      roomsView,
      infoPanelSelection,
      setIsMobileHidden,
      setShowSearchBlock,

      isGracePeriod: currentTariffStatusStore.isGracePeriod,

      setInvitePanelOptions: dialogsStore.setInvitePanelOptions,
      setInviteUsersWarningDialogVisible:
        dialogsStore.setInviteUsersWarningDialogVisible,

      setSelection: filesStore.setSelection,
      setBufferSelection: filesStore.setBufferSelection,
      isArchive,
      hasLinks: externalLinks.length,
      roomType,
    };
  },
)(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
  ])(observer(RoomsItemHeader)),
);
