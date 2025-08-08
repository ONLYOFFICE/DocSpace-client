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

import styled, { css } from "styled-components";
import hexRgb from "hex-rgb";
import { Text } from "@docspace/shared/components/text";
import { getTextColor } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";
import { CustomLogoProps, ICover } from "../RoomLogoCoverDialog.types";

interface StyledLogoProps {
  isBase: boolean;
  color: string | null;
  textColor: string | null;
}

const StyledLogo = styled.div<StyledLogoProps>`
  background-color: ${(props) => props.color};
  width: 96px;
  height: 96px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  .custom-logo-cover {
    svg {
      transform: scale(3);
      path {
        fill: ${(props) => props.textColor};
      }
    }
  }
  .logo-cover_wrapper {
    width: 100%;
    height: 100%;
    display: flex;

    .logo-cover-text {
      width: fit-content;
      height: fit-content;
      margin: auto;
    }
  }

  ${(props) =>
    !props.isBase &&
    props.color &&
    css`
      background-color: ${hexRgb(props.color, { alpha: 0.09, format: "css" })};

      .custom-logo-cover {
        svg {
          path {
            fill: ${props.color};
          }
        }
      }

      .logo-cover-text {
        color: ${props.color};
      }
    `}
`;

export const CustomLogo = ({
  color,
  icon,
  withoutIcon,
  isBaseTheme,
  roomTitle,
}: CustomLogoProps) => {
  const textColor = color && getTextColor(color, 202);

  return (
    <StyledLogo
      color={color as string}
      textColor={textColor}
      isBase={isBaseTheme}
    >
      {withoutIcon ? (
        <div className="logo-cover_wrapper">
          <Text
            className="logo-cover-text"
            fontSize="41px"
            color={textColor || globalColors.white}
            fontWeight={700}
          >
            {roomTitle}
          </Text>
        </div>
      ) : (
        <div
          {...((icon as ICover) && {
            dangerouslySetInnerHTML: {
              __html: (icon as ICover).data,
            },
          })}
          className="custom-logo-cover"
        />
      )}
    </StyledLogo>
  );
};
