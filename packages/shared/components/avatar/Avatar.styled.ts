import styled from "styled-components";

import { TTheme, Base } from "../../themes";
import { commonIconsStyles, NoUserSelect } from "../../utils";

import { CameraReactSvg } from "./svg";
import { AvatarSize } from "./Avatar.enums";

const EmptyIcon = styled(CameraReactSvg)`
  ${commonIconsStyles}
  border-radius: ${(props) => props.theme.avatar.image.borderRadius};
`;
EmptyIcon.defaultProps = { theme: Base };

const EditContainer = styled.div`
  position: absolute;
  display: flex;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? `left: ${props.theme.avatar.editContainer.right};`
      : `right: ${props.theme.avatar.editContainer.right};`}

  bottom: ${(props) => props.theme.avatar.editContainer.bottom};
  background-color: ${(props) =>
    props.theme.avatar.editContainer.backgroundColor};
  border-radius: ${(props) => props.theme.avatar.editContainer.borderRadius};
  height: ${(props) => props.theme.avatar.editContainer.height};
  width: ${(props) => props.theme.avatar.editContainer.width};
  align-items: center;
  justify-content: center;

  .edit_icon {
    svg {
      path {
        fill: ${(props) => props.theme.avatar.editContainer.fill};
      }
    }
  }
`;
EditContainer.defaultProps = { theme: Base };

const AvatarWrapper = styled.div<{ source: string; userName: string }>`
  border-radius: ${(props) => props.theme.avatar.imageContainer.borderRadius};
  height: ${(props) => props.theme.avatar.imageContainer.height};

  background-color: ${(props) =>
    props.source
      ? props.theme.avatar.icon.background
      : props.userName
        ? props.theme.avatar.imageContainer.backgroundImage
        : props.theme.avatar.imageContainer.background};

  & > svg {
    display: ${(props) => props.theme.avatar.imageContainer.svg.display};
    width: ${(props) => props.theme.avatar.imageContainer.svg.width} !important;
    height: ${(props) =>
      props.theme.avatar.imageContainer.svg.height} !important;
    margin: ${(props) => props.theme.avatar.imageContainer.svg.margin};
    path {
      fill: ${(props) => props.theme.avatar.imageContainer.svg.fill};
    }
  }
`;
AvatarWrapper.defaultProps = { theme: Base };

const rightStyle = (props: { size: AvatarSize; theme: TTheme }) =>
  props.theme.avatar.roleWrapperContainer.right[props.size];
const bottomStyle = (props: { size: AvatarSize; theme: TTheme }) =>
  props.theme.avatar.roleWrapperContainer.bottom[props.size];

const RoleWrapper = styled.div<{
  size: AvatarSize;
  theme: TTheme;
}>`
  position: absolute;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? `left: ${rightStyle(props)};`
      : `right ${rightStyle(props)};`}

  bottom: ${(props) => bottomStyle(props)};

  display: flex;
  align-items: center;

  height: ${(props) =>
    (props.size === AvatarSize.max &&
      props.theme.avatar.roleWrapperContainer.height.max) ||
    (props.size === AvatarSize.medium &&
      props.theme.avatar.roleWrapperContainer.height.medium) ||
    "16px"};
  width: ${(props) =>
    (props.size === AvatarSize.max &&
      props.theme.avatar.roleWrapperContainer.width.max) ||
    (props.size === AvatarSize.medium &&
      props.theme.avatar.roleWrapperContainer.width.medium) ||
    "16px"};
  min-width: ${(props) =>
    (props.size === AvatarSize.max &&
      props.theme.avatar.roleWrapperContainer.width.max) ||
    (props.size === AvatarSize.medium &&
      props.theme.avatar.roleWrapperContainer.width.medium) ||
    "16px"};
`;
RoleWrapper.defaultProps = { theme: Base };

const fontSizeStyle = ({ size, theme }: { size: AvatarSize; theme: TTheme }) =>
  theme.avatar.initialsContainer.fontSize[size];

const NamedAvatar = styled.div<{ size: AvatarSize }>`
  position: absolute;
  color: ${(props) => props.theme.avatar.initialsContainer.color};
  left: ${(props) => props.theme.avatar.initialsContainer.left};
  top: ${(props) => props.theme.avatar.initialsContainer.top};
  transform: ${(props) => props.theme.avatar.initialsContainer.transform};
  font-weight: ${(props) => props.theme.avatar.initialsContainer.fontWeight};
  font-size: ${(props) => props.theme.getCorrectFontSize(fontSizeStyle(props))};

  ${NoUserSelect}
`;

NamedAvatar.defaultProps = { theme: Base };

const StyledImage = styled.img<{ isDefault?: boolean }>`
  width: ${(props) => props.theme.avatar.image.width};
  height: ${(props) => props.theme.avatar.image.height};
  border-radius: ${(props) => props.theme.avatar.image.borderRadius};
  // @ts-expect-error TS(2339): Property 'isDefault' does not exist on type 'Theme... Remove this comment to see the full error message
  content: ${(props) => props.isDefault && props.theme.avatar.defaultImage};
  ${NoUserSelect};
`;
StyledImage.defaultProps = { theme: Base };

const StyledIconWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon,
  .icon:hover {
    width: 50%;
    height: 50%;
    path {
      fill: ${(props) => props.theme.avatar.icon.color};
    }
  }
`;
StyledIconWrapper.defaultProps = { theme: Base };

const widthStyle = ({ size, theme }: { size: AvatarSize; theme: TTheme }) =>
  theme.avatar.width[size];
const heightStyle = ({ size, theme }: { size: AvatarSize; theme: TTheme }) =>
  theme.avatar.height[size];

const StyledAvatar = styled.div<{ size: AvatarSize; theme: TTheme }>`
  position: relative;
  width: ${(props) => widthStyle(props)};
  min-width: ${(props) => widthStyle(props)};
  height: ${(props) => heightStyle(props)};
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .admin_icon {
    rect:nth-child(1) {
      fill: ${(props) => props.theme.avatar.administrator.fill};
    }
    rect:nth-child(2) {
      stroke: ${(props) => props.theme.avatar.administrator.stroke};
    }
    path {
      fill: ${(props) => props.theme.avatar.administrator.color};
    }
  }

  .guest_icon {
    rect:nth-child(1) {
      fill: ${(props) => props.theme.avatar.guest.fill};
    }
    rect:nth-child(2) {
      stroke: ${(props) => props.theme.avatar.guest.stroke};
    }
    path {
      fill: ${(props) => props.theme.avatar.guest.color};
    }
  }

  .owner_icon {
    rect:nth-child(1) {
      fill: ${(props) => props.theme.avatar.owner.fill};
    }
    rect:nth-child(2) {
      stroke: ${(props) => props.theme.avatar.owner.stroke};
    }
    path {
      fill: ${(props) => props.theme.avatar.owner.color};
    }
  }
`;
StyledAvatar.defaultProps = { theme: Base };

export {
  EmptyIcon,
  EditContainer,
  AvatarWrapper,
  RoleWrapper,
  NamedAvatar,
  StyledImage,
  StyledIconWrapper,
  StyledAvatar,
};
