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

import React, { useEffect, useEffectEvent, useRef } from "react";
import { observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import socket, { SocketCommands, SocketEvents } from "../../../../utils/socket";
import { useIsMobile } from "../../../../hooks/useIsMobile";

import { Loader, LoaderTypes } from "../../../loader";

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
  const {
    messages,
    isStreamRunning,
    isRequestRunning,
    fetchNextMessages,
    addMessageId,
  } = useMessageStore();
  const { currentChat } = useChatStore();

  const { t } = useTranslation(["Common"]);

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const prevBodyHeight = useRef(0);
  const prevScrollTopRef = useRef(0);
  const disableAutoScrollRef = useRef(false);

  const isMobile = useIsMobile();

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
    disableAutoScrollRef.current = false;
  }, [currentChat]);

  const onScroll = useEffectEvent((e: Event) => {
    const scrollEl = e.currentTarget as HTMLDivElement;
    if (!scrollEl) return;

    const currentHeight = scrollEl.scrollTop + scrollEl.clientHeight;

    const chatBodyOffsetHeight = chatBodyRef.current?.offsetHeight || 0;

    if (prevScrollTopRef.current > scrollEl.scrollTop) {
      disableAutoScrollRef.current = true;
    }

    if (
      currentHeight === chatBodyOffsetHeight ||
      Math.abs(currentHeight - chatBodyOffsetHeight) < 5 ||
      chatBodyOffsetHeight < currentHeight
    ) {
      disableAutoScrollRef.current = false;
    }

    if (scrollEl.scrollTop < 500 + scrollEl.clientHeight) {
      fetchNextMessages();
    }

    prevScrollTopRef.current = scrollEl.scrollTop;
  });

  useEffect(() => {
    const scroll = isMobile
      ? document.querySelector("#customScrollBar .scroll-wrapper > .scroller")
      : document.querySelector("#sectionScroll .scroll-wrapper > .scroller");

    if (!scroll) return;

    scrollbarRef.current = scroll as HTMLDivElement;

    scroll.addEventListener("scroll", onScroll);

    return () => {
      scroll.removeEventListener("scroll", onScroll);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isEmpty || disableAutoScrollRef.current) return;

    const scrollEl = scrollbarRef.current;

    requestAnimationFrame(() => {
      if (scrollEl) {
        scrollEl.scrollTo(0, scrollEl.scrollHeight);
      }
    });
  });

  useEffect(() => {
    if (!chatBodyRef.current) return;

    const bodyHeight = chatBodyRef.current?.clientHeight;
    const diff = bodyHeight - prevBodyHeight.current;
    if (diff !== 0) {
      prevBodyHeight.current = bodyHeight;
    }

    if (prevScrollTopRef.current === 0 && diff > 0) {
      scrollbarRef.current?.scrollTo(0, diff);
    }
  }, [messages.length]);

  return (
    <div
      className={classNames(styles.chatMessageBody, {
        [styles.empty]: isEmpty,
      })}
    >
      {isEmpty ? (
        <EmptyScreen isLoading={isLoading} />
      ) : (
        <div
          className={classNames(styles.chatMessageContainer)}
          ref={chatBodyRef}
        >
          {!isStreamRunning && isRequestRunning ? (
            <div className={styles.chatLoader}>
              <Loader type={LoaderTypes.track} />
              {t("Common:Analyzing")}
            </div>
          ) : null}
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
      )}
    </div>
  );
};

export default observer(ChatMessageBody);
