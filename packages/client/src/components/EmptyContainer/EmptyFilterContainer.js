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
import React from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";

import EmptyFilterRoomsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import EmptyFilterRoomsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.dark.svg";

import EmptyFilterFilesLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg";
import EmptyFilterFilesDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { EmptyView } from "@docspace/shared/components/empty-view";

// import EmptyContainer from "./EmptyContainer";

const EmptyFilterContainer = ({
  t,
  selectedFolderId,
  setIsLoading,

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

  const descriptionText = isRooms
    ? t("Common:EmptyFilterRoomsDescription")
    : t("Common:EmptyFilterFilesDescription");

  const getIconURL = () => {
    if (isRooms)
      return theme.isBase ? (
        <EmptyFilterRoomsLightIcon />
      ) : (
        <EmptyFilterRoomsDarkIcon />
      );

    return theme.isBase ? (
      <EmptyFilterFilesLightIcon />
    ) : (
      <EmptyFilterFilesDarkIcon />
    );
  };

  /**
   * @param {React.MouseEvent<HTMLAnchorElement, MouseEvent>} event
   * @returns {void}
   */
  const onResetFilter = (event) => {
    event.preventDefault();

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

  const options = [
    {
      key: "empty-view-filter",
      to: "",
      description: t("Common:ClearFilter"),
      icon: <ClearEmptyFilterSvg />,
      onClick: onResetFilter,
    },
  ];

  const imageSrc = getIconURL();

  return (
    <EmptyView
      icon={imageSrc}
      title={t("Common:NoFindingsFound")}
      options={options}
      description={descriptionText}
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
