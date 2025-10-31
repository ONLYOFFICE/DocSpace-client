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

import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { FileType, FolderType } from "@docspace/shared/enums";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import { TRoom, TRoomLifetime } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";

import FilesStore from "SRC_DIR/store/FilesStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";

import DetailsHelper from "./Details.utils";

import commonStyles from "../../helpers/Common.module.scss";

import styles from "./Details.module.scss";

type DetailsProps = {
  selection: TRoom | TFile | TFolder;

  isArchive: boolean;

  culture?: SettingsStore["culture"];

  createThumbnail?: FilesStore["createThumbnail"];

  getInfoPanelItemIcon?: InfoPanelStore["getInfoPanelItemIcon"];
  openUser?: InfoPanelStore["openUser"];

  isVisitor?: boolean;
  isCollaborator?: boolean;

  selectTag?: FilesActionStore["selectTag"];
  onCreateRoomFromTemplate?: FilesActionStore["onCreateRoomFromTemplate"];

  isDefaultRoomsQuotaSet?: boolean;
  isDefaultAIAgentQuotaSet?: boolean;
  isAIAgentsFolder?: boolean;

  getLogoCoverModel?: DialogsStore["getLogoCoverModel"];

  onChangeFile?: AvatarEditorDialogStore["onChangeFile"];

  roomLifetime?: TRoomLifetime;
};

const Details = ({
  selection,
  culture,
  createThumbnail,
  getInfoPanelItemIcon,
  openUser,
  isVisitor,
  isCollaborator,
  selectTag,
  isArchive,
  isDefaultRoomsQuotaSet,
  isDefaultAIAgentQuotaSet,
  isAIAgentsFolder,

  getLogoCoverModel,
  onChangeFile,
  roomLifetime,
  onCreateRoomFromTemplate,
}: DetailsProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "Files",
    "RoomLogoCover",
  ]);
  const [itemProperties, setItemProperties] = useState<
    ReturnType<DetailsHelper["getPropertyList"]>
  >([]);
  const [isThumbnailError, setIsThumbmailError] = useState(false);

  const onThumbnailError = () => setIsThumbmailError(true);

  const detailsHelper = new DetailsHelper({
    isCollaborator: isCollaborator!,
    isVisitor: isVisitor!,
    t,
    item: selection,
    openUser: openUser!,
    culture: culture!,
    selectTag: selectTag!,
    isDefaultRoomsQuotaSet: isDefaultRoomsQuotaSet!,
    isDefaultAIAgentQuotaSet: isDefaultAIAgentQuotaSet!,
    isAIAgentsFolder: isAIAgentsFolder!,

    roomLifetime: roomLifetime!,
  });

  const createThumbnailAction = useCallback(async () => {
    let property = detailsHelper.getPropertyList();

    const isAgent =
      selection &&
      "rootFolderType" in selection &&
      "roomType" in selection &&
      selection.roomType &&
      selection.rootFolderType === FolderType.AIAgents;

    if (isAgent)
      property = property.filter((item) => {
        return item.id !== "Type";
      });

    setItemProperties(property);

    if (
      "isFolder" in selection &&
      !selection.isFolder &&
      "thumbnailStatus" in selection &&
      selection.thumbnailStatus === 0 &&
      (selection.fileType === FileType.Image ||
        selection.fileType === FileType.Spreadsheet ||
        selection.fileType === FileType.Presentation ||
        selection.fileType === FileType.Document)
    ) {
      await createThumbnail?.(selection.id);
    }
  }, [selection]);

  const onChangeFileContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFile?.(e, t);
  };

  const onCreateRoom = () => {
    onCreateRoomFromTemplate?.(selection);
  };

  useEffect(() => {
    createThumbnailAction();
  }, [selection, createThumbnailAction]);

  const currentIcon =
    "logo" in selection && selection?.logo?.large
      ? selection?.logo?.large
      : "logo" in selection && selection?.logo?.cover
        ? selection?.logo
        : getInfoPanelItemIcon?.(selection, 96);

  const badgeUrl =
    "external" in selection ? getRoomBadgeUrl(selection, 24) : undefined;

  const isLoadedRoomIcon =
    "logo" in selection && !!(selection.logo?.cover || selection.logo?.large);

  const showDefaultRoomIcon =
    "isRoom" in selection && (selection.isRoom as boolean)
      ? !isLoadedRoomIcon
      : false;

  const hasImage = "logo" in selection && selection?.logo?.original;
  const model = getLogoCoverModel?.(t, hasImage);

  const tooltipContent =
    "external" in selection && selection?.external
      ? t("Files:RecentlyOpenedTooltip")
      : null;

  const isTemplate =
    selection &&
    "isTemplate" in selection &&
    selection.isTemplate &&
    "isRoom" in selection &&
    selection.isRoom;

  const color = "logo" in selection ? selection.logo?.color : undefined;
  const title = "title" in selection ? selection.title : "";

  return (
    <>
      {isTemplate ? (
        <div className={styles.publicRoomBar}>
          <PublicRoomBar
            className={styles.roomTemplateBar}
            headerText={t("Files:RoomTemplate")}
            iconName={FormReactSvgUrl}
            bodyText={
              <>
                <Text
                  fontSize="12px"
                  fontWeight={400}
                  className={styles.roomTemplateText}
                >
                  {t("Files:RoomTemplateDescription")}
                </Text>
                <Button
                  label={t("Common:CreateRoom")}
                  className={styles.roomTemplateButton}
                  onClick={onCreateRoom}
                  size={ButtonSize.extraSmall}
                  primary
                  testId="info_panel_details_create_room_button"
                />
              </>
            }
          />
        </div>
      ) : "thumbnailUrl" in selection &&
        selection?.thumbnailUrl &&
        !isThumbnailError ? (
        <div
          className={classNames(styles.thumbnail, {
            [styles.isImageOrMedia]:
              "viewAccessibility" in selection &&
              (selection?.viewAccessibility?.ImageView ||
                selection?.viewAccessibility?.MediaView),
          })}
        >
          <img
            src={`${selection.thumbnailUrl}&size=3840x2160`}
            alt="thumbnail-image"
            onError={onThumbnailError}
          />
        </div>
      ) : (
        <div className={styles.noThumbnail}>
          <RoomIcon
            color={color}
            title={title}
            isArchive={isArchive}
            size="96px"
            radius="16px"
            // isRoom={"isRoom" in selection ? selection.isRoom : false}
            showDefault={showDefaultRoomIcon}
            imgClassName={`no-thumbnail-img ${"isRoom" in selection && selection.isRoom && styles.isRoom} ${
              "logo" in selection &&
              !isArchive &&
              selection.logo?.large &&
              styles.customLogo
            }`}
            logo={currentIcon}
            model={model}
            dropDownManualX={isMobile() ? "-30px" : "-10px"}
            onChangeFile={onChangeFileContext}
            badgeUrl={badgeUrl ?? undefined}
            tooltipContent={tooltipContent ?? undefined}
            tooltipId="info-panel-details_icon-tooltip"
            withEditing={"isRoom" in selection ? selection.isRoom : false}
            dataTestId="info_panel_details_room_icon"
          />
        </div>
      )}
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Properties")}
        </Text>
      </div>
      <div className={commonStyles.properties}>
        {itemProperties.map((property) => {
          return (
            <div
              id={property.id}
              key={property.title}
              className={`property ${property.className}`}
            >
              <Text className="property-title">{property.title}</Text>
              {property.content}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    filesActionsStore,
    infoPanelStore,
    userStore,
    currentQuotaStore,
    dialogsStore,
    avatarEditorDialogStore,
    selectedFolderStore,
    treeFoldersStore,
  }: TStore) => {
    const { getInfoPanelItemIcon, openUser, infoPanelRoomSelection } =
      infoPanelStore;

    const { createThumbnail } = filesStore;
    const { culture } = settingsStore;
    const { user } = userStore;

    const { selectTag, onCreateRoomFromTemplate } = filesActionsStore;

    const isVisitor = user?.isVisitor;
    const isCollaborator = user?.isCollaborator;

    const { isDefaultRoomsQuotaSet, isDefaultAIAgentQuotaSet } =
      currentQuotaStore;

    const { isAIAgentsFolder } = treeFoldersStore;
    return {
      culture,
      createThumbnail,
      getInfoPanelItemIcon,
      openUser,
      isVisitor,
      isCollaborator,
      selectTag,
      isDefaultRoomsQuotaSet,
      isDefaultAIAgentQuotaSet,
      isAIAgentsFolder,
      getLogoCoverModel: dialogsStore.getLogoCoverModel,
      onChangeFile: avatarEditorDialogStore.onChangeFile,
      roomLifetime:
        infoPanelRoomSelection?.lifetime ?? selectedFolderStore?.lifetime,
      onCreateRoomFromTemplate,
    };
  },
)(observer(Details));
