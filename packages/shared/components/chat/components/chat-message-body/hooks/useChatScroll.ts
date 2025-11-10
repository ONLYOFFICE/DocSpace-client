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

import React, { useEffect, useEffectEvent, useRef } from "react";

import { useIsMobile } from "../../../../../hooks/useIsMobile";

import ChatStore from "../../../store/chatStore";
import MessageStore from "../../../store/messageStore";

type Props = {
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
  isEmpty?: boolean;
  fetchNextMessages: VoidFunction;
  currentChat: ChatStore["currentChat"];
  messages: MessageStore["messages"];
};

export const useChatScroll = ({
  chatBodyRef,
  isEmpty,
  fetchNextMessages,
  currentChat,
  messages,
}: Props) => {
  const isMobile = useIsMobile();

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const prevScrollTopRef = useRef(0);
  const disableAutoScrollRef = useRef(false);
  const prevBodyHeight = useRef(0);

  // toggle auto scroll
  // fetch prev messages if user is at the top
  const onScroll = useEffectEvent((e: Event) => {
    const scrollEl = e.currentTarget as HTMLDivElement;
    if (!scrollEl) return;

    const currentHeight = scrollEl.scrollTop + scrollEl.clientHeight;

    const chatBodyOffsetHeight = chatBodyRef.current?.offsetHeight || 0;

    if (prevScrollTopRef.current > scrollEl.scrollTop) {
      disableAutoScrollRef.current = true;
    }

    console.log({ chatBodyOffsetHeight, currentHeight });

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

  // Scroll setter
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

  // enable auto scroll on chat change
  useEffect(() => {
    disableAutoScrollRef.current = false;
  }, [currentChat]);

  // scroll to bottom if anything changes (if autoscroll is not disabled)
  useEffect(() => {
    if (isEmpty || disableAutoScrollRef.current) return;

    const scrollEl = scrollbarRef.current;

    requestAnimationFrame(() => {
      if (disableAutoScrollRef.current) return;
      scrollEl?.scrollTo(0, scrollEl.scrollHeight);
    });
  });

  // scroll to bottom if messages are added
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
};
