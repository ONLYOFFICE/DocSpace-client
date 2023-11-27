import styled, { css } from "styled-components";
import Base from "../themes/base";
import Text from "../text";

const StyledIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  height: ${(props) => props.size};
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
  width: ${(props) => props.size};

  .room-background {
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    height: ${(props) => props.size};
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    width: ${(props) => props.size};
    // @ts-expect-error TS(2339): Property 'radius' does not exist on type 'ThemedSt... Remove this comment to see the full error message
    border-radius: ${(props) => props.radius};
    vertical-align: middle;
    background: ${(props) =>
      // @ts-expect-error TS(2339): Property 'isArchive' does not exist on type 'Theme... Remove this comment to see the full error message
      props.isArchive
        ? props.theme.roomIcon.backgroundArchive
        : `#` + props.color};
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
      // @ts-expect-error TS(2339): Property 'isArchive' does not exist on type 'Theme... Remove this comment to see the full error message
      !props.isArchive &&
      css`
        // @ts-expect-error TS(2339): Property 'color' does not exist on type 'ThemeProp... Remove this comment to see the full error message
        color: ${(props) => `#` + props.color};
      `};
  }
`;

StyledIcon.defaultProps = { theme: Base };

const RoomIcon = ({
  title,
  isArchive = false,
  color,
  size = "32px",
  radius = "6px"
}: any) => {
  const titleWithoutSpaces = title.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const roomTitle = (title[0] + secondCharacter).toUpperCase();

  return (
    // @ts-expect-error TS(2749): 'StyledIcon' refers to a value, but is being used ... Remove this comment to see the full error message
    <StyledIcon color={color} size={size} radius={radius} isArchive={isArchive}>
      // @ts-expect-error TS(2304): Cannot find name 'div'.
      <div className="room-background" />
      // @ts-expect-error TS(2304): Cannot find name 'className'.
      <Text className="room-title">{roomTitle}</Text>
    </StyledIcon>
  );
};

export default RoomIcon;
