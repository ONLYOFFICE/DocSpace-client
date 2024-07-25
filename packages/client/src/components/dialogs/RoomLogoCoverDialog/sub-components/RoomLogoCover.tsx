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
import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { RoomLogoCoverProps } from "./RoomLogoCover.types";

import { CustomLogo } from "./CustomLogo";
import { SelectColor } from "./SelectColor";

const logoColors = [
  "#FF6680",
  "#FF8F40",
  "#F2D230",
  "#61C059",
  "#70E096",
  "#1FCECB",
  "#5CC3F7",
  "#6191F2",
  "#7757D9",
  "#B679F2",
  "#FF7FD4",
];

const RoomLogoCoverContainer = styled.div`
  .room-logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .color-name {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
  }

  .colors-container {
    display: flex;
    flex-wrap: wrap;
  }
`;

const RoomLogoCover = (props) => {
  // const { appearanceTheme } = props;
  const { t } = useTranslation(["Common"]);

  const [color, setColor] = useState<string>(logoColors[3]); // set room icon default color

  // const onChangeColor: React.MouseEvent = (color: string) => {
  //   setColor(color);
  // };

  return (
    <RoomLogoCoverContainer>
      <div className="room-logo-container">
        <CustomLogo color={color} />
      </div>
      <div className="color-select-container">
        <SelectColor t={t} logoColors={logoColors} onChangeColor={setColor} />
      </div>
    </RoomLogoCoverContainer>
  );
};

export default inject<TStore>(({ settingsStore }) => {
  const {
    appearanceTheme,
    //   selectedThemeId,

    // getAppearanceTheme,
    // currentColorScheme,

    //  theme,
  } = settingsStore;

  return {
    appearanceTheme,
    //  selectedThemeId,

    // getAppearanceTheme,
    //  currentColorScheme,

    //   theme,
  };
})(observer(RoomLogoCover));
