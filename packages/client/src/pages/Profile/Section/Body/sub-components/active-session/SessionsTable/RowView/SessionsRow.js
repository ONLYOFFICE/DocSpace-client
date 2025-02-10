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

import { inject, observer } from "mobx-react";
import { isMobile } from "@docspace/shared/utils";

import { Row } from "@docspace/shared/components/rows";
import { IconButton } from "@docspace/shared/components/icon-button";
import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";
import { globalColors } from "@docspace/shared/themes";
import SessionsRowContent from "./SessionsRowContent";

const SessionsRow = (props) => {
  const {
    item,
    sectionWidth,
    currentSession,
    setPlatformModalData,
    setLogoutDialogVisible,
  } = props;

  const showTickIcon = currentSession === item.id;

  const onRemoveClick = () => {
    setLogoutDialogVisible(true);
    setPlatformModalData({
      id: item?.id,
      platform: item?.platform,
      browser: item?.browser,
    });
  };

  const contentElement = showTickIcon ? (
    !isMobile() && (
      <IconButton
        size={16}
        iconName={TickSvgUrl}
        color={globalColors.tickColor}
      />
    )
  ) : (
    <IconButton
      size={20}
      iconName={RemoveSessionSvgUrl}
      isClickable
      onClick={onRemoveClick}
    />
  );

  return (
    <Row
      key={item.id}
      data={item}
      sectionWidth={sectionWidth}
      contentElement={contentElement}
    >
      <SessionsRowContent
        id={item.id}
        platform={item.platform}
        browser={item.browser}
        date={item.date}
        country={item.country}
        city={item.city}
        ip={item.ip}
        sectionWidth={sectionWidth}
        showTickIcon={showTickIcon}
      />
    </Row>
  );
};

export default inject(({ setup }) => {
  const { currentSession, setLogoutDialogVisible, setPlatformModalData } =
    setup;

  return {
    currentSession,
    setLogoutDialogVisible,
    setPlatformModalData,
  };
})(observer(SessionsRow));
