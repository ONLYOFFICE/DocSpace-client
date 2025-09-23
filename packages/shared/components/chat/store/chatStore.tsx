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
import { makeAutoObservable } from "mobx";

import { Nullable } from "../../../types";
import { TChat } from "../../../api/ai/types";
import { getChat, getChats, deleteChat, renameChat } from "../../../api/ai";

import { toastr } from "../../toast";

import { TChatStoreProps } from "../Chat.types";

export default class ChatStore {
  currentChat: Nullable<TChat> = null;

  chats: TChat[] = [];

  totalChats: number = 0;

  roomId: TChatStoreProps["roomId"];

  isLoading: boolean = false;

  isRequestRunning: boolean = false;

  constructor(roomId: TChatStoreProps["roomId"]) {
    this.roomId = roomId;

    makeAutoObservable(this);
  }

  setTotalChats = (value: number) => {
    this.totalChats = value;
  };

  setChats = (value: TChat[]) => {
    this.chats = value;
  };

  setCurrentChat = (chat: TChat | null) => {
    const currentSearch = new URLSearchParams(window.location.search);

    if (currentSearch.get("chat") !== chat?.id) {
      if (chat) {
        currentSearch.set("chat", chat.id);
      } else {
        currentSearch.delete("chat");
      }
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${currentSearch.toString()}`,
      );
    }

    this.currentChat = chat;
  };

  setIsRequestRunning = (value: boolean) => {
    this.isRequestRunning = value;
  };

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  fetchChat = async (id: string) => {
    try {
      const chat = await getChat(id);

      this.setCurrentChat(chat);

      if (!this.chats.some((c) => c.id === chat.id)) {
        this.chats = [chat, ...this.chats];
      }
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    }
  };

  fetchChats = async () => {
    if (this.isRequestRunning) return;

    this.setIsLoading(true);
    this.setIsRequestRunning(true);

    try {
      const { items, total } = await getChats(this.roomId);

      this.setChats(items);
      this.setTotalChats(total);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      this.setIsRequestRunning(false);
      this.setIsLoading(false);
    }
  };

  addChats = (chats: TChat[]) => {
    this.chats.push(...chats);
  };

  fetchNextChats = async (startIndex: number) => {
    if (this.isRequestRunning) return;

    this.setIsRequestRunning(true);
    this.setIsLoading(true);

    try {
      const { items, total } = await getChats(this.roomId, startIndex);

      this.addChats(items);
      this.setTotalChats(total);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      this.setIsRequestRunning(false);
      this.setIsLoading(false);
    }
  };

  renameChat = async (id: string, title: string) => {
    try {
      await renameChat(id, title);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    }

    this.chats = this.chats.map((c) => (c.id === id ? { ...c, title } : c));
  };

  deleteChat = async (id: string) => {
    try {
      await deleteChat(id);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    }

    this.chats = this.chats.filter((chat) => chat.id !== id);

    this.setTotalChats(this.totalChats - 1);
  };

  get hasNextChats() {
    return this.totalChats > this.chats.length;
  }
}

export const ChatStoreContext = React.createContext<ChatStore>(undefined!);

export const ChatStoreContextProvider = ({
  roomId,
  children,
}: TChatStoreProps) => {
  const store = React.useMemo(() => new ChatStore(roomId), [roomId]);

  React.useEffect(() => {
    if (roomId) store.fetchChats();
  }, [store, roomId]);

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  );
};

export const useChatStore = () => {
  return React.useContext(ChatStoreContext);
};
