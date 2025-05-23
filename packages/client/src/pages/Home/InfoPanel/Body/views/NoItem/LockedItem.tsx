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
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import LockedSharedRoomLightIconURL from "PUBLIC_DIR/images/locked.shared.room.svg?url";
import LockedSharedRoomDarkIconURL from "PUBLIC_DIR/images/locked.shared.room.dark.svg?url";
import LockIcon from "PUBLIC_DIR/images/icons/12/lock.react.svg";

import { Text } from "@docspace/shared/components/text";
import type { TTranslation } from "@docspace/shared/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import {
  LockedSharedRoomButton,
  StyledNoItemContainer,
} from "../../styles/NoItem";

interface InjectedLockedItemProps {
  setPasswordEntryDialog: (visible?: boolean, item?: TRoom) => void;
}

interface ExternalLockedItemProps {
  t: TTranslation;
  item: TRoom;
}

interface LockedItemProps
  extends InjectedLockedItemProps,
    ExternalLockedItemProps {}

const LockedItem = ({ t, item, setPasswordEntryDialog }: LockedItemProps) => {
  const theme = useTheme();

  const imageSrc = theme.isBase
    ? LockedSharedRoomLightIconURL
    : LockedSharedRoomDarkIconURL;

  const openModal = () => {
    setPasswordEntryDialog(true, item);
  };

  return (
    <StyledNoItemContainer className="info-panel_gallery-empty-screen">
      <div className="no-thumbnail-img-wrapper">
        <img src={imageSrc} alt="Locked icon" />
      </div>
      <Text className="no-item-text" textAlign="center">
        {t("Common:NeedPassword")}
      </Text>
      <LockedSharedRoomButton onClick={openModal}>
        <LockIcon />
        <span>{t("Common:EnterPassword")}</span>
      </LockedSharedRoomButton>
    </StyledNoItemContainer>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const { setPasswordEntryDialog } = dialogsStore;

  return {
    setPasswordEntryDialog,
  };
})(observer(LockedItem as React.FC<ExternalLockedItemProps>));
