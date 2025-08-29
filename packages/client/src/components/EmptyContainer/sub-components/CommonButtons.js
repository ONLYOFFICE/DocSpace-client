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

import PlusSvgUrl from "PUBLIC_DIR/images/icons/12/plus.svg?url";
import UpSvgUrl from "PUBLIC_DIR/images/up.svg?url";

import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import { FolderType, RoomSearchArea } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";
import { getCategoryType } from "@docspace/shared/utils";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";

const OptionsComponent = (props) => {
  const { onCreate, t, linkStyles } = props;

  return (
    <>
      <div className="empty-folder_container-links">
        <div className="flex-wrapper_container">
          <div className="first-button">
            <IconButton
              data-format="docx"
              className="empty-folder_container-icon"
              size={12}
              onClick={onCreate}
              iconName={PlusSvgUrl}
              isFill
            />
            <Link data-format="docx" onClick={onCreate} {...linkStyles}>
              {t("Document")},
            </Link>
          </div>
          <Link data-format="xlsx" onClick={onCreate} {...linkStyles}>
            {t("Spreadsheet")},
          </Link>
          <Link data-format="pptx" onClick={onCreate} {...linkStyles}>
            {t("Presentation")},
          </Link>
          <Link data-format="pdf" onClick={onCreate} {...linkStyles}>
            {t("Translations:NewForm")}
          </Link>
        </div>
      </div>

      <div className="empty-folder_container-links">
        <IconButton
          className="empty-folder_container-icon"
          size={12}
          onClick={onCreate}
          iconName={PlusSvgUrl}
          isFill
        />
        <Link {...linkStyles} onClick={onCreate}>
          {t("Folder")}
        </Link>
      </div>
    </>
  );
};

const InviteUsersComponent = (props) => {
  const { onInviteUsersClick, t, linkStyles } = props;

  return (
    <>
      <div className="second-description">
        <Text as="span" fontSize="12px">
          {t("AddMembersDescription")}
        </Text>
      </div>

      <div className="empty-folder_container-links">
        <IconButton
          className="empty-folder_container-icon"
          size={12}
          onClick={onInviteUsersClick}
          iconName={PlusSvgUrl}
          isFill
        />
        <Link onClick={onInviteUsersClick} {...linkStyles}>
          {t("InviteUsersInRoom")}
        </Link>
      </div>
    </>
  );
};

const ButtonsComponent = (props) => {
  const {
    isRoom,
    isArchiveFolderRoot,
    editAccess,
    onInviteUsersClick,
    onBackToParentFolder,
    linkStyles,
    t,
    isRoot,
  } = props;

  const displayRoomCondition = isRoom && !isArchiveFolderRoot;
  const canInviteUsers = isRoom && editAccess;

  if (displayRoomCondition) {
    return canInviteUsers ? (
      <InviteUsersComponent
        {...props}
        onInviteUsersClick={onInviteUsersClick}
      />
    ) : null;
  }

  if (!isRoot) {
    return (
      <div className="empty-folder_container-links">
        <IconButton
          className="empty-folder_container-icon"
          size={12}
          onClick={onBackToParentFolder}
          iconName={UpSvgUrl}
          isFill={false}
        />
        <Link onClick={onBackToParentFolder} {...linkStyles}>
          {t("BackToParentFolderButton")}
        </Link>
      </div>
    );
  }

  return null;
};

const CommonButtons = (props) => {
  const {
    canCreateFiles,
    roomType,
    navigationPath,
    rootFolderType,
    setIsLoading,
    folderId,
    onClickInviteUsers,
    parentId,
    userId,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const isRoom = !!roomType;

  const onBackToParentFolder = () => {
    setIsLoading(true);

    if (isRoom) {
      const path =
        rootFolderType === FolderType.Archive
          ? getCategoryUrl(CategoryType.Archive)
          : getCategoryUrl(CategoryType.Shared);

      const searchArea =
        rootFolderType === FolderType.Archive
          ? RoomSearchArea.Archive
          : RoomSearchArea.Active;

      const newFilter = RoomsFilter.getDefault(userId, searchArea);

      newFilter.searchArea = searchArea;

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

  if (canCreateFiles) {
    return (
      <>
        <OptionsComponent {...props} />
        <ButtonsComponent
          isRoom={isRoom}
          onInviteUsersClick={onInviteUsersClick}
          onBackToParentFolder={onBackToParentFolder}
          {...props}
        />
      </>
    );
  }

  return null;
};

export default inject(
  ({
    accessRightsStore,
    treeFoldersStore,
    selectedFolderStore,
    contextOptionsStore,
    clientLoadingStore,
    settingsStore,
    userStore,
  }) => {
    const {
      navigationPath,
      parentId,

      id: folderId,

      security,
      rootFolderType,
      roomType,
    } = selectedFolderStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    let id;
    if (navigationPath?.length) {
      const elem = navigationPath[0];
      id = elem.id;
    }

    const { canCreateFiles } = accessRightsStore;

    const { onClickInviteUsers } = contextOptionsStore;

    const { setIsSectionBodyLoading, isLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
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

      theme: settingsStore.theme,
      isArchiveFolderRoot,
      userId: userStore?.user?.user?.id,
    };
  },
)(withTranslation(["Files", "Translations"])(observer(CommonButtons)));
