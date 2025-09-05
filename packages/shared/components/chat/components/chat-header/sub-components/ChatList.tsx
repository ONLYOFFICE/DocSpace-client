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

import React, { useCallback } from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from "react-window";

import type { TChat } from "../../../../../api/ai/types";
import { useInterfaceDirection } from "../../../../../hooks/useInterfaceDirection";
import { Scrollbar } from "../../../../scrollbar";
import {
  CHAT_LIST_MAX_HEIGHT,
  CHAT_LIST_ROW_HEIGHT,
  CHAT_LIST_WIDTH,
} from "../constants";
import { RectangleSkeleton } from "../../../../../skeletons";
import { ChatListItem } from "./ChatListItem";

type TRowData = {
  chats: TChat[];
  onSelectChat: (id: TChat["id"]) => void;
  contextModel: ContextMenuModel[];
  hoveredChatId?: TChat["id"];
  setHoveredChatId: (id: TChat["id"]) => void;
  activeChatId?: TChat["id"];
};

type RowProps = {
  data: TRowData;
  index: number;
  style: React.CSSProperties;
};

const Row = ({ data, index, style }: RowProps) => {
  const chat = data.chats[index];

  return (
    <div style={style}>
      {chat ? (
        <ChatListItem
          chat={chat}
          onClick={data.onSelectChat}
          hoveredChatId={data.hoveredChatId}
          setHoveredChatId={data.setHoveredChatId}
          contextModel={data.contextModel}
          activeChatId={data.activeChatId}
        />
      ) : (
        <RectangleSkeleton height="32px" borderRadius="3px" />
      )}
    </div>
  );
};

type ChatListProps = {
  chats: TChat[];
  onSelectChat: (id: TChat["id"]) => void;
  contextModel: ContextMenuModel[];
  hoveredChatId: TChat["id"];
  setHoveredChatId: (id: TChat["id"]) => void;
  activeChatId?: TChat["id"];
  loadNextPage: () => void;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  total: number;
};

export const ChatList = ({
  chats,
  onSelectChat,
  contextModel,
  hoveredChatId,
  setHoveredChatId,
  activeChatId,

  loadNextPage,
  hasNextPage,
  isNextPageLoading,
  total,
}: ChatListProps) => {
  const { interfaceDirection } = useInterfaceDirection();

  const itemCount = hasNextPage ? chats.length + 1 : chats.length;

  const isItemLoaded = useCallback(
    (index: number) => {
      return !hasNextPage || index < itemCount - 1;
    },
    [hasNextPage, itemCount],
  );

  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
      itemCount={total}
    >
      {({ onItemsRendered, ref }) => (
        <List
          className="chats-list-scroll"
          ref={ref}
          direction={interfaceDirection}
          height={CHAT_LIST_MAX_HEIGHT}
          width={CHAT_LIST_WIDTH}
          itemCount={itemCount}
          itemSize={CHAT_LIST_ROW_HEIGHT}
          itemData={{
            chats,
            onSelectChat,
            contextModel,
            hoveredChatId,
            setHoveredChatId,
            activeChatId,
          }}
          outerElementType={Scrollbar}
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
};
