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
    isVirtualKeyboardOpen,
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
      onProfileClick?.();
    }
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
    <StyledProfileWrapper
      showText={showText}
      isVirtualKeyboardOpen={isVirtualKeyboardOpen}
    >
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
            <StyledUserName onClick={onProfileClick}>
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

// export default inject(({ auth, profileActionsStore }) => {
//   const { getActions, getUserRole, onProfileClick } = profileActionsStore;

//   return {
//     onProfileClick,
//     user: auth.userStore.user,
//     getUserRole,
//     getActions,
//   };
// })(observer(ArticleProfile));
