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

import React from "react";
import styled, { css } from "styled-components";
import { IconButton } from "@docspace/shared/components/icon-button";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import { SelectColorProps } from "../RoomLogoCoverDialog.types";

interface ColorItemProps {
  isEmptyColor?: boolean;
}

const StyledColorItem = styled.div<ColorItemProps>`
  width: 30px;
  height: 30px;
  margin-right: 10px;
  margin-top: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.color};

  ${(props) =>
    props.isEmptyColor &&
    css`
      display: flex;
      justify-content: center;
      align-items: center;
    `}

  &:hover {
    cursor: pointer;
  }
`;

const SelectedColorItem = styled.div`
  width: 28px;
  height: 28px;
  margin-right: 8px;
  margin-top: 6px;
  border-radius: 50%;
  border: ${(props) => `solid 2px ${props.color}`};
  display: flex;
  align-items: center;
  justify-content: center;

  .circle {
    width: 20px;
    height: 20px;
    background-color: ${(props) => props.color};
    border-radius: 50%;
  }
`;

export const SelectColor = ({
  logoColors,
  selectedColor,
  t,
  onChangeColor,
}: SelectColorProps) => {
  return (
    <div className="select-color-container">
      <div className="color-name">{t("Common:Color")}</div>
      <div className="colors-container">
        {logoColors.map((color) =>
          color === selectedColor ? (
            <SelectedColorItem key={color} color={color}>
              <div className="circle" color={color} />
            </SelectedColorItem>
          ) : (
            <StyledColorItem
              key={color}
              color={color}
              onClick={() => onChangeColor(color)}
            />
          ),
        )}
        <StyledColorItem isEmptyColor>
          <IconButton
            className="select-color-plus-icon"
            size={16}
            iconName={PlusSvgUrl}
            isFill
          />
        </StyledColorItem>
      </div>
    </div>
  );
};
