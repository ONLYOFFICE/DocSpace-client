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

import styled from "styled-components";

import { Base, TTheme } from "../../themes";
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

const AvatarWrapper = styled.div<{
  source: string;
  userName: string;
  isGroup: boolean;
}>`
  border-radius: ${(props) => props.theme.avatar.imageContainer.borderRadius};
  height: ${(props) => props.theme.avatar.imageContainer.height};

  background-color: ${(props) => {
    if (props.source) return props.theme.avatar.icon.background;

    if (props.isGroup && props.userName)
      return props.theme.avatar.imageContainer.groupBackground;

    if (props.userName)
      return props.theme.avatar.imageContainer.backgroundImage;

    return props.theme.avatar.imageContainer.background;
  }};

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
    "12px"};
  width: ${(props) =>
    (props.size === AvatarSize.max &&
      props.theme.avatar.roleWrapperContainer.width.max) ||
    (props.size === AvatarSize.medium &&
      props.theme.avatar.roleWrapperContainer.width.medium) ||
    "12px"};
  min-width: ${(props) =>
    (props.size === AvatarSize.max &&
      props.theme.avatar.roleWrapperContainer.width.max) ||
    (props.size === AvatarSize.medium &&
      props.theme.avatar.roleWrapperContainer.width.medium) ||
    "12px"};
`;
RoleWrapper.defaultProps = { theme: Base };

const fontSizeStyle = ({
  size,
  theme,
  isGroup,
}: {
  size: AvatarSize;
  theme: TTheme;
  isGroup: boolean;
}) => {
  if (isGroup && size === AvatarSize.big)
    return theme.avatar.initialsContainer.fontSize.groupBig;

  return theme.avatar.initialsContainer.fontSize[size];
};

const NamedAvatar = styled.div<{ size: AvatarSize; isGroup: boolean }>`
  position: absolute;
  color: ${(props) =>
    props.isGroup
      ? props.theme.avatar.initialsContainer.groupColor
      : props.theme.avatar.initialsContainer.color};
  left: ${(props) => props.theme.avatar.initialsContainer.left};
  top: ${(props) => props.theme.avatar.initialsContainer.top};
  transform: ${(props) => props.theme.avatar.initialsContainer.transform};
  font-weight: ${(props) =>
    props.theme.avatar.initialsContainer[
      props.isGroup ? "groupFontWeight" : "fontWeight"
    ]};
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
