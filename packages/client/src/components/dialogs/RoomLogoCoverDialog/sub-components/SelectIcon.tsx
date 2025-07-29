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

import styled, { css } from "styled-components";
import { tablet } from "@docspace/shared/utils";
import { TColorScheme } from "@docspace/shared/themes";
import hexRgb from "hex-rgb";
import { SelectIconProps, ILogo } from "../RoomLogoCoverDialog.types";

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
  background-color: ${(props) => props.theme.logoCover.selectedBackgroundColor};
  border: 1px solid ${(props) => props.theme.logoCover.selectedBorderColor};
  border-radius: 16px;
  box-sizing: border-box;

  @media ${tablet} {
    padding: 5px 21px;
    margin: 12px auto;
  }

  &:hover {
    cursor: pointer;
  }

  ${(props) =>
    !props.isSelected &&
    css`
      background-color: ${({ theme }) => theme.logoCover.backgroundColor};
      border: 1px solid ${({ theme }) => theme.logoCover.borderColor};
    `}
`;

const StyledIconContainer = styled.div<{
  $currentColorScheme?: TColorScheme;
  isSelected: boolean;
}>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 30px;
  height: 30px;

  @media ${tablet} {
    width: 40px;
    height: 40px;
  }
  border-radius: 4px;

  svg {
    path {
      fill: ${(props) => props.theme.logoCover.iconColor};
    }
  }

  &:hover {
    cursor: pointer;
    svg {
      path {
        ${({ $currentColorScheme }) =>
          $currentColorScheme &&
          css`
            fill: ${$currentColorScheme.main?.accent};
          `}
      }
    }
  }

  .cover-icon {
    overflow: visible;
    &:hover {
      cursor: pointer;
    }
  }
  ${(props) =>
    props.isSelected &&
    props.$currentColorScheme &&
    css`
      background-color: ${hexRgb(props.$currentColorScheme.main?.accent, {
        alpha: 0.2,
        format: "css",
      })};

      svg {
        path {
          fill: ${props.$currentColorScheme.main?.accent};
        }
      }
    `}
`;

export const SelectIcon = ({
  t,
  withoutIcon,
  setWithoutIcon,
  setIcon,
  covers,
  $currentColorScheme,
  coverId,
}: SelectIconProps) => {
  const toggleWithoutIcon = () => setWithoutIcon(!withoutIcon);

  const onSelectIcon = (icon: ILogo | string | null) => {
    setIcon(icon);
  };

  return (
    <div>
      <div className="icon-container">
        <div className="color-name">{t("CreateEditRoomDialog:Icon")}</div>
        <StyledWithoutIcon onClick={toggleWithoutIcon} isSelected={withoutIcon}>
          {t("WithoutIcon")}
        </StyledWithoutIcon>
      </div>

      <div className="cover-icon-container">
        {covers
          ? covers?.map((icon) => {
              function createMarkup() {
                return { __html: icon.data };
              }
              return (
                <StyledIconContainer
                  isSelected={coverId === icon.id ? !withoutIcon : false}
                  $currentColorScheme={$currentColorScheme}
                  onClick={
                    coverId === icon.id
                      ? toggleWithoutIcon
                      : () => onSelectIcon(icon as unknown as string)
                  }
                  key={icon.id}
                  id={`cover-icon-${icon?.id}`}
                  dangerouslySetInnerHTML={createMarkup()}
                />
              );
            })
          : null}
      </div>
    </div>
  );
};
