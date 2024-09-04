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

import RoomsReactSvgUrl from "PUBLIC_DIR/images/rooms.react.svg?url";
import ManageAccessRightsReactSvgUrl from "PUBLIC_DIR/images/manage.access.rights.react.svg?url";
import ManageAccessRightsReactSvgDarkUrl from "PUBLIC_DIR/images/manage.access.rights.dark.react.svg?url";
import React from "react";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EmptyContainer from "./EmptyContainer";
import { Link } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
import RoomsFilter from "@docspace/shared/api/rooms/filter";

import { RoomSearchArea } from "@docspace/shared/enums";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

const RoomNoAccessContainer = (props) => {
  const {
    t,
    setIsLoading,
    linkStyles,

    isEmptyPage,
    sectionWidth,
    theme,
    isFrame,
    userId,
  } = props;

  const descriptionRoomNoAccess = t("NoAccessRoomDescription");
  const titleRoomNoAccess = t("NoAccessRoomTitle");

  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(onGoToShared, 5000);
    return () => clearTimeout(timer);
  }, []);

  const onGoToShared = () => {
    if (isFrame) return;
    setIsLoading(true);

    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    const filterParamsStr = filter.toUrlParams();

    const path = getCategoryUrl(CategoryType.Shared);

    navigate(`${path}?${filterParamsStr}`);
  };

  const goToButtons = (
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

  const propsRoomNotFoundOrMoved = {
    headerText: titleRoomNoAccess,
    descriptionText: isFrame ? "" : descriptionRoomNoAccess,
    imageSrc: theme.isBase
      ? ManageAccessRightsReactSvgUrl
      : ManageAccessRightsReactSvgDarkUrl,
    buttons: isFrame ? <></> : goToButtons,
  };

  return (
    <EmptyContainer
      isEmptyPage={isEmptyPage}
      sectionWidth={sectionWidth}
      className="empty-folder_room-not-found"
      {...propsRoomNotFoundOrMoved}
    />
  );
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
