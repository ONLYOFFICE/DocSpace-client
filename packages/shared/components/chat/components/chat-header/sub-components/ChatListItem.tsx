/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import classNames from "classnames";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import type { TChat } from "../../../../../api/ai/types";
import { ContextMenu, ContextMenuRefType } from "../../../../context-menu";
import { isDesktop } from "../../../../../utils";
import { DropDownItem } from "../../../../drop-down-item";
import { Text } from "../../../../text";
import { IconButton } from "../../../../icon-button";
import styles from "../ChatHeader.module.scss";

type ChatListItemProps = {
  chat: TChat;
  onClick: (id: TChat["id"]) => void;
  contextModel: ContextMenuModel[];
  hoveredChatId?: TChat["id"];
  setHoveredChatId: (id: TChat["id"]) => void;
  activeChatId?: TChat["id"];
};

export const ChatListItem = ({
  chat,
  onClick,
  hoveredChatId,
  setHoveredChatId,
  contextModel,
  activeChatId,
}: ChatListItemProps) => {
  const contextMenuRef = React.useRef<ContextMenuRefType>(null);

  const onShowContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    contextMenuRef.current?.show(e);
  };

  const desktop = isDesktop();

  return (
    <DropDownItem
      key={chat.id}
      onClick={(e) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const iconButtonWrapper = target.closest(
          `.${styles.iconButtonWrapper}`,
        );

        if (iconButtonWrapper) {
          return;
        }

        onClick(chat.id);
      }}
      className={classNames("drop-down-item")}
      isActive={activeChatId === chat.id}
      data-id={chat.id}
    >
      <div
        className={styles.dropdowItemWrapper}
        onMouseEnter={() => setHoveredChatId(chat.id)}
      >
        <Text className={styles.chatListItemTitle} truncate title={chat.title}>
          {chat.title}
        </Text>
        {hoveredChatId === chat.id || !desktop ? (
          <div className={styles.iconButtonWrapper} onClick={onShowContextMenu}>
            <IconButton
              iconName={VerticalDotsReactSvgUrl}
              size={16}
              isClickable
              isFill
              onClick={() => {}}
            />
            <ContextMenu ref={contextMenuRef} model={contextModel} />
          </div>
        ) : null}
      </div>
    </DropDownItem>
  );
};
