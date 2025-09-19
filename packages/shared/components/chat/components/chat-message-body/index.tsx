// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import classNames from "classnames";

import socket, { SocketCommands, SocketEvents } from "../../../../utils/socket";
import { isMobile } from "../../../../utils";

import { Scrollbar } from "../../../scrollbar";
import type { Scrollbar as CustomScrollbar } from "../../../scrollbar/custom-scrollbar";

import { useMessageStore } from "../../store/messageStore";
import { useChatStore } from "../../store/chatStore";

import { MessageBodyProps } from "../../Chat.types";

import EmptyScreen from "./sub-components/EmptyScreen";
import Message from "./sub-components/message";

import styles from "./ChatMessageBody.module.scss";

const ChatMessageBody = ({
  userAvatar,
  getIcon,
  isLoading,
}: MessageBodyProps) => {
  const { messages, fetchNextMessages, addMessageId } = useMessageStore();
  const { currentChat } = useChatStore();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [height, setHeight] = React.useState(0);

  const scrollbarRef = useRef<CustomScrollbar>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const prevBodyHeight = useRef(0);
  const currentScroll = useRef(0);

  const isEmpty = messages.length === 0 || isLoading;

  useEffect(() => {
    if (!currentChat?.id) return;

    socket?.emit(SocketCommands.Subscribe, {
      roomParts: `CHAT-${currentChat?.id}`,
    });

    return () => {
      socket?.emit(SocketCommands.Unsubscribe, {
        roomParts: `CHAT-${currentChat?.id}`,
      });
    };
  }, [currentChat?.id]);

  useEffect(() => {
    socket?.on(SocketEvents.ChatMessageId, (data) => {
      addMessageId(data.messageId);
    });
  }, [addMessageId]);

  useEffect(() => {
    setIsScrolled(false);
  }, [currentChat]);

  useEffect(() => {
    if (isEmpty) return;

    if (isScrolled) return;

    requestAnimationFrame(() => {
      if (scrollbarRef.current?.scrollToBottom) {
        scrollbarRef.current.scrollToBottom();
      }
    });
  });

  const calculateHeight = React.useCallback(() => {
    if (!isMobile()) return;

    const sectionHeight =
      document.getElementsByClassName("section-wrapper")[0]?.clientHeight || 0;
    const sectionHeaderHeight =
      document.getElementsByClassName("section-header")[0]?.clientHeight || 0;
    const sectionTabsHeight =
      document.getElementsByClassName("section-tabs")[0]?.clientHeight || 0;
    const chatHeaderHeight =
      document.getElementsByClassName("chat-header")[0]?.clientHeight || 0;
    const chatInputHeight =
      document.getElementsByClassName("chat-input")[0]?.clientHeight || 0;

    // 30 - it is chat margin and description
    // 24 - it is margin section
    const newHeight =
      sectionHeight -
      sectionHeaderHeight -
      sectionTabsHeight -
      chatHeaderHeight -
      chatInputHeight -
      30 -
      24;

    setHeight(newHeight);
  }, []);

  useEffect(() => {
    calculateHeight();
  }, [calculateHeight]);

  useEffect(() => {
    const chatInputElement = document.getElementsByClassName("chat-input")[0];

    if (!chatInputElement) return;

    // Create ResizeObserver to watch for chat input height changes
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        calculateHeight();
      });
    });

    // Start observing the chat input element
    resizeObserver.observe(chatInputElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateHeight]);

  useEffect(() => {
    if (!chatBodyRef.current) return;

    const bodyHeight = chatBodyRef.current?.clientHeight;
    const diff = bodyHeight - prevBodyHeight.current;
    if (diff !== 0) {
      prevBodyHeight.current = bodyHeight;
    }

    if (currentScroll.current === 0 && diff > 0) {
      scrollbarRef.current?.scrollTo(0, diff);
    }
  }, [messages.length]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentHeight =
      e.currentTarget.scrollTop + e.currentTarget.clientHeight;

    if (
      currentHeight === chatBodyRef.current?.offsetHeight ||
      (chatBodyRef.current &&
        Math.abs(currentHeight - chatBodyRef.current.offsetHeight) < 5) ||
      (chatBodyRef.current && chatBodyRef.current.offsetHeight < currentHeight)
    ) {
      setIsScrolled(false);
    } else {
      setIsScrolled(true);
    }

    if (e.currentTarget.scrollTop < 500 + e.currentTarget.clientHeight) {
      fetchNextMessages();
    }

    currentScroll.current = e.currentTarget.scrollTop;
  };

  return (
    <div
      className={classNames(styles.chatMessageBody, {
        [styles.empty]: isEmpty,
      })}
      style={isMobile() ? { height: `${height}px` } : undefined}
    >
      {isEmpty ? (
        <EmptyScreen isLoading={isLoading} />
      ) : (
        <Scrollbar
          ref={scrollbarRef}
          className="chat-scroll-bar"
          onScroll={onScroll}
        >
          <div
            className={classNames(styles.chatMessageContainer)}
            ref={chatBodyRef}
          >
            {messages.map((message, index) => {
              return (
                <Message
                  key={`${currentChat?.id}-${message.createdOn}-${index * 2}`}
                  message={message}
                  idx={index}
                  userAvatar={userAvatar}
                  isLast={index === 0}
                  getIcon={getIcon}
                />
              );
            })}
          </div>
        </Scrollbar>
      )}
    </div>
  );
};

export default observer(ChatMessageBody);
