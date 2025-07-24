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
import { TContent, TMessage } from "../../../api/ai/types";
import {
  getChatMessages,
  startNewChat,
  sendMessageToChat,
} from "../../../api/ai";
import { ContentType, EventType, RoleType } from "../../../api/ai/enums";
import { TFile } from "../../../api/files/types";

export default class MessageStore {
  messages: TMessage[] = [];

  startIndex: number = 0;

  totalMessages: number = 0;

  currentChatId: string = "";

  roomId: number | string = "";

  abortController: AbortController = new AbortController();

  isRequestRunning: boolean = false;

  isGetMessageRequestRunning: boolean = false;

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
    if (this.isGetMessageRequestRunning) return;

    this.isGetMessageRequestRunning = true;

    const { items, total } = await getChatMessages(chatId, 0);

    runInAction(() => {
      this.messages = items;
      this.startIndex = total > 100 ? 100 : total;
      this.totalMessages = total;
      this.currentChatId = chatId;
      this.isGetMessageRequestRunning = false;
    });
  };

  fetchNextMessages = async () => {
    if (!this.currentChatId) return;

    if (this.isGetMessageRequestRunning) return;

    if (this.totalMessages <= this.startIndex) return;

    this.isGetMessageRequestRunning = true;

    const { items, total } = await getChatMessages(
      this.currentChatId,
      this.startIndex,
    );

    runInAction(() => {
      this.messages = [...this.messages, ...items];
      this.startIndex += 100;
      this.totalMessages = total;
      this.isGetMessageRequestRunning = false;
    });
  };

  addMessageId = (id: number) => {
    this.messages[0] = { ...this.messages[0], id };
  };

  addUserMessage = (message: string, files: Partial<TFile>[]) => {
    const filesContent: TContent[] = files.map((f) => {
      return {
        type: ContentType.Files,
        extension: f.fileExst!,
        title: f.title!,
        id: f.id!,
      };
    });

    const newMsg: TMessage = {
      role: RoleType.UserMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }, ...filesContent],
    };

    if (this.messages[0]?.role === RoleType.Error) {
      this.messages[0] = newMsg;
    } else {
      this.messages = [newMsg, ...this.messages];
    }

    this.totalMessages += 1;
    this.startIndex += 1;
  };

  addNewAIMessage = (message: string) => {
    const newMsg: TMessage = {
      role: RoleType.AssistantMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.messages = [newMsg, ...this.messages];

    this.totalMessages += 1;
    this.startIndex += 1;
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

  handleMetadata = (jsonData: string) => {
    const { chatId } = JSON.parse(jsonData);

    if (chatId) {
      this.setCurrentChatId(chatId);
    }
  };

  handleToolCall = (jsonData: string) => {
    const { name, arguments: args } = JSON.parse(jsonData);

    const newMsg: TMessage = {
      role: RoleType.AssistantMessage,
      createdOn: new Date().toString(),
      contents: [
        {
          type: ContentType.Tool,
          name,
          arguments: args,
        },
      ],
    };

    this.messages = [newMsg, ...this.messages];

    this.totalMessages += 1;
    this.startIndex += 1;
  };

  handleToolResult = (jsonData: string) => {
    const { result } = JSON.parse(jsonData);

    const newMsg: TMessage = {
      ...this.messages[0],

      contents: [
        {
          type: ContentType.Tool,
          result,
          arguments:
            "arguments" in this.messages[0].contents[0]
              ? this.messages[0].contents[0].arguments!
              : {},
          name:
            "name" in this.messages[0].contents[0]
              ? this.messages[0].contents[0].name
              : "",
        },
      ],
    };

    this.messages[0] = newMsg;
  };

  handleStreamError = (jsonData: string) => {
    const { message } = JSON.parse(jsonData);

    const newMsg: TMessage = {
      role: RoleType.Error,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.messages = [newMsg, ...this.messages];
  };

  startStream = async (stream?: ReadableStream<Uint8Array> | null) => {
    if (!stream) {
      this.isRequestRunning = false;

      return;
    }

    try {
      const textDecoder = new TextDecoder();

      const reader = stream.getReader();

      let prevMsg = "";

      let msg = "";

      const streamHandler = async () => {
        const { done, value } = await reader.read();

        if (done) {
          runInAction(() => {
            this.isRequestRunning = false;
          });
          return;
        }

        const decodedChunk = textDecoder.decode(value);

        try {
          const chunks = decodedChunk.split("\n\n");

          chunks.forEach(async (chunk) => {
            if (!chunk) return;

            const [event, data] = chunk.split("\n");

            const jsonData = data.split("data:")[1]?.trim();

            if (!jsonData) {
              await streamHandler();

              return;
            }

            if (event.includes(EventType.Metadata)) {
              this.handleMetadata(jsonData);

              return;
            }

            if (event.includes(EventType.NewToken)) {
              const { text } = JSON.parse(jsonData);

              msg += text;

              if (msg) {
                if (prevMsg) {
                  this.continueAIMessage(msg);
                } else {
                  this.addNewAIMessage(msg);
                }
                prevMsg = msg;
              }
            }

            if (event.includes(EventType.ToolCall)) {
              msg = "";
              prevMsg = "";
              this.handleToolCall(jsonData);

              return;
            }

            if (event.includes(EventType.ToolResult)) {
              msg = "";
              prevMsg = "";
              this.handleToolResult(jsonData);

              return;
            }

            if (event.includes(EventType.Error)) {
              this.handleStreamError(jsonData);
            }
          });

          await streamHandler();
        } catch (e) {
          runInAction(() => {
            this.isRequestRunning = false;
          });
          console.log(e);
        }
      };

      await streamHandler();
    } catch (e) {
      runInAction(() => {
        this.isRequestRunning = false;
      });
      console.log(e);
    }
  };

  startChat = async (message: string, files: Partial<TFile>[]) => {
    this.addUserMessage(message, files);

    this.isRequestRunning = true;

    this.abortController.abort("Start new chat");

    this.abortController = new AbortController();

    const stream = await startNewChat(
      this.roomId,
      message,
      files.map((f) => f.id!.toString()),
      this.abortController,
    );

    await this.startStream(stream);
  };

  sendMessage = async (message: string, files: Partial<TFile>[]) => {
    this.addUserMessage(message, files);

    this.isRequestRunning = true;

    this.abortController.abort("Start new message");

    this.abortController = new AbortController();

    const stream = await sendMessageToChat(
      this.currentChatId,
      message,
      files.map((f) => f.id!.toString()),
      this.abortController,
    );

    await this.startStream(stream);
  };

  stopMessage = () => {
    if (this.isRequestRunning) {
      try {
        this.abortController.abort("Stop message");
      } catch (e) {
        console.log(e);
      }
    }
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
