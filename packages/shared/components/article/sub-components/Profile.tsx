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

import React, { useState, useRef } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import DefaultUserPhotoPngUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import { DeviceType } from "../../../enums";

import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { IconButton } from "../../icon-button";
import { ContextMenu, TContextMenuRef } from "../../context-menu";

import {
  StyledArticleProfile,
  StyledUserName,
  StyledProfileWrapper,
} from "../Article.styled";
import { ArticleProfileProps } from "../Article.types";

const ArticleProfile = (props: ArticleProfileProps) => {
  const {
    user,
    showText,

    getActions,
    onProfileClick,
    currentDeviceType,
  } = props;
  const { t } = useTranslation(["Common"]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const iconRef = useRef(null);
  const buttonMenuRef = useRef<TContextMenuRef | null>(null);
  const menuRef = useRef<TContextMenuRef | null>(null);

  const isTabletView = currentDeviceType === DeviceType.tablet;
  const avatarSize = isTabletView ? AvatarSize.min : AvatarSize.base;

  const toggle = (
    e: React.MouseEvent,
    open: boolean,
    currentRef: React.MutableRefObject<TContextMenuRef | null>,
  ) => {
    if (!currentRef.current) return;
    if (open) currentRef.current.show(e);
    else currentRef.current.hide(e);
    setIsOpen(open);
  };

  const onClick = (e: React.MouseEvent) => toggle(e, !isOpen, buttonMenuRef);

  const onAvatarClick = (e: React.MouseEvent) => {
    if (isTabletView && !showText) {
      toggle(e, !isOpen, menuRef);
    } else {
      onProfileClick?.({ originalEvent: e });
    }
  };

  const onNameClick = (e: React.MouseEvent) => {
    onProfileClick?.({ originalEvent: e });
  };

  const onNameMouseDownClick = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    onNameClick(e);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getActions?.(t);

  const firstName = user?.firstName
    .split(" ")
    .filter((name) => name.trim().length > 0)
    .join(" ");
  const lastName = user?.lastName
    .split(" ")
    .filter((name) => name.trim().length > 0)
    .join(" ");

  const displayName = user?.displayName;

  const [firstTerm, secondTerm] =
    displayName &&
    displayName.indexOf(user.firstName) > displayName.indexOf(user.lastName)
      ? [lastName, firstName]
      : [firstName, lastName];

  const { interfaceDirection } = useTheme();
  const isRtl = interfaceDirection === "rtl";
  const userAvatar = user?.hasAvatar ? user.avatar : DefaultUserPhotoPngUrl;

  if (currentDeviceType === DeviceType.mobile) return null;

  return (
    <StyledProfileWrapper showText={showText}>
      <StyledArticleProfile>
        <div ref={ref}>
          <Avatar
            className="profile-avatar"
            id="user-avatar"
            size={avatarSize}
            role={AvatarRole.user}
            source={userAvatar}
            userName={user?.displayName || ""}
            onClick={onAvatarClick}
          />
          <ContextMenu
            model={model || []}
            containerRef={ref}
            ref={menuRef}
            onHide={onHide}
            scaled={false}
            leftOffset={Number(!isRtl && -50)}
            rightOffset={Number(isRtl && 54)}
          />
        </div>
        {(!isTabletView || showText) && (
          <>
            <StyledUserName
              onMouseDown={onNameMouseDownClick}
              onClick={onNameClick}
            >
              <Text fontWeight={600} noSelect truncate dir="auto">
                {firstTerm}
                &nbsp;
              </Text>
              <Text fontWeight={600} noSelect truncate dir="auto">
                {secondTerm}
                &nbsp;
              </Text>
            </StyledUserName>
            <div ref={iconRef} className="option-button">
              <IconButton
                className="option-button-icon"
                onClick={onClick}
                iconName={VerticalDotsReactSvgUrl}
                size={32}
                isFill
              />
              <ContextMenu
                model={model || []}
                containerRef={iconRef}
                ref={buttonMenuRef}
                onHide={onHide}
                scaled={false}
                leftOffset={10}
                // topOffset={15}
              />
            </div>
          </>
        )}
      </StyledArticleProfile>
    </StyledProfileWrapper>
  );
};

export default ArticleProfile;
