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

import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import EmptyContainer from "./EmptyContainer";
import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";

const EmptyFilterContainer = ({
  t,
  selectedFolderId,
  setIsLoading,

  linkStyles,
  isRooms,
  isArchiveFolder,
  isRoomsFolder,
  setClearSearch,
  theme,
  isPublicRoom,
  publicRoomKey,
  userId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const subheadingText = t("EmptyFilterSubheadingText");
  const descriptionText = isRooms
    ? t("Common:SearchEmptyRoomsDescription")
    : t("Common:EmptyFilterDescriptionText");

  const onResetFilter = () => {
    setIsLoading(true);

    if (isArchiveFolder) {
      setClearSearch(true);
      return;
    }
    if (isRoomsFolder) {
      const newFilter = RoomsFilter.clean();

      navigate(`${location.pathname}?${newFilter.toUrlParams(userId)}`);
    } else {
      const newFilter = FilesFilter.getDefault();

      newFilter.folder = selectedFolderId;

      if (isPublicRoom) {
        navigate(
          `${location.pathname}?key=${publicRoomKey}&${newFilter.toUrlParams()}`,
        );
      } else {
        navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
      }
    }
  };

  const buttons = (
    <div className="empty-folder_container-links">
      <IconButton
        className="empty-folder_container-icon"
        size="12"
        onClick={onResetFilter}
        iconName={ClearEmptyFilterSvgUrl}
        isFill
      />
      <Link onClick={onResetFilter} {...linkStyles}>
        {t("Common:ClearFilter")}
      </Link>
    </div>
  );

  const imageSrc = theme.isBase
    ? EmptyScreenFilterAltSvgUrl
    : EmptyScreenFilterAltDarkSvgUrl;

  return (
    <EmptyContainer
      headerText={t("Common:NotFoundTitle")}
      descriptionText={descriptionText}
      imageSrc={imageSrc}
      buttons={buttons}
    />
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    selectedFolderStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    userStore,
  }) => {
    const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const { isPublicRoom, publicRoomKey } = publicRoomStore;
    const { user } = userStore;

    return {
      selectedFolderId: selectedFolderStore.id,
      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      isRooms,
      isArchiveFolder,
      isRoomsFolder,
      setClearSearch: filesStore.setClearSearch,
      theme: settingsStore.theme,
      userId: user?.id,

      isPublicRoom,
      publicRoomKey,
    };
  },
)(withTranslation(["Files", "Common"])(observer(EmptyFilterContainer)));
