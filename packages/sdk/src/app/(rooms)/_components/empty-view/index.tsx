// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";
import RoomsFilter from "@docspace/shared/api/rooms/filter";

import EmptyRoomsRootLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.light.svg";
import EmptyRoomsRootDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.dark.svg";
import EmptyArchiveLightIcon from "PUBLIC_DIR/images/emptyview/empty.archive.light.svg";
import EmptyArchiveDarkIcon from "PUBLIC_DIR/images/emptyview/empty.archive.dark.svg";
import EmptyFilterRoomsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import EmptyFilterRoomsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.dark.svg";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import FolderReactSvg from "PUBLIC_DIR/images/folder.react.svg";

type RoomsEmptyViewProps = {
  isFiltered: boolean;
  isArchive?: boolean;
};

const RoomsEmptyView = ({ isFiltered, isArchive }: RoomsEmptyViewProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase: isBaseTheme } = useTheme();
  const router = useRouter();

  const getIcon = () => {
    if (isFiltered) {
      return isBaseTheme ? (
        <EmptyFilterRoomsLightIcon />
      ) : (
        <EmptyFilterRoomsDarkIcon />
      );
    }
    if (isArchive) {
      return isBaseTheme ? <EmptyArchiveLightIcon /> : <EmptyArchiveDarkIcon />;
    }
    return isBaseTheme ? <EmptyRoomsRootLightIcon /> : <EmptyRoomsRootDarkIcon />;
  };

  const onResetFilter = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();
    const defaultFilter = RoomsFilter.getDefault();
    window.history.pushState(null, "", `?${defaultFilter.toUrlParams()}`);
  };

  const filterOptions = [
    {
      key: "empty-view-filter",
      to: "",
      description: t("Common:ClearFilter"),
      icon: <ClearEmptyFilterSvg />,
      onClick: onResetFilter,
      isNext: true,
    },
  ];

  const onGoToRooms = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();
    router.push("/rooms");
  };

  const archiveOptions = [
    {
      key: "empty-view-go-to-rooms",
      to: "",
      description: t("Common:GoToMyRooms"),
      icon: <FolderReactSvg />,
      onClick: onGoToRooms,
      isNext: true,
    },
  ];

  const getTitle = () => {
    if (isFiltered) return t("Common:NoFindingsFound2");
    if (isArchive) return t("Common:ArchiveEmptyScreenHeader");
    return t("Common:EmptyRoomsHeader");
  };

  const getDescription = () => {
    if (isFiltered) return t("Common:EmptyFilterRoomsDescription");
    if (isArchive)
      return t("Common:ArchiveEmptyScreen", {
        productName: getBrandName("ProductName"),
      });
    return t("Common:EmptyRoomsDescriptionText", {
      sectionName: t("Common:Rooms"),
    });
  };

  const getOptions = () => {
    if (isFiltered) return filterOptions;
    if (isArchive) return archiveOptions;
    return [];
  };

  return (
    <EmptyViewComponent
      icon={getIcon()}
      title={getTitle()}
      description={getDescription()}
      options={getOptions()}
    />
  );
};

export default RoomsEmptyView;
