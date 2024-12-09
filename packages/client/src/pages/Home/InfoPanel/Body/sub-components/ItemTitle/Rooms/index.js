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

import { getTitleWithoutExtension } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import Camera10ReactSvgUrl from "PUBLIC_DIR/images/icons/10/cover.camera.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import { IconButton } from "@docspace/shared/components/icon-button";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";
import { FolderType } from "@docspace/shared/enums";
import { StyledTitle } from "../../../styles/common";
import RoomsContextBtn from "./context-btn";
import CalendarComponent from "../Calendar";

import Search from "../../Search";

const RoomsItemHeader = ({
  t,
  selection,
  infoPanelSelection,
  setIsMobileHidden,
  isGracePeriod,
  setInvitePanelOptions,
  setQuotaWarningDialogVisible,
  roomsView,
  setSelection,
  setBufferSelection,
  isArchive,
  isShared,
  showSearchBlock,
  setCalendarDay,
  openHistory,
  setShowSearchBlock,
  roomType,
  setIsScrollLocked,
  i18n,
  displayFileExtension,
  getLogoCoverModel,
  onChangeFile,
}) => {
  const itemTitleRef = useRef();

  if (!selection) return null;

  const icon = selection.icon;
  const isLoadedRoomIcon = !!selection.logo?.cover || !!selection.logo?.medium;
  const showDefaultRoomIcon = !isLoadedRoomIcon && selection.isRoom;
  const security = infoPanelSelection ? infoPanelSelection.security : {};
  const canInviteUserInRoomAbility = security?.EditAccess;

  const isRoomMembersPanel = selection?.isRoom && roomsView === "info_members";

  const badgeUrl = getRoomBadgeUrl(selection);

  const isFile = !!selection.fileExst;
  let title = selection.title;

  if (isFile) {
    title = getTitleWithoutExtension(selection, false);
  }

  const onSelectItem = () => {
    setSelection([]);
    setBufferSelection(selection);
  };

  const onChangeFileContext = (e) => {
    onChangeFile(e, t);
  };

  const onClickInviteUsers = () => {
    onSelectItem();
    setIsMobileHidden(true);
    const parentRoomId = infoPanelSelection.id;

    if (isGracePeriod) {
      setQuotaWarningDialogVisible(true);
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
  const hasImage = selection?.logo?.original;
  const model = getLogoCoverModel(t, hasImage);

  return (
    <StyledTitle ref={itemTitleRef}>
      {isRoomMembersPanel && showSearchBlock && <Search />}

      <div className="item-icon">
        <RoomIcon
          color={selection.logo?.color}
          title={title}
          isArchive={isArchive}
          showDefault={showDefaultRoomIcon}
          imgClassName={`icon ${selection.isRoom && "is-room"}`}
          logo={icon}
          badgeUrl={badgeUrl || ""}
          hoverSrc={
            selection.isRoom &&
            selection.security?.EditRoom &&
            Camera10ReactSvgUrl
          }
          model={model}
          onChangeFile={onChangeFileContext}
        />
      </div>

      <Text
        fontWeight={600}
        fontSize="16px"
        className="info-panel_header-text"
        title={title}
        dir="auto"
        truncate
      >
        {title}
        {isFile && displayFileExtension && (
          <span className="file-extension">{selection.fileExst}</span>
        )}
      </Text>

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
            className="icon"
            title={t("Common:InviteContacts")}
            iconName={PersonPlusReactSvgUrl}
            isFill
            onClick={onClickInviteUsers}
            size={16}
          />
        )}
        {/* Show after adding a calendar request
        {openHistory && (
          <CalendarComponent
            setCalendarDay={setCalendarDay}
            roomCreationDate={selection.created}
            setIsScrollLocked={setIsScrollLocked}
            locale={i18n.language}
          />
        )} */}
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
    filesSettingsStore,
    publicRoomStore,
    settingsStore,
    avatarEditorDialogStore,
  }) => {
    const {
      infoPanelSelection,
      roomsView,
      setIsMobileHidden,
      showSearchBlock,
      setShowSearchBlock,
      setCalendarDay,
      setIsScrollLocked,
      updateInfoPanelSelection,
    } = infoPanelStore;

    const { displayFileExtension } = filesSettingsStore;
    const { externalLinks } = publicRoomStore;
    const { setCoverSelection } = dialogsStore;

    const selection = infoPanelSelection.length > 1 ? null : infoPanelSelection;
    const isArchive = selection?.rootFolderType === FolderType.Archive;

    const { onChangeFile } = avatarEditorDialogStore;

    setCoverSelection(selection);
    const roomType =
      selectedFolderStore.roomType ??
      infoPanelStore.infoPanelSelection?.roomType;

    return {
      selection,
      roomsView,
      infoPanelSelection,
      setIsMobileHidden,
      showSearchBlock,
      setShowSearchBlock,

      isGracePeriod: currentTariffStatusStore.isGracePeriod,

      setInvitePanelOptions: dialogsStore.setInvitePanelOptions,
      setQuotaWarningDialogVisible: dialogsStore.setQuotaWarningDialogVisible,
      getLogoCoverModel: dialogsStore.getLogoCoverModel,

      setSelection: filesStore.setSelection,
      setBufferSelection: filesStore.setBufferSelection,
      isArchive,
      hasLinks: externalLinks.length,
      setCalendarDay,
      roomType,
      setIsScrollLocked,
      isShared: selection?.shared,
      roomType,

      displayFileExtension,
      maxImageUploadSize: settingsStore.maxImageUploadSize,
      updateInfoPanelSelection,
      onChangeFile,
    };
  },
)(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
    "RoomLogoCover",
  ])(observer(RoomsItemHeader)),
);
