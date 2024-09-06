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
import React, { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { mobile, tablet, isMobile } from "@docspace/shared/utils";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import { getRoomTitle } from "@docspace/shared/components/room-icon/RoomIcon.utils";

import { CustomLogo } from "./CustomLogo";
import { SelectColor } from "./SelectColor/SelectColor";
import { SelectIcon } from "./SelectIcon";

import { RoomLogoCoverProps } from "../RoomLogoCoverDialog.types";

const logoColors = [
  "#FF6680",
  "#FF8F40",
  "#F2D230",
  "#61C059",
  "#1FCECB",
  "#5CC3F7",
  "#6191F2",
  "#7757D9",
  "#FF7FD4",
];

const RoomLogoCoverContainer = styled.div`
  .room-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
  }

  .color-name {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
  }
  .colors-container {
    flex-wrap: nowrap;
  }

  .colors-container,
  .cover-icon-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    @media ${tablet} {
      flex-wrap: wrap;
      gap: 16px;
    }
  }

  .cover-icon-container {
    @media ${mobile} {
      padding-left: 10px;
    }
  }

  .cover-icon-container,
  .color-name {
    user-select: none;
  }

  .select-color-container {
    margin-bottom: 14px;
  }
`;

const RoomLogoCover = ({
  isBaseTheme,
  logo,
  title,
  covers,
  setCover,
}: RoomLogoCoverProps) => {
  const { t } = useTranslation(["Common", "CreateEditRoomDialog"]);

  const roomTitle = React.useMemo(() => getRoomTitle(title ?? ""), [title]);

  const roomColor = logo?.color ? `#${logo.color}` : logoColors[0];

  const [color, setColor] = useState<string>(roomColor);
  const [icon, setIcon] = useState<string>(roomTitle);
  const [withoutIcon, setWithoutIcon] = useState<boolean>(true);

  const setLogoCover = (cover) => {
    setIcon(cover);
    setCover({ color: color.replace("#", ""), cover: cover.id });
  };

  const scrollRef = useRef(null);

  const selectContainerBody = (
    <>
      <div className="color-select-container">
        <SelectColor
          t={t}
          selectedColor={color}
          logoColors={logoColors}
          onChangeColor={setColor}
        />
      </div>
      <div className="icon-select-container">
        <SelectIcon
          t={t}
          withoutIcon={withoutIcon}
          setIcon={setLogoCover}
          setWithoutIcon={setWithoutIcon}
          covers={covers}
        />
      </div>
    </>
  );

  return (
    <RoomLogoCoverContainer>
      <div className="room-logo-container">
        <CustomLogo
          isBaseTheme={isBaseTheme}
          icon={icon}
          color={color}
          withoutIcon={withoutIcon}
          roomTitle={roomTitle}
        />
      </div>
      <div className="select-container">
        {isMobile() ? (
          selectContainerBody
        ) : (
          <Scrollbar ref={scrollRef} style={{ height: "378px" }}>
            {selectContainerBody}
          </Scrollbar>
        )}
      </div>
    </RoomLogoCoverContainer>
  );
};

export default inject<TStore>(({ settingsStore, filesStore, dialogsStore }) => {
  const { theme } = settingsStore;
  const { bufferSelection } = filesStore;

  return {
    isBaseTheme: theme?.isBase,
    logo: bufferSelection?.logo,
    title: bufferSelection?.title,
    setCover: dialogsStore.setCover,
  };
})(observer(RoomLogoCover));
