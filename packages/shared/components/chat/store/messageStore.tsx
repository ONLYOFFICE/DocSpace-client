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
import { TMessage } from "../../../api/ai/types";
import {
  getChatMessages,
  startNewChat,
  sendMessageToChat,
} from "../../../api/ai";
import { ContentType, MessageType } from "../../../api/ai/enums";

export default class MessageStore {
  messages: TMessage[] = [];

  startIndex: number = 0;

  totalMessages: number = 0;

  currentChatId: string = "";

  roomId: number | string = "";

  abortController: AbortController = new AbortController();

  isRequestRunning: boolean = false;

  constructor(roomId: number | string) {
    makeAutoObservable(this);

    this.roomId = roomId;
  }

  setCurrentChatId = (chatId: string) => {
    this.currentChatId = chatId;
  };

  startNewChat = async () => {
    this.currentChatId = "";
    this.messages = [];
    this.startIndex = 0;
    this.totalMessages = 0;
  };

  fetchMessages = async (chatId: string) => {
    const { items, total } = await getChatMessages(chatId, 0);

    runInAction(() => {
      this.messages = items;
      this.startIndex = 100;
      this.totalMessages = total;
      this.currentChatId = chatId;
    });
  };

  fetchNextMessages = async () => {
    if (!this.currentChatId) return;

    const { items, total } = await getChatMessages(
      this.currentChatId,
      this.startIndex,
    );

    runInAction(() => {
      this.messages = [...this.messages, ...items];
      this.startIndex += 100;
      this.totalMessages = total;
    });
  };

  addUserMessage = (message: string) => {
    const newMsg: TMessage = {
      messageType: MessageType.UserMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.messages = [newMsg, ...this.messages];
  };

  addNewAIMessage = (message: string) => {
    const newMsg: TMessage = {
      messageType: MessageType.AssistantMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.messages = [newMsg, ...this.messages];
  };

  continueAIMessage = (message: string) => {
    const msg: TMessage = {
      ...this.messages[0],
      contents: [
        {
          type: ContentType.Text,
          text: message,
        },
      ],
    };

    this.messages[0] = msg;
  };

  handleMetadata = (data: string) => {
    const jsonData = data.split("data:")[1].trim();
    const { chatId } = JSON.parse(jsonData);

    if (chatId) {
      this.setCurrentChatId(chatId);
    }
  };

  handleNewToken = (data: string, msg: string) => {
    let newMsg = msg;

    const jsonData = data.split("data:")[1].trim();
    const { text } = JSON.parse(jsonData);

    if (text) {
      if (newMsg) {
        newMsg += text;
        this.continueAIMessage(newMsg);
      } else {
        newMsg += text;
        this.addNewAIMessage(newMsg);
      }
    }

    return newMsg;
  };

  startChat = async (message: string) => {
    this.addUserMessage(message);

    this.isRequestRunning = true;

    this.abortController.abort();

    this.abortController = new AbortController();

    const stream = await startNewChat(
      this.roomId,
      message,
      this.abortController,
    );

    if (!stream) return;

    try {
      const textDecoder = new TextDecoder();

      const reader = stream.getReader();

      let msg = "";

      const streamHandler = async () => {
        const { done, value } = await reader.read();

        if (done) {
          reader.cancel();
          this.isRequestRunning = false;
          return;
        }

        const decodedChunk = textDecoder.decode(value);

        try {
          const chunks = decodedChunk.split("\n\n");

          chunks.forEach(async (chunk) => {
            const [event, data] = chunk.split("\n");

            if (event.includes("metadata")) {
              this.handleMetadata(data);

              await streamHandler();

              return;
            }

            if (event.includes("new_token")) {
              msg = this.handleNewToken(data, msg);

              await streamHandler();
            }
          });
          await streamHandler();
        } catch (e) {
          this.isRequestRunning = false;
          console.log(e);
        }
      };

      await streamHandler();
    } catch (e) {
      this.isRequestRunning = false;
      console.log(e);
    }
  };

  sendMessage = async (message: string) => {
    this.addUserMessage(message);

    this.isRequestRunning = true;

    this.abortController.abort();

    this.abortController = new AbortController();

    const stream = await sendMessageToChat(
      this.currentChatId,
      message,
      this.abortController,
    );

    if (!stream) return;
    try {
      const textDecoder = new TextDecoder();

      const reader = stream.getReader();

      let msg = "";

      const streamHandler = async () => {
        const { done, value } = await reader.read();

        if (done) {
          reader.cancel();
          this.isRequestRunning = false;
          return;
        }

        const decodedChunk = textDecoder.decode(value);

        try {
          const chunks = decodedChunk.split("\n\n");

          chunks.forEach(async (chunk) => {
            const [event, data] = chunk.split("\n");

            if (event.includes("new_token")) {
              msg = this.handleNewToken(data, msg);

              await streamHandler();
            }
          });

          await streamHandler();
        } catch (e) {
          this.isRequestRunning = false;
          console.log(e);
        }
      };

      await streamHandler();
    } catch (e) {
      this.isRequestRunning = false;

      console.log(e);
    }
  };

  stopMessage = () => {
    if (this.isRequestRunning) this.abortController.abort();
  };
}

export const MessageStoreContext = React.createContext<MessageStore>(
  undefined!,
);

export const MessageStoreContextProvider = ({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId: number | string;
}) => {
  const store = React.useMemo(() => new MessageStore(roomId), [roomId]);

  return (
    <MessageStoreContext.Provider value={store}>
      {children}
    </MessageStoreContext.Provider>
  );
};

export const useMessageStore = () => {
  return React.useContext(MessageStoreContext);
};
