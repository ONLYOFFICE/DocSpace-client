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
import { makeAutoObservable, runInAction } from "mobx";

import { Nullable } from "../../../types";
import { TChat } from "../../../api/ai/types";
import { getChat, getChats, deleteChat, renameChat } from "../../../api/ai";

import { TChatStoreProps } from "../types";

export default class ChatStore {
  currentChat: Nullable<TChat> = null;

  chats: TChat[] = [];

  totalChats: number = 0;

  startIndex: number = 0;

  roomId: TChatStoreProps["roomId"];

  isLoading: boolean = false;

  isRequestRunning: boolean = false;

  constructor(roomId: TChatStoreProps["roomId"]) {
    this.roomId = roomId;

    makeAutoObservable(this);
  }

  setCurrentChat(chat: TChat) {
    runInAction(() => {
      this.currentChat = chat;
    });
  }

  fetchChat = async (id: string) => {
    const chat = await getChat(id);

    this.setCurrentChat(chat);
  };

  fetchChats = async () => {
    if (this.isRequestRunning) return;
    runInAction(() => {
      this.isLoading = true;
      this.isRequestRunning = true;
    });

    const { items, total } = await getChats(this.roomId);

    runInAction(() => {
      this.chats = items;
      this.totalChats = total;
      this.startIndex = 100;
      this.isRequestRunning = false;
      this.isLoading = false;
    });
  };

  fetchNextChats = async () => {
    if (this.isRequestRunning) return;
    runInAction(() => {
      this.isRequestRunning = true;
    });
    const { items, total } = await getChats(this.roomId, this.startIndex);

    runInAction(() => {
      this.chats = items;
      this.totalChats = total;
      this.startIndex += 100;
      this.isRequestRunning = false;
    });
  };

  renameChat = async (id: string, title: string) => {
    await renameChat(id, title);

    runInAction(() => {
      this.chats = this.chats.map((chat) =>
        chat.id === id ? { ...chat, title } : chat,
      );
    });
  };

  deleteChat = async (id: string) => {
    await deleteChat(id);

    runInAction(() => {
      this.chats = this.chats.filter((chat) => chat.id !== id);
      this.startIndex -= 1;
      this.totalChats -= 1;
    });
  };
}

export const ChatStoreContext = React.createContext<ChatStore>(undefined!);

export const ChatStoreContextProvider = ({
  roomId,
  children,
}: TChatStoreProps) => {
  const store = React.useMemo(() => new ChatStore(roomId), [roomId]);

  React.useEffect(() => {
    store.fetchChats();
  }, [store]);

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = () => {
  return React.useContext(ChatStoreContext);
};
