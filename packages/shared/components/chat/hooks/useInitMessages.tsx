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

import React from "react";
import { useLocation } from "react-router";

import { getChatMessages } from "../../../api/ai";
import type { TMessage } from "../../../api/ai/types";

const cacheChatId = new Map<string, string>();

const useInitMessages = (roomId: string | number) => {
  const [messages, setMessages] = React.useState<TMessage[]>([]);
  const [chatId, setChatId] = React.useState("");
  const [total, setTotal] = React.useState(0);
  const location = useLocation();

  React.useEffect(() => {
    if (!roomId) cacheChatId.delete("chat");
  }, [roomId]);

  React.useEffect(() => {
    const onCacheChat = (e: Event) => {
      const chatId = (e as CustomEvent<{ chatId: string }>).detail.chatId;

      if (chatId) {
        cacheChatId.set("chat", chatId);
      } else {
        cacheChatId.delete("chat");
        setMessages([]);
        setTotal(0);
        setChatId("");
      }
    };

    window.addEventListener("select-chat", onCacheChat);

    return () => {
      window.removeEventListener("select-chat", onCacheChat);
    };
  }, []);

  const initMessages = React.useCallback(async () => {
    try {
      const currChatId =
        new URLSearchParams(location.search).get("chat") ??
        cacheChatId.get("chat");

      if (!currChatId) {
        setMessages([]);
        setTotal(0);
        setChatId("");
        return;
      }

      cacheChatId.set("chat", currChatId);

      const { items, total } = await getChatMessages(currChatId, 0);

      const reversedItems = items.reverse();

      setMessages(reversedItems);
      setTotal(total > 100 ? 100 : total);
      setChatId(currChatId);
    } catch (error) {
      console.error(error);
      const currentSearch = new URLSearchParams(window.location.search);
      currentSearch.delete("chat");
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${currentSearch.toString()}`,
      );
    }
  }, [location.search]);

  return {
    messages,
    chatId,
    total,
    initMessages,
  };
};

export default useInitMessages;
