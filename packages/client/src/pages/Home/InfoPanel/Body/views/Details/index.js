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

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { isMobile } from "@docspace/shared/utils";

import { FileType, FolderType } from "@docspace/shared/enums";
import { Text } from "@docspace/shared/components/text";

import DetailsHelper from "../../helpers/DetailsHelper.js";
import { StyledNoThumbnail, StyledThumbnail } from "../../styles/details";
import { StyledProperties, StyledSubtitle } from "../../styles/common";

import { RoomIcon } from "@docspace/shared/components/room-icon";
const Details = ({
  t,
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
  setNewInfoPanelSelection,
  getLogoCoverModel,
  onChangeFile,
}) => {
  const [itemProperties, setItemProperties] = useState([]);

  const [isThumbnailError, setIsThumbmailError] = useState(false);
  const onThumbnailError = () => setIsThumbmailError(true);

  const navigate = useNavigate();

  const detailsHelper = new DetailsHelper({
    isCollaborator,
    isVisitor,
    t,
    item: selection,
    openUser,
    navigate,
    culture,
    selectTag,
    isDefaultRoomsQuotaSet,
    setNewInfoPanelSelection,
  });

  const createThumbnailAction = useCallback(async () => {
    setItemProperties(detailsHelper.getPropertyList());

    if (
      !selection.isFolder &&
      selection.thumbnailStatus === 0 &&
      (selection.fileType === FileType.Image ||
        selection.fileType === FileType.Spreadsheet ||
        selection.fileType === FileType.Presentation ||
        selection.fileType === FileType.Document)
    ) {
      await createThumbnail(selection.id);
    }
  }, [selection]);

  const onChangeFileContext = (e) => {
    onChangeFile(e, t);
  };

  useEffect(() => {
    createThumbnailAction();
  }, [selection, createThumbnailAction]);

  const currentIcon = selection?.logo?.large
    ? selection?.logo?.large
    : selection?.logo?.cover
      ? selection?.logo
      : getInfoPanelItemIcon(selection, 96);

  //console.log("InfoPanel->Details render", { selection });

  const isLoadedRoomIcon = !!selection.logo?.cover || !!selection.logo?.large;
  const showDefaultRoomIcon = !isLoadedRoomIcon && selection.isRoom;

  const hasImage = selection?.logo?.original;
  const model = getLogoCoverModel(t, hasImage);

  return (
    <>
      {selection.thumbnailUrl && !isThumbnailError ? (
        <StyledThumbnail
          isImageOrMedia={
            selection?.viewAccessibility?.ImageView ||
            selection?.viewAccessibility?.MediaView
          }
        >
          <img
            src={`${selection.thumbnailUrl}&size=1280x720`}
            alt="thumbnail-image"
            //height={260}
            //width={360}
            onError={onThumbnailError}
          />
        </StyledThumbnail>
      ) : (
        <StyledNoThumbnail>
          <RoomIcon
            color={selection.logo?.color}
            title={selection.title}
            isArchive={isArchive}
            size="96px"
            radius="16px"
            isRoom={selection.isRoom}
            showDefault={showDefaultRoomIcon}
            imgClassName={`no-thumbnail-img ${selection.isRoom && "is-room"} ${
              selection.isRoom &&
              !isArchive &&
              selection.logo?.large &&
              "custom-logo"
            }`}
            logo={currentIcon}
            model={model}
            withEditing={selection.isRoom}
            dropDownManualX={isMobile() ? "-30px" : "-10px"}
            onChangeFile={onChangeFileContext}
          />
        </StyledNoThumbnail>
      )}

      <StyledSubtitle>
        <Text fontWeight="600" fontSize="14px">
          {t("Properties")}
        </Text>
      </StyledSubtitle>

      <StyledProperties>
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
      </StyledProperties>
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
  }) => {
    const {
      infoPanelSelection,
      getInfoPanelItemIcon,
      openUser,
      setNewInfoPanelSelection,
    } = infoPanelStore;
    const { createThumbnail } = filesStore;
    const { culture } = settingsStore;
    const { user } = userStore;

    const { selectTag } = filesActionsStore;

    const isVisitor = user.isVisitor;
    const isCollaborator = user.isCollaborator;

    const isArchive = infoPanelSelection?.rootFolderType === FolderType.Archive;
    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    return {
      culture,
      selection: infoPanelSelection,
      createThumbnail,
      getInfoPanelItemIcon,
      openUser,
      isVisitor,
      isCollaborator,
      selectTag,
      isArchive,
      isDefaultRoomsQuotaSet,
      setNewInfoPanelSelection,
      getLogoCoverModel: dialogsStore.getLogoCoverModel,
      onChangeFile: avatarEditorDialogStore.onChangeFile,
    };
  },
)(
  withTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "Files",
    "RoomLogoCover",
  ])(Details),
);
