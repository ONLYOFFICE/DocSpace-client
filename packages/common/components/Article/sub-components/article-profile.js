import React, { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";

import {
  StyledArticleProfile,
  StyledUserName,
  StyledProfileWrapper,
} from "../styled-article";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import DefaultUserPhotoPngUrl from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { useTheme } from "styled-components";
import { DeviceType } from "@docspace/shared/enums";
const ArticleProfile = (props) => {
  const {
    user,
    showText,
    getUserRole,
    getActions,
    onProfileClick,
    currentDeviceType,
    isVirtualKeyboardOpen,
  } = props;
  const { t } = useTranslation("Common");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const iconRef = useRef(null);
  const buttonMenuRef = useRef(null);
  const menuRef = useRef(null);

  const isTabletView = currentDeviceType === DeviceType.tablet;
  const avatarSize = isTabletView ? "min" : "base";
  const userRole = getUserRole(user);

  const toggle = (e, isOpen, ref) => {
    isOpen ? ref.current.show(e) : ref.current.hide(e);
    setIsOpen(isOpen);
  };

  const onClick = (e) => toggle(e, !isOpen, buttonMenuRef);

  const onAvatarClick = (e) => {
    if (isTabletView && !showText) {
      toggle(e, !isOpen, menuRef);
    } else {
      onProfileClick();
    }
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getActions(t);

  const firstName = user.firstName
    .split(" ")
    .filter((name) => name.trim().length > 0)
    .join(" ");
  const lastName = user.lastName
    .split(" ")
    .filter((name) => name.trim().length > 0)
    .join(" ");

  const displayName = user.displayName;

  const [firstTerm, secondTerm] =
    displayName.indexOf(user.firstName) > displayName.indexOf(user.lastName)
      ? [lastName, firstName]
      : [firstName, lastName];

  const { interfaceDirection } = useTheme();
  const isRtl = interfaceDirection === "rtl";
  const userAvatar = user.hasAvatar ? user.avatar : DefaultUserPhotoPngUrl;

  if (currentDeviceType === DeviceType.mobile) return <></>;

  return (
    <StyledProfileWrapper
      showText={showText}
      isVirtualKeyboardOpen={isVirtualKeyboardOpen}
    >
      <StyledArticleProfile showText={showText} tablet={isTabletView}>
        <div ref={ref}>
          <Avatar
            className={"profile-avatar"}
            id="user-avatar"
            size={avatarSize}
            role={"user"}
            source={userAvatar}
            userName={user.displayName}
            onClick={onAvatarClick}
          />
          <ContextMenu
            model={model}
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
                model={model}
                containerRef={iconRef}
                ref={buttonMenuRef}
                onHide={onHide}
                scaled={false}
                leftOffset={10}
                topOffset={15}
              />
            </div>
          </>
        )}
      </StyledArticleProfile>
    </StyledProfileWrapper>
  );
};

export default inject(({ auth, profileActionsStore }) => {
  const { getActions, getUserRole, onProfileClick } = profileActionsStore;

  return {
    onProfileClick,
    user: auth.userStore.user,
    getUserRole,
    getActions,
  };
})(observer(ArticleProfile));
