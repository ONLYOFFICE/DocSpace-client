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
import { tablet } from "@docspace/shared/utils";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { ICover, SelectIconProps } from "../RoomLogoCoverDialog.types";
import { ReactSVG } from "react-svg";

interface WithoutIconProps {
  isSelected?: boolean;
}

const StyledWithoutIcon = styled.div<WithoutIconProps>`
  display: flex;
  white-space: nowrap;
  flex-direction: column;
  margin: 8px 0;
  gap: 4px;
  width: max-content;
  font-weight: 600;
  line-height: 20px;
  user-select: none;
  padding: 3px 15px;
  color: ${(props) => props.theme.logoCover.textColor};
  background-color: ${(props) => props.theme.logoCover.selectedBackgroundColor};
  border: 1px solid ${(props) => props.theme.logoCover.selectedBorderColor};
  border-radius: 16px;

  @media ${tablet} {
    padding: 5px 21px;
  }

  &:hover {
    cursor: pointer;
  }

  ${(props) =>
    !props.isSelected &&
    css`
      background-color: ${(props) => props.theme.logoCover.backgroundColor};
      border: 1px solid ${(props) => props.theme.logoCover.borderColor};
    `}
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;

  @media ${tablet} {
    width: 40px;
    height: 40px;
  }
  border-radius: 4px;
  &:hover {
    cursor: pointer;
    background-color: rgba(71, 129, 209, 0.2);
  }

  .cover-icon {
    overflow: visible;
    &:hover {
      cursor: pointer;
    }
  }
`;

export const SelectIcon = ({
  t,
  withoutIcon,
  setWithoutIcon,
  setIcon,
  covers,
}: SelectIconProps) => {
  const toggleWithoutIcon = () => setWithoutIcon(!withoutIcon);

  const onSelectIcon = (icon: ICover) => {
    setIcon(icon);
  };

  return (
    <div>
      <div className="color-name">{t("CreateEditRoomDialog:Icon")}</div>
      <StyledWithoutIcon onClick={toggleWithoutIcon} isSelected={withoutIcon}>
        {t("WithoutIcon")}
      </StyledWithoutIcon>
      <div className="cover-icon-container">
        {covers &&
          covers?.map((icon) => {
            function createMarkup() {
              return { __html: icon.data };
            }
            return (
              <StyledIconContainer
                onClick={() => onSelectIcon(icon)}
                key={icon.id}
                dangerouslySetInnerHTML={createMarkup()}
              />
            );
          })}
      </div>
    </div>
  );
};
