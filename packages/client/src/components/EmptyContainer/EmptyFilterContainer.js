/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";

import EmptyFilterRoomsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import EmptyFilterRoomsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.dark.svg";

import EmptyFilterAIAgentsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.light.svg";
import EmptyFilterAIAgentsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.dark.svg";

import EmptyFilterFilesLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg";
import EmptyFilterFilesDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import { EmptyView } from "@docspace/shared/components/empty-view";
import { SearchArea } from "@docspace/shared/enums";

// import EmptyContainer from "./EmptyContainer";

const EmptyFilterContainer = ({
  t,
  selectedFolderId,
  setIsLoading,

  isRooms,
  isArchiveFolder,
  isRoomsFolder,
  isAIAgentsFolder,
  isRecentFolder,
  setClearSearch,
  theme,
  isPublicRoom,
  publicRoomKey,
  userId,
  isInsideKnowledge,
  isInsideResultStorage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const descriptionText = isAIAgentsFolder
    ? t("Common:EmptyFilterAIAgentsDescription")
    : isRooms
      ? t("Common:EmptyFilterRoomsDescription")
      : t("Common:EmptyFilterFilesDescription");

  const getIconURL = () => {
    if (isAIAgentsFolder) {
      return theme.isBase ? (
        <EmptyFilterAIAgentsLightIcon />
      ) : (
        <EmptyFilterAIAgentsDarkIcon />
      );
    }

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
    if (isRoomsFolder || isAIAgentsFolder) {
      const newFilter = RoomsFilter.clean();

      navigate(`${location.pathname}?${newFilter.toUrlParams(userId)}`);
    } else {
      const newFilter = FilesFilter.getDefault({ isRecentFolder });

      newFilter.folder = selectedFolderId;

      if (isInsideResultStorage) {
        newFilter.searchArea = SearchArea.ResultStorage;
      }

      if (isInsideKnowledge) {
        newFilter.searchArea = SearchArea.Knowledge;
      }

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
    const { isRoomsFolder, isArchiveFolder, isRecentFolder, isAIAgentsFolder } =
      treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const { isPublicRoom, publicRoomKey } = publicRoomStore;
    const { user } = userStore;

    return {
      selectedFolderId: selectedFolderStore.id,
      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      isRooms,
      isArchiveFolder,
      isAIAgentsFolder,
      isRoomsFolder,
      isRecentFolder,
      setClearSearch: filesStore.setClearSearch,
      theme: settingsStore.theme,
      userId: user?.id,
      isInsideKnowledge: selectedFolderStore.isInsideKnowledge,
      isInsideResultStorage: selectedFolderStore.isInsideResultStorage,

      isPublicRoom,
      publicRoomKey,
    };
  },
)(withTranslation(["Files", "Common"])(observer(EmptyFilterContainer)));
