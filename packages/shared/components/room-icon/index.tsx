import styled, { css } from "styled-components";
import { Base } from "../../themes";
import { Text } from "../text";

// import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
// import { IconButton } from "../icon-button";

const StyledIcon = styled.div<{
  size: string;
  radius: string;
  isArchive?: boolean;
  color: string;
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
    color: #ffffff;
    position: relative;
    ${(props) =>
      !props.theme.isBase &&
      !props.isArchive &&
      css`
        color: ${`#${props.color}`};
      `};
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
}: RoomIconProps) => {
  const titleWithoutSpaces = title.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const roomTitle = (title[0] + secondCharacter).toUpperCase();

  return showDefault ? (
    <StyledIcon
      color={color}
      size={size}
      radius={radius}
      isArchive={isArchive}
      data-testid="room-icon"
    >
      <div className="room-background" />
      <Text className="room-title">{roomTitle}</Text>
      {/* <IconButton
        onClick={() => {}}
        iconName={SecuritySvgUrl}
        size={32}
        isFill
      /> */}
    </StyledIcon>
  ) : (
    <img className={imgClassName} src={imgSrc} alt="room icon" />
  );
};

export { RoomIcon };
