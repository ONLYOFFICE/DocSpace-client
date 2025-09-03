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

import PrivacySvgUrl from "PUBLIC_DIR/images/privacy.svg?url";
import PersonSvgUrl from "PUBLIC_DIR/images/icons/12/person.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/12/plus.svg?url";
import RoomsReactSvgUrl from "PUBLIC_DIR/images/rooms.react.svg?url";

import { useNavigate, useLocation } from "react-router";
import { FolderType, RoomSearchArea } from "@docspace/shared/enums";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import EmptyScreenPersonalUrl from "PUBLIC_DIR/images/empty_screen_personal.svg?url";
import EmptyScreenPersonalDarkUrl from "PUBLIC_DIR/images/empty_screen_personal_dark.svg?url";
import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import EmptyScreenCorporateDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";
import EmptyScreenFavoritesUrl from "PUBLIC_DIR/images/emptyview/empty.favorites.svg?url";
import EmptyScreenFavoritesDarkUrl from "PUBLIC_DIR/images/emptyview/empty.favorites.dark.svg?url";
import EmptyScreenRecentUrl from "PUBLIC_DIR/images/empty_screen_recent.svg?url";
import EmptyScreenRecentDarkUrl from "PUBLIC_DIR/images/empty_screen_recent_dark.svg?url";
import EmptyScreenPrivacyUrl from "PUBLIC_DIR/images/empty_screen_privacy.svg?url";
import EmptyScreenPrivacyDarkUrl from "PUBLIC_DIR/images/empty_screen_privacy_dark.svg?url";
import EmptyScreenTrashSvgUrl from "PUBLIC_DIR/images/empty_screen_trash.svg?url";
import EmptyScreenTrashSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_trash_dark.svg?url";
import EmptyScreenArchiveUrl from "PUBLIC_DIR/images/empty_screen_archive.svg?url";
import EmptyScreenArchiveDarkUrl from "PUBLIC_DIR/images/empty_screen_archive_dark.svg?url";
import EmptyContainer from "./EmptyContainer";

import CommonButtons from "./sub-components/CommonButtons";

const RootFolderContainer = (props) => {
  const {
    t,
    theme,
    isPrivacyFolder,
    isDesktop,
    isEncryptionSupport,
    privateRoomsUrl,
    title,
    onCreate,
    onCreateRoom,
    myFolderId,

    setIsLoading,
    rootFolderType,
    linkStyles,

    isEmptyPage,

    isVisitor,
    isCollaborator,
    sectionWidth,

    security,

    myFolder,
    roomsFolder,
    isPublicRoom,
    userId,
    logoText,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const personalDescription = t("EmptyFolderDecription");
  const emptyScreenHeader = t("Common:EmptyScreenFolder");
  const archiveHeader = t("ArchiveEmptyScreenHeader");
  const noFilesHeader = t("NoFilesHereYet");
  const trashDescription = t("TrashFunctionalityDescription", {
    sectionName: t("Common:TrashSection"),
  });
  const favoritesDescription = t("FavoritesEmptyContainerDescription");
  const recentDescription = t("RecentViaLinkEmptyContainerDescription");

  const roomsDescription = isPublicRoom ? (
    <>
      <div>{t("Common:RoomEmptyAtTheMoment")}</div>
      <div>{t("Common:FilesWillAppearHere")}</div>
    </>
  ) : isVisitor || isCollaborator ? (
    t("RoomEmptyContainerDescriptionUser")
  ) : (
    t("RoomEmptyContainerDescription")
  );

  const archiveRoomsDescription =
    isVisitor || isCollaborator
      ? t("ArchiveEmptyScreenUser")
      : t("ArchiveEmptyScreen", { productName: t("Common:ProductName") });

  const privateRoomHeader = t("PrivateRoomHeader", {
    organizationName: logoText,
  });

  const privacyIcon = <img alt="" src={PrivacySvgUrl} />;

  const privateRoomDescTranslations = [
    t("PrivateRoomDescriptionSafest"),
    t("PrivateRoomDescriptionSecure"),
    t("PrivateRoomDescriptionEncrypted"),
    t("PrivateRoomDescriptionUnbreakable"),
  ];

  const roomHeader = t("Common:EmptyRootRoomHeader", {
    productName: t("Common:ProductName"),
  });

  const privateRoomDescription = (
    <>
      <Text fontSize="15px" as="div">
        {privateRoomDescTranslations.map((el) => (
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "0 0 13px 0",
            }}
            key={el}
          >
            <div style={{ padding: "0 7px 0 0" }}>{privacyIcon}</div>
            <div>{el}</div>
          </div>
        ))}
      </Text>
      {!isDesktop ? (
        <Text fontSize="12px">
          <Trans t={t} i18nKey="PrivateRoomSupport" ns="Files">
            Work in Private Room is available via{" "}
            {{ organizationName: logoText }} desktop app.
            <Link
              isBold
              isHovered
              color={theme.filesEmptyContainer.privateRoom.linkColor}
              href={privateRoomsUrl}
            >
              Instructions
            </Link>
          </Trans>
        </Text>
      ) : null}
    </>
  );

  const onGoToPersonal = () => {
    const newFilter = FilesFilter.getDefault();
    newFilter.folder = myFolderId;
    const state = {
      title: myFolder.title,
      isRoot: true,
      rootFolderType: myFolder.rootFolderType,
    };
    const path = getCategoryUrl(CategoryType.Personal);
    setIsLoading(true);
    navigate(`${path}?${newFilter.toUrlParams()}`, { state });
  };

  const onGoToShared = () => {
    const newFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);
    newFilter.searchArea = RoomSearchArea.Active;
    const state = {
      title: roomsFolder.title,
      isRoot: true,
      rootFolderType: roomsFolder.rootFolderType,
    };
    setIsLoading(true);
    const path = getCategoryUrl(CategoryType.Shared);
    navigate(`${path}?${newFilter.toUrlParams()}`, { state });
  };

  const commonButtons = (
    <CommonButtons onCreate={onCreate} linkStyles={linkStyles} isRoot />
  );

  const goToPersonalButtons = (
    <div className="empty-folder_container-links">
      <IconButton
        className="empty-folder_container-icon"
        size="12"
        onClick={onGoToPersonal}
        iconName={PersonSvgUrl}
        isFill
      />
      <Link onClick={onGoToPersonal} {...linkStyles}>
        {t("Files:GoToSection", {
          sectionName: t("Common:MyDocuments"),
        })}
      </Link>
    </div>
  );

  const trashButtons = (
    <div className="empty-folder_container-links">
      <IconButton
        className="empty-folder_container-icon"
        size="12"
        onClick={onGoToPersonal}
        iconName={PersonSvgUrl}
        isFill
      />
      <Link onClick={onGoToPersonal} {...linkStyles}>
        {t("Files:GoToSection", {
          sectionName: t("Common:MyDocuments"),
        })}
      </Link>
    </div>
  );

  const roomsButtons = (
    <div className="empty-folder_container-links">
      <IconButton
        className="empty-folder_container-icon"
        size="12"
        onClick={onCreateRoom}
        iconName={PlusSvgUrl}
        isFill
      />
      <Link onClick={onCreateRoom} {...linkStyles}>
        {t("Common:CreateRoom")}
      </Link>
    </div>
  );

  const archiveButtons = !isVisitor && (
    <div className="empty-folder_container-links">
      <IconButton
        className="empty-folder_container-icon"
        size="12"
        onClick={onGoToShared}
        iconName={RoomsReactSvgUrl}
        isFill
      />
      <Link onClick={onGoToShared} {...linkStyles}>
        {t("GoToMyRooms")}
      </Link>
    </div>
  );

  const getEmptyFolderProps = () => {
    switch (rootFolderType || location?.state?.rootFolderType) {
      case FolderType.USER:
        return {
          headerText: emptyScreenHeader,
          descriptionText: personalDescription,
          imageSrc: theme.isBase
            ? EmptyScreenPersonalUrl
            : EmptyScreenPersonalDarkUrl,
          buttons: commonButtons,
        };
      case FolderType.Favorites:
        return {
          headerText: noFilesHeader,
          descriptionText: favoritesDescription,
          imageSrc: theme.isBase
            ? EmptyScreenFavoritesUrl
            : EmptyScreenFavoritesDarkUrl,
          buttons: isVisitor ? null : goToPersonalButtons,
        };
      case FolderType.Recent:
        return {
          headerText: noFilesHeader,
          descriptionText: recentDescription,
          imageSrc: theme.isBase
            ? EmptyScreenRecentUrl
            : EmptyScreenRecentDarkUrl,
          buttons: isVisitor ? null : goToPersonalButtons,
        };
      case FolderType.Privacy:
        return {
          descriptionText: privateRoomDescription,
          imageSrc: theme.isBase
            ? EmptyScreenPrivacyUrl
            : EmptyScreenPrivacyDarkUrl,
          buttons: isDesktop && isEncryptionSupport && commonButtons,
        };
      case FolderType.TRASH:
        return {
          headerText: emptyScreenHeader,
          descriptionText: trashDescription,
          style: {
            gridColumnGap: "39px",
            marginTop: 32,
          },
          imageSrc: theme.isBase
            ? EmptyScreenTrashSvgUrl
            : EmptyScreenTrashSvgDarkUrl,
          buttons: trashButtons,
        };
      case FolderType.Rooms:
        return {
          headerText: roomHeader,
          descriptionText: roomsDescription,
          imageSrc: theme.isBase
            ? EmptyScreenCorporateSvgUrl
            : EmptyScreenCorporateDarkSvgUrl,
          buttons: !security?.Create ? null : roomsButtons,
        };
      case FolderType.Archive:
        return {
          headerText: archiveHeader,
          descriptionText: archiveRoomsDescription,
          imageSrc: theme.isBase
            ? EmptyScreenArchiveUrl
            : EmptyScreenArchiveDarkUrl,
          buttons: archiveButtons,
        };
      default:
        break;
    }
  };

  const headerText = isPrivacyFolder ? privateRoomHeader : title;
  const emptyFolderProps = getEmptyFolderProps();

  return (
    emptyFolderProps && (
      <EmptyContainer
        headerText={headerText}
        isEmptyPage={isEmptyPage}
        sectionWidth={sectionWidth}
        {...emptyFolderProps}
      />
    )
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    treeFoldersStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    publicRoomStore,
  }) => {
    const {
      isDesktopClient,
      isEncryptionSupport,
      theme,
      logoText,
      privateRoomsUrl,
    } = settingsStore;

    const { setIsSectionBodyLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const { filter, isEmptyPage } = filesStore;
    const { title, rootFolderType, security } = selectedFolderStore;
    const { isPrivacyFolder, myFolderId, myFolder, roomsFolder } =
      treeFoldersStore;

    const { isPublicRoom } = publicRoomStore;

    return {
      theme,
      isPrivacyFolder,
      isDesktop: isDesktopClient,
      isVisitor: userStore?.user?.isVisitor,
      userId: userStore?.user?.id,
      isCollaborator: userStore?.user?.isCollaborator,
      isEncryptionSupport,
      privateRoomsUrl,
      title,
      myFolderId,
      filter,

      setIsLoading,
      rootFolderType,

      isEmptyPage,

      security,

      myFolder,
      roomsFolder,
      isPublicRoom,
      logoText,
    };
  },
)(withTranslation(["Files", "Common"])(observer(RootFolderContainer)));
