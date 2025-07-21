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

import { TGetIcon } from "../../../../selectors/utils/types";

import { Scrollbar } from "../../../scrollbar";
import type { Scrollbar as CustomScrollbar } from "../../../scrollbar/custom-scrollbar";

import { useMessageStore } from "../../store/messageStore";
import { useChatStore } from "../../store/chatStore";

import EmptyScreen from "./sub-components/EmptyScreen";
import Message from "./sub-components/message";

import styles from "./ChatMessageBody.module.scss";

const ChatMessageBody = ({
  userAvatar,
  getIcon,
}: {
  userAvatar: string;
  getIcon: TGetIcon;
}) => {
  const { messages, fetchNextMessages } = useMessageStore();
  const { currentChat } = useChatStore();

  const [isScrolled, setIsScrolled] = React.useState(false);

  const scrollbarRef = useRef<CustomScrollbar>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const prevBodyHeight = useRef(0);
  const currentScroll = useRef(0);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    setIsScrolled(false);
  }, [currentChat]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isEmpty) return;

    if (isScrolled) return;

    // Use requestAnimationFrame to ensure the DOM has been updated
    // Method 1: Use the scrollbar instance if available
    requestAnimationFrame(() => {
      if (scrollbarRef.current?.scrollToBottom) {
        scrollbarRef.current.scrollToBottom();
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

    if (currentScroll.current === 0 && diff > 0) {
      scrollbarRef.current?.scrollTo(0, diff);
    }
  }, [messages.length]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (
      e.currentTarget.clientHeight + e.currentTarget.scrollTop ===
      chatBodyRef.current?.offsetHeight
    ) {
      setIsScrolled(false);
    }

    if (e.currentTarget.scrollTop < 500 + e.currentTarget.clientHeight) {
      // setIsScrolled(true);
      fetchNextMessages();
    }

    currentScroll.current = e.currentTarget.scrollTop;
  };

  return (
    <div
      className={classNames(styles.chatMessageBody, {
        [styles.empty]: isEmpty,
      })}
    >
      {messages.length === 0 ? (
        <EmptyScreen />
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
