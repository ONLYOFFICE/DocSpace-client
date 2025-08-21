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

import FolderIcon from "PUBLIC_DIR/images/icons/12/folder.svg";
import ManageAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.dark.svg";
import ManageAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.light.svg";

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { RoomSearchArea } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { EmptyView } from "@docspace/shared/components/empty-view";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

const RoomNoAccessContainer = (props) => {
  const { t, setIsLoading, theme, isFrame, userId } = props;

  const descriptionRoomNoAccess = t("RoomAccessRedirectNote", {
    sectionName: t("Common:Rooms"),
  });
  const titleRoomNoAccess = t("NoAccessRoomTitle");

  const navigate = useNavigate();

  /**
   * @param {React.MouseEvent<HTMLAnchorElement, MouseEvent> | undefined} event
   * @returns {void}
   */
  const onGoToShared = (event) => {
    event?.preventDefault();

    if (isFrame) return;
    setIsLoading(true);

    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    const filterParamsStr = filter.toUrlParams();

    const path = getCategoryUrl(CategoryType.Shared);

    navigate(`${path}?${filterParamsStr}`);
  };

  React.useEffect(() => {
    const timer = setTimeout(onGoToShared, 5000);
    return () => clearTimeout(timer);
  }, [onGoToShared]);

  /**
   * @type {import("@docspace/shared/components/empty-view/EmptyView.types").EmptyViewProps}
   */
  const propsRoomNotFoundOrMoved = {
    title: titleRoomNoAccess,
    description: isFrame ? "" : descriptionRoomNoAccess,
    icon: theme.isBase ? (
      <ManageAccessRightsLightIcon />
    ) : (
      <ManageAccessRightsDarkIcon />
    ),
    options: isFrame
      ? []
      : [
          {
            to: "",
            icon: <FolderIcon />,
            onClick: onGoToShared,
            key: "empty-view-goto-rooms",
            description: t("GoToMyRooms"),
          },
        ],
  };

  return <EmptyView {...propsRoomNotFoundOrMoved} />;
};

export default inject(
  ({ settingsStore, filesStore, clientLoadingStore, userStore }) => {
    const { setIsSectionFilterLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };
    const { isEmptyPage } = filesStore;
    const { isFrame, theme } = settingsStore;
    return {
      setIsLoading,

      isEmptyPage,
      theme,
      isFrame,
      userId: userStore?.user?.id,
    };
  },
)(withTranslation(["Files"])(observer(RoomNoAccessContainer)));
