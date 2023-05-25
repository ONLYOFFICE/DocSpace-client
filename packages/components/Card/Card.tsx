import React, { useRef, useCallback } from "react";
import Checkbox from "../checkbox";
import ContextMenu from "../context-menu";
import ContextMenuButton from "../context-menu-button";
import Loaders from "@docspace/common/components/Loaders";
import {
  CardAvatar,
  CardAvatarWrapper,
  CardContainer,
  CardContent,
  CardContentTitle,
  CardDivider,
  CardHeader,
  CardHeaderLoader,
  CardUserName,
} from "./Card.styled";

import CardProps from "./Card.props";

import OformIcon from "PUBLIC_DIR/images/icons/32/oform.svg";
import DefaultUserAvatar from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

function Card({
  isForMe,
  userName,
  fileName,
  isSelected,
  avatarUrl = "",
  isLoading = false,
  getOptions,
  onSelected,
}: CardProps) {
  const contextMenuRef = useRef<ContextMenu>(null);

  const onClickHandler = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.show(event);
  }, []);

  const onHideContextMenu = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.hide(event);
  }, []);

  if (isLoading)
    return (
      <CardContainer isForMe={isForMe}>
        <CardHeaderLoader>
          <Loaders.Circle width="24px" height="24px" x="12px" y="12px" />
          <Loaders.Rectangle width="172px" height="22px" />
          <Loaders.Rectangle width="16px" height="16px" />
        </CardHeaderLoader>
        <CardDivider />
        <CardContent>
          <Loaders.Rectangle width="32px" height="32px" />
          <Loaders.Rectangle width="190px" height="22px" />
        </CardContent>
      </CardContainer>
    );

  return (
    <CardContainer isSelected={isSelected} isForMe={isForMe}>
      <CardHeader>
        <CardAvatarWrapper>
          <Checkbox
            className="card__checkbox"
            isChecked={isSelected}
            onChange={onSelected}
          />
          <CardAvatar src={avatarUrl || DefaultUserAvatar} alt={userName} />
        </CardAvatarWrapper>
        <CardUserName>{userName}</CardUserName>
        <ContextMenu
          ref={contextMenuRef}
          getContextModel={getOptions}
          withBackdrop={true}
        />
        <ContextMenuButton
          className="card__context-menu"
          displayType="toggle"
          getData={getOptions}
          onClick={onClickHandler}
          onClose={onHideContextMenu}
        />
      </CardHeader>
      <CardDivider />
      <CardContent>
        <OformIcon className="card__oform-icon" />
        <CardContentTitle>
          {userName} - {fileName}
        </CardContentTitle>
      </CardContent>
    </CardContainer>
  );
}

export default Card;
