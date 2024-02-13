import React from "react";

import styled, { css } from "styled-components";
import { Base } from "../../themes";
import { Text } from "../text";

import { IconButton } from "../icon-button";

const StyledIcon = styled.div<{
  size: string;
  radius: string;
  isArchive?: boolean;
  color: string;
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
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
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
    margin: 24px 0 0 24px;

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

interface RoomIconProps {
  title: string;
  isArchive?: boolean;
  color: string;
  size?: string;
  radius?: string;
  showDefault: boolean;
  imgClassName?: string;
  imgSrc?: string;
  badgeUrl?: string;
  onBadgeClick?: () => void;
}

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
}: RoomIconProps) => {
  const [correctImage, setCorrectImage] = React.useState(true);

  const titleWithoutSpaces = title.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const roomTitle = (title[0] + secondCharacter).toUpperCase();

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

  return showDefault || !correctImage ? (
    <StyledIcon
      color={color}
      size={size}
      radius={radius}
      isArchive={isArchive}
      wrongImage={!correctImage}
      data-testid="room-icon"
    >
      <div className="room-background" />
      <Text className="room-title">{roomTitle}</Text>
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
  ) : (
    <img className={imgClassName} src={imgSrc} alt="room icon" />
  );
};

export { RoomIcon };
