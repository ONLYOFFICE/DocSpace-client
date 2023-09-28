import { ReactSVG } from "react-svg";
import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import EmptyContainer from "./EmptyContainer";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import { Text } from "@docspace/components";

import FilesFilter from "@docspace/common/api/files/filter";
import RoomsFilter from "@docspace/common/api/rooms/filter";

import { CategoryType } from "SRC_DIR/helpers/constants";
import { FolderType, RoomSearchArea } from "@docspace/common/constants";
import { getCategoryUrl, getCategoryType } from "SRC_DIR/helpers/utils";

import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import UpSvgUrl from "PUBLIC_DIR/images/up.svg?url";

import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/empty_screen_alt.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_alt_dark.svg?url";
import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import EmptyScreenCorporateDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";

import EmptyScreenRoleSvgUrl from "PUBLIC_DIR/images/empty_screen_role.svg?url";
import EmptyScreenRoleDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_role_dark.svg?url";
import EmptyScreenDoneSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import EmptyScreenDoneDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_done_dark.svg?url";

const EmptyFolderContainer = ({
  t,
  onCreate,

  setIsLoading,
  parentId,
  linkStyles,
  editAccess,
  sectionWidth,
  canCreateFiles,

  onClickInviteUsers,
  folderId,

  theme,

  navigationPath,
  rootFolderType,

  roomType,
  isLoading,
  folderType,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDoneFolder = folderType === FolderType.Done;
  const isInProgressFolder = folderType === FolderType.InProgress;

  const isRoom =
    isLoading && location?.state?.isRoom ? location?.state?.isRoom : !!roomType;

  const canInviteUsers = isRoom && editAccess;

  const getHeaderText = useCallback(() => {
    if (isRoom) return t("RoomCreated");

    if (isDoneFolder) return t("EmptyFormFolderDoneHeaderText");

    if (isInProgressFolder) return t("EmptyFormFolderProgressHeaderText");

    return t("EmptyScreenFolder");
  }, [isRoom, isDoneFolder, isInProgressFolder, t]);

  const getDescription = useCallback(() => {
    if (canCreateFiles) return t("EmptyFolderDecription");

    if (isDoneFolder) return t("EmptyFormFolderDoneDescriptionText");

    if (isInProgressFolder) return t("EmptyFormFolderProgressDescriptionText");

    return t("EmptyFolderDescriptionUser");
  }, [canCreateFiles, isDoneFolder, isInProgressFolder, t]);

  const getImage = useCallback(() => {
    if (isRoom)
      return theme.isBase
        ? EmptyScreenCorporateSvgUrl
        : EmptyScreenCorporateDarkSvgUrl;

    if (isDoneFolder)
      return theme.isBase ? EmptyScreenDoneSvgUrl : EmptyScreenDoneDarkSvgUrl;

    if (isInProgressFolder)
      return theme.isBase ? EmptyScreenRoleSvgUrl : EmptyScreenRoleDarkSvgUrl;

    return theme.isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl;
  }, [isRoom, isDoneFolder, isInProgressFolder, theme.isBase]);

  const onBackToParentFolder = () => {
    setIsLoading(true);

    if (isRoom) {
      const path =
        rootFolderType === FolderType.Archive
          ? getCategoryUrl(CategoryType.Archive)
          : getCategoryUrl(CategoryType.Shared);

      const newFilter = RoomsFilter.getDefault();

      newFilter.searchArea =
        rootFolderType === FolderType.Archive
          ? RoomSearchArea.Archive
          : RoomSearchArea.Active;

      const state = {
        title: navigationPath[0].title,
        isRoot: true,
        rootFolderType,
      };

      navigate(`${path}?${newFilter.toUrlParams()}`, {
        state,
      });
    } else {
      const categoryType = getCategoryType(location);

      const newFilter = FilesFilter.getDefault();
      newFilter.folder = parentId;

      const parentIdx = navigationPath.findIndex((v) => v.id === parentId);

      const parentItem = navigationPath[parentIdx];

      const state = {
        title: parentItem.title,
        isRoot: navigationPath.length === 1,
        rootFolderType,
      };

      const path = getCategoryUrl(categoryType, parentId);

      navigate(`${path}?${newFilter.toUrlParams()}`, {
        state,
      });
    }
  };

  const onInviteUsersClick = () => {
    if (!isRoom) return;

    onClickInviteUsers && onClickInviteUsers(folderId, roomType);
  };

  const buttons = canCreateFiles ? (
    <>
      <div className="empty-folder_container-links">
        <ReactSVG
          className="empty-folder_container_plus-image"
          src={PlusSvgUrl}
          data-format="docx"
          onClick={onCreate}
        />
        <Box className="flex-wrapper_container">
          <Link data-format="docx" onClick={onCreate} {...linkStyles}>
            {t("Document")},
          </Link>
          <Link data-format="xlsx" onClick={onCreate} {...linkStyles}>
            {t("Spreadsheet")},
          </Link>
          <Link data-format="pptx" onClick={onCreate} {...linkStyles}>
            {t("Presentation")},
          </Link>
          <Link data-format="docxf" onClick={onCreate} {...linkStyles}>
            {t("Translations:NewForm")}
          </Link>
        </Box>
      </div>

      <div className="empty-folder_container-links">
        <ReactSVG
          className="empty-folder_container_plus-image"
          onClick={onCreate}
          src={PlusSvgUrl}
        />
        <Link {...linkStyles} onClick={onCreate}>
          {t("Folder")}
        </Link>
      </div>

      {isRoom ? (
        canInviteUsers ? (
          <>
            <div className="empty-folder_container-links second-description">
              <Text as="span" color="#6A7378" fontSize="12px" noSelect>
                {t("AddMembersDescription")}
              </Text>
            </div>

            <div className="empty-folder_container-links">
              <ReactSVG
                className="empty-folder_container_plus-image"
                onClick={onInviteUsersClick}
                src={PlusSvgUrl}
              />
              <Link onClick={onInviteUsersClick} {...linkStyles}>
                {t("InviteUsersInRoom")}
              </Link>
            </div>
          </>
        ) : (
          <></>
        )
      ) : (
        <div className="empty-folder_container-links">
          <ReactSVG
            className="empty-folder_container_up-image"
            src={UpSvgUrl}
            onClick={onBackToParentFolder}
          />
          <Link onClick={onBackToParentFolder} {...linkStyles}>
            {t("BackToParentFolderButton")}
          </Link>
        </div>
      )}
    </>
  ) : isDoneFolder || isInProgressFolder ? (
    <div className="empty-folder_container-links">
      <ReactSVG
        className="empty-folder_container_up-image"
        src={UpSvgUrl}
        onClick={onBackToParentFolder}
      />
      <Link onClick={onBackToParentFolder} {...linkStyles}>
        {t("BackToParentFolderButton")}
      </Link>
    </div>
  ) : (
    <></>
  );

  const imageSrc = getImage();
  const headerText = getHeaderText();
  const descriptionText = getDescription();

  return (
    <EmptyContainer
      buttons={buttons}
      imageSrc={imageSrc}
      headerText={headerText}
      sectionWidth={sectionWidth}
      isEmptyFolderContainer={true}
      descriptionText={descriptionText}
      style={{ gridColumnGap: "39px", marginTop: 32 }}
    />
  );
};

export default inject(
  ({
    auth,
    accessRightsStore,

    selectedFolderStore,
    contextOptionsStore,
    clientLoadingStore,
  }) => {
    const {
      navigationPath,
      parentId,

      id: folderId,

      security,
      rootFolderType,
      roomType,
    } = selectedFolderStore;

    let id;
    if (navigationPath?.length) {
      const elem = navigationPath[0];
      id = elem.id;
    }

    const { canCreateFiles } = accessRightsStore;

    const { onClickInviteUsers } = contextOptionsStore;

    const { setIsSectionFilterLoading, isLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    return {
      setIsLoading,
      isLoading,
      parentId: id ?? parentId,
      roomType,
      canCreateFiles,

      navigationPath,
      rootFolderType,

      editAccess: security?.EditAccess,
      onClickInviteUsers,
      folderId,

      theme: auth.settingsStore.theme,
    };
  }
)(withTranslation(["Files", "Translations"])(observer(EmptyFolderContainer)));
