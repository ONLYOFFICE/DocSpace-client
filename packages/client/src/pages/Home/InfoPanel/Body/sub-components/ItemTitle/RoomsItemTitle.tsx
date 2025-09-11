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
import { useTranslation } from "react-i18next";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { getTitleWithoutExtension } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import { IconButton } from "@docspace/shared/components/icon-button";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import { isRoom as isRoomType } from "@docspace/shared/utils/typeGuards";
import { ShareEventName } from "@docspace/shared/components/share/Share.constants";

import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import Camera10ReactSvgUrl from "PUBLIC_DIR/images/icons/10/cover.camera.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";
import InfoPanelStore, { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";

import commonStyles from "../../helpers/Common.module.scss";

import Search, { SearchProps } from "../Search";

import RoomsContextBtn, { type TSelection } from "./ContextButton";

type RoomsItemHeaderProps = {
  selection: TSelection;

  setIsMobileHidden?: InfoPanelStore["setIsMobileHidden"];

  isGracePeriod?: CurrentTariffStatusStore["isGracePeriod"];

  setInvitePanelOptions?: DialogsStore["setInvitePanelOptions"];
  setQuotaWarningDialogVisible?: DialogsStore["setQuotaWarningDialogVisible"];
  getLogoCoverModel?: DialogsStore["getLogoCoverModel"];
  setTemplateAccessSettingsVisible?: DialogsStore["setTemplateAccessSettingsVisible"];
  setCoverSelection?: DialogsStore["setCoverSelection"];

  displayFileExtension?: boolean;

  onChangeFile?: AvatarEditorDialogStore["onChangeFile"];
  getIcon?: FilesSettingsStore["getIcon"];
  isRoomMembersPanel?: boolean;
} & (
  | {
      roomsView: InfoPanelView.infoMembers;
      searchProps: SearchProps;
    }
  | {
      roomsView?: InfoPanelStore["roomsView"];
      searchProps?: undefined;
    }
);

const RoomsItemHeader = ({
  selection,
  setIsMobileHidden,
  isGracePeriod,
  setInvitePanelOptions,
  setCoverSelection,
  setQuotaWarningDialogVisible,
  displayFileExtension,
  getLogoCoverModel,
  onChangeFile,
  setTemplateAccessSettingsVisible,
  getIcon,
  searchProps,
  isRoomMembersPanel,
}: RoomsItemHeaderProps) => {
  const { t } = useTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
    "RoomLogoCover",
  ]);

  const [showSearchBlock, setShowSearchBlock] = useState(false);

  const icon: string | undefined =
    "icon" in selection ? (selection.icon as string) : getIcon?.(32);
  const isLoadedRoomIcon =
    "logo" in selection &&
    (!!selection.logo?.cover || !!selection.logo?.medium);

  const showDefaultRoomIcon = !isLoadedRoomIcon;

  const security = selection.security;
  const canInviteUserInRoomAbility =
    security && "EditAccess" in security && security?.EditAccess;
  const isTemplate =
    ("isTemplate" in selection && selection.isTemplate) ||
    selection?.rootFolderType === FolderType.RoomTemplates;

  const canShare = !isRoomType(selection) && selection.canShare;

  const roomType =
    "roomType" in selection ? selection.roomType : RoomsType.CustomRoom;

  const hasImage = "logo" in selection && !!selection.logo?.original;
  const model = getLogoCoverModel?.(t, hasImage);

  const badgeUrl =
    "isRoom" in selection && selection.isRoom
      ? getRoomBadgeUrl(selection)
      : null;

  const tooltipContent =
    "external" in selection && selection.external
      ? t("Files:RecentlyOpenedTooltip")
      : null;

  const isFile = "fileExst" in selection && !!selection.fileExst;
  let title = selection.title;

  if (isFile) {
    title = getTitleWithoutExtension(selection, false);
  }

  const onChangeFileContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFile?.(e, t);
  };

  const onClickInviteUsers = () => {
    setIsMobileHidden?.(true);
    const parentRoomId = selection.id;

    if (isGracePeriod) {
      setQuotaWarningDialogVisible?.(true);
      return;
    }

    setInvitePanelOptions?.({
      visible: true,
      roomId: parentRoomId,
      hideSelector: false,
      defaultAccess: getDefaultAccessUser(roomType ?? RoomsType.CustomRoom),
    });
  };

  const onOpenTemplateAccessOptions = () => {
    setTemplateAccessSettingsVisible?.(true);
  };

  const openSelectorShareItemToUser = () => {
    const event = new CustomEvent(ShareEventName, {
      detail: {
        open: true,
        item: toJS(selection),
      },
    });

    window.dispatchEvent(event);
  };

  const onClickAddUser = () => {
    if (isTemplate) {
      return onOpenTemplateAccessOptions();
    }

    if (canShare) {
      return openSelectorShareItemToUser();
    }

    onClickInviteUsers();
  };

  const addUserTitle = canShare
    ? t("Common:AddUsers")
    : isTemplate
      ? t("Files:AccessSettings")
      : t("Common:InviteContacts");

  const onSearchClick = () => setShowSearchBlock?.(true);

  const isRoom = "isRoom" in selection && (selection.isRoom as boolean);

  const color = "logo" in selection ? selection.logo?.color : undefined;

  useEffect(() => {
    setCoverSelection?.(selection);
  }, [setCoverSelection, selection]);

  return (
    <div
      className={classNames(commonStyles.title, {
        [commonStyles.withBottomBorder]: false,
      })}
    >
      {isRoomMembersPanel && showSearchBlock && searchProps ? (
        <Search
          {...searchProps}
          resetSearch={() => {
            setShowSearchBlock(false);
            searchProps.resetSearch();
          }}
        />
      ) : null}

      <div className="item-icon">
        <RoomIcon
          isTemplate={isRoom ? isTemplate : false}
          color={color}
          title={title}
          isArchive={
            "rootFolderType" in selection
              ? selection.rootFolderType === FolderType.Archive
              : false
          }
          showDefault={isFile || !isRoom ? false : showDefaultRoomIcon}
          imgClassName={`icon ${isRoom && "is-room"}`}
          logo={icon}
          badgeUrl={badgeUrl || ""}
          tooltipContent={tooltipContent ?? undefined}
          hoverSrc={
            isRoom &&
            selection?.security &&
            "EditRoom" in selection.security &&
            selection.security?.EditRoom
              ? Camera10ReactSvgUrl
              : undefined
          }
          model={model}
          onChangeFile={onChangeFileContext}
          tooltipId="info-panel-title_icon-tooltip"
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
        {isFile && displayFileExtension ? (
          <span className="file-extension">{selection.fileExst}</span>
        ) : null}
      </Text>

      <div className="info_title-icons">
        {isRoomMembersPanel ? (
          <IconButton
            id="info_search"
            className="icon"
            title={t("Common:Search")}
            iconName={SearchIconReactSvgUrl}
            onClick={onSearchClick}
            size={16}
          />
        ) : null}

        {(canInviteUserInRoomAbility && isRoomMembersPanel) || canShare ? (
          <IconButton
            id="info_add-user"
            className="icon"
            title={addUserTitle}
            iconName={PersonPlusReactSvgUrl}
            isFill
            onClick={onClickAddUser}
            size={16}
          />
        ) : null}

        <RoomsContextBtn selection={selection} />
      </div>
    </div>
  );
};

export default inject(
  ({
    currentTariffStatusStore,
    dialogsStore,
    infoPanelStore,
    filesSettingsStore,
    publicRoomStore,
    avatarEditorDialogStore,
  }: TStore) => {
    const { roomsView, setIsMobileHidden } = infoPanelStore;

    const { displayFileExtension, getIcon } = filesSettingsStore;
    const { externalLinks } = publicRoomStore;
    const { setTemplateAccessSettingsVisible } = dialogsStore;

    const { onChangeFile } = avatarEditorDialogStore;

    return {
      roomsView,
      setIsMobileHidden,

      isGracePeriod: currentTariffStatusStore.isGracePeriod,

      setInvitePanelOptions: dialogsStore.setInvitePanelOptions,
      setQuotaWarningDialogVisible: dialogsStore.setQuotaWarningDialogVisible,
      getLogoCoverModel: dialogsStore.getLogoCoverModel,
      setCoverSelection: dialogsStore.setCoverSelection,

      hasLinks: externalLinks.length,

      displayFileExtension,
      onChangeFile,
      setTemplateAccessSettingsVisible,
      getIcon,
    };
  },
)(observer(RoomsItemHeader));
