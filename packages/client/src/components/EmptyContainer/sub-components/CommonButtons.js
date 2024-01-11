import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import UpSvgUrl from "PUBLIC_DIR/images/up.svg?url";

import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

import { FolderType, RoomSearchArea } from "@docspace/common/constants";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import FilesFilter from "@docspace/common/api/files/filter";

import { getCategoryUrl, getCategoryType } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

const OptionsComponent = (props) => {
  const { onCreate, t, linkStyles } = props;

  return (
    <>
      <div className="empty-folder_container-links">
        <Box className="flex-wrapper_container">
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
          <Link data-format="docxf" onClick={onCreate} {...linkStyles}>
            {t("Translations:NewForm")}
          </Link>
        </Box>
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
        <Text as="span" color="#6A7378" fontSize="12px" noSelect>
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
    ) : (
      <></>
    );
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

  return <></>;
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

  return <></>;
};

export default inject(
  ({
    auth,
    accessRightsStore,
    treeFoldersStore,
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
    const { isArchiveFolderRoot } = treeFoldersStore;
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
      isArchiveFolderRoot,
    };
  }
)(withTranslation(["Files", "Translations"])(observer(CommonButtons)));
