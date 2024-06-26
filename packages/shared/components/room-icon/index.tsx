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
import { Base } from "../../themes";
import { Text } from "../text";

import { IconButton } from "../icon-button";
import { classNames } from "../../utils";

const StyledIcon = styled.div<{
  size: string;
  radius: string;
  isArchive?: boolean;
  color?: string;
  wrongImage: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: ${(props) => props.size};

  width: ${(props) => props.size};

  .room-background {
    height: ${(props) => props.size};

    width: ${(props) => props.size};

    border-radius: ${(props) => props.radius};
    vertical-align: middle;
    background: ${(props) =>
      props.isArchive
        ? props.theme.roomIcon.backgroundArchive
        : `#${props.color}`};
    position: absolute;
    opacity: ${(props) => props.theme.roomIcon.opacityBackground};
  }

  .room-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 16px;
    color: ${(props) =>
      props.wrongImage && props.theme.isBase ? "#333333" : "#ffffff"};
    position: relative;
    ${(props) =>
      !props.theme.isBase &&
      !props.isArchive &&
      css`
        color: ${`#${props.color}`};
      `};
  }

  .room-icon_badge {
    position: absolute;
    margin-block: 24px 0;
    margin-inline: 24px 0;

    .room-icon-button {
      width: 12px;
      height: 12px;
      border: ${(props) => `1px solid ${props.theme.backgroundColor}`};
      border-radius: 50%;

      svg {
        path {
          fill: ${(props) => props.theme.backgroundColor};
        }
        rect {
          stroke: ${(props) => props.theme.backgroundColor};
        }
      }
    }
  }
`;

StyledIcon.defaultProps = { theme: Base };

// interface RoomIconProps {
//   title: string;
//   isArchive?: boolean;
//   color: string;
//   size?: string;
//   radius?: string;
//   showDefault: boolean;
//   imgClassName?: string;
//   imgSrc?: string;

// }

type RoomIconDefault = {
  title: string;
  isArchive?: boolean;
  size?: string;
  radius?: string;
  showDefault: boolean;
  imgClassName?: string;
  className?: string;
};

type RoomIconColor = {
  color: string;
  imgSrc?: undefined;
  imgClassName?: undefined;
};

type RoomIconImage = {
  color?: string | undefined;
  imgSrc: string;
  imgClassName?: string;
};

type RoomIconBadge = { badgeUrl?: string; onBadgeClick?: () => void };

type RoomIconNonBadge = { badgeUrl?: undefined; onBadgeClick?: undefined };

type RoomIconProps = RoomIconDefault &
  (RoomIconColor | RoomIconImage) &
  (RoomIconBadge | RoomIconNonBadge);

const RoomIcon = ({
  title,
  isArchive = false,
  color,
  size = "32px",
  radius = "6px",
  showDefault,
  imgClassName,
  imgSrc,
  badgeUrl,
  onBadgeClick,
  className,
}: RoomIconProps) => {
  const [correctImage, setCorrectImage] = React.useState(true);

  const titleWithoutSpaces = title?.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces?.lastIndexOf(" ");
  const secondCharacter =
    !titleWithoutSpaces || indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const roomTitle = title && (title[0] + secondCharacter).toUpperCase();

  const prefetchImage = React.useCallback(() => {
    if (!imgSrc) return;
    const img = new Image();

    img.src = imgSrc;

    img.onerror = () => {
      setCorrectImage(false);
    };
  }, [imgSrc]);

  React.useEffect(() => {
    prefetchImage();
  }, [prefetchImage]);

  return (
    <StyledIcon
      color={color}
      size={size}
      radius={radius}
      isArchive={isArchive}
      wrongImage={!correctImage}
      className={className}
      data-testid="room-icon"
    >
      {showDefault || !correctImage ? (
        <>
          <div className="room-background" />
          <Text className="room-title">{roomTitle}</Text>
        </>
      ) : (
        <img
          className={classNames([imgClassName, "not-selectable"])}
          src={imgSrc}
          alt="room icon"
        />
      )}

      {badgeUrl && (
        <div className="room-icon_badge">
          <IconButton
            onClick={onBadgeClick}
            iconName={badgeUrl}
            size={12}
            className="room-icon-button"
            isFill
          />
        </div>
      )}
    </StyledIcon>
  );
};

export { RoomIcon };
