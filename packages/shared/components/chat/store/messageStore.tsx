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

import {
  TContent,
  TMessage,
  type TToolCallContent,
} from "../../../api/ai/types";
import {
  getChatMessages,
  startNewChat,
  sendMessageToChat,
} from "../../../api/ai";
import { ContentType, EventType, RoleType } from "../../../api/ai/enums";
import { TFile } from "../../../api/files/types";

import { toastr } from "../../toast";

import { TMessageStoreProps } from "../Chat.types";

export default class MessageStore {
  messages: TMessage[] = [];

  startIndex: number = 0;

  totalMessages: number = 0;

  currentChatId: string = "";

  roomId: number | string = "";

  abortController: AbortController = new AbortController();

  isRequestRunning: boolean = false;

  isStreamRunning: boolean = false;

  isGetMessageRequestRunning: boolean = false;

  constructor(roomId: number | string) {
    makeAutoObservable(this);

    this.roomId = roomId;
  }

  setCurrentChatId = (chatId: string) => {
    this.currentChatId = chatId;
  };

  setMessages = (messages: TMessage[]) => {
    this.messages = messages;
  };

  setStartIndex = (startIndex: number) => {
    this.startIndex = startIndex;
  };

  setTotalMessages = (totalMessages: number) => {
    this.totalMessages = totalMessages;
  };

  setIsGetMessageRequestRunning = (isGetMessageRequestRunning: boolean) => {
    this.isGetMessageRequestRunning = isGetMessageRequestRunning;
  };

  setIsRequestRunning = (isRequestRunning: boolean) => {
    this.isRequestRunning = isRequestRunning;
  };

  setIsStreamRunning = (isStreamRunning: boolean) => {
    this.isStreamRunning = isStreamRunning;
  };

  startNewChat = async () => {
    this.setCurrentChatId("");
    this.setMessages([]);
    this.setStartIndex(0);
    this.setTotalMessages(0);
  };

  fetchMessages = async (chatId: string) => {
    if (this.isGetMessageRequestRunning) return;

    this.setIsGetMessageRequestRunning(true);

    try {
      const { items, total } = await getChatMessages(chatId, 0);

      this.setMessages(items);
      this.setStartIndex(total > 100 ? 100 : total);
      this.setTotalMessages(total);
      this.setCurrentChatId(chatId);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      this.setIsGetMessageRequestRunning(false);
    }
  };

  fetchNextMessages = async () => {
    if (!this.currentChatId) return;

    if (this.isGetMessageRequestRunning) return;

    if (this.totalMessages <= this.startIndex) return;

    this.setIsGetMessageRequestRunning(true);

    try {
      const { items, total } = await getChatMessages(
        this.currentChatId,
        this.startIndex,
      );

      this.setMessages([...this.messages, ...items]);
      this.setStartIndex(this.startIndex + 100);
      this.setTotalMessages(total);
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      this.setIsGetMessageRequestRunning(false);
    }
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
      this.setMessages([newMsg, ...this.messages]);
    }

    this.setTotalMessages(this.totalMessages + 1);
    this.setStartIndex(this.startIndex + 1);
  };

  addNewAIMessage = (message: string) => {
    const newMsg: TMessage = {
      role: RoleType.AssistantMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.setMessages([newMsg, ...this.messages]);

    this.setTotalMessages(this.totalMessages + 1);
    this.setStartIndex(this.startIndex + 1);
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
    const { name, arguments: args, callId, ...rest } = JSON.parse(jsonData);

    const newMsg: TMessage = {
      role: RoleType.AssistantMessage,
      createdOn: new Date().toString(),
      contents: [
        {
          type: ContentType.Tool,
          name,
          arguments: args,
          callId,
          ...rest,
        },
      ],
    };

    this.setMessages([newMsg, ...this.messages]);
    this.setTotalMessages(this.totalMessages + 1);
    this.setStartIndex(this.startIndex + 1);
  };

  handleToolResult = (jsonData: string) => {
    const { result } = JSON.parse(jsonData);

    const newMsg: TMessage = {
      ...this.messages[0],

      contents: [
        {
          ...this.messages[0].contents[0],
          managed: false,
          result,
        } as TToolCallContent,
      ],
    };

    this.messages[0] = newMsg;
  };

  handleStreamError = (jsonData: string) => {
    let message = "";
    try {
      message = JSON.parse(jsonData).message;
    } catch {
      message = jsonData;
    }

    const newMsg: TMessage = {
      role: RoleType.Error,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }],
    };

    this.setMessages([newMsg, ...this.messages]);
  };

  startStream = async (stream?: ReadableStream<Uint8Array> | null) => {
    if (!stream) {
      this.setIsRequestRunning(false);
      this.setIsStreamRunning(false);

      return;
    }

    try {
      const textDecoder = new TextDecoder();

      const reader = stream.getReader();

      let prevMsg = "";
      let msg = "";

      let buffer = "";
      let chunkIdx = -1;

      const streamHandler = async () => {
        const { done, value } = await reader.read();

        if (done) {
          this.setIsRequestRunning(false);
          this.setIsStreamRunning(false);

          try {
            reader.cancel();
          } catch (e) {
            console.log(e);
            // Ignore cancel errors
          }
          return;
        }

        const decodedChunk = textDecoder.decode(value);

        buffer += decodedChunk;

        try {
          const jsonData = JSON.parse(decodedChunk);

          if (jsonData.error) {
            this.handleStreamError(JSON.stringify(jsonData.error));

            reader.cancel();

            return;
          }
        } catch {
          // ignore
        }

        try {
          const chunks = buffer.split("\n\n");

          chunks.pop();

          chunks.forEach(async (chunk, idx) => {
            if (!chunk || idx <= chunkIdx) return;

            chunkIdx = idx;

            const [event, data] = chunk.split("\n");

            const jsonData = data?.split("data:")[1]?.trim();

            if (!jsonData) {
              return;
            }

            if (event.includes(EventType.MessageStart)) {
              this.setIsStreamRunning(true);

              this.handleMetadata(jsonData);

              return;
            }

            if (event.includes(EventType.NewToken)) {
              try {
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
              } catch {
                // ignore
              }
            }

            if (event.includes(EventType.ToolCall)) {
              try {
                msg = "";
                prevMsg = "";

                this.handleToolCall(jsonData);
              } catch {
                // ignore
              }

              return;
            }

            if (event.includes(EventType.ToolResult)) {
              msg = "";
              prevMsg = "";

              try {
                this.handleToolResult(jsonData);
              } catch {
                // ignore
              }

              return;
            }

            if (event.includes(EventType.Error)) {
              this.handleStreamError(jsonData);
            }

            if (event.includes(EventType.MessageStop)) {
              try {
                reader.cancel();
              } catch (e) {
                console.log(e);
              }
            }
          });

          await streamHandler();
        } catch (e) {
          console.log(e);
        } finally {
          this.setIsRequestRunning(false);
          this.setIsStreamRunning(false);
        }
      };

      await streamHandler();
    } catch (e) {
      console.log(e);
      toastr.error(e as string);
    } finally {
      this.setIsRequestRunning(false);
      this.setIsStreamRunning(false);
    }
  };

  startChat = async (message: string, files: Partial<TFile>[]) => {
    try {
      this.addUserMessage(message, files);

      this.setIsRequestRunning(true);

      this.abortController.abort("Start new chat");

      this.abortController = new AbortController();

      const stream = await startNewChat(
        this.roomId,
        message,
        files.map((f) => f.id!.toString()),
        this.abortController,
      );

      await this.startStream(stream);
    } catch (e) {
      this.handleStreamError(JSON.stringify(e));
    }
  };

  sendMessage = async (message: string, files: Partial<TFile>[]) => {
    this.addUserMessage(message, files);

    this.setIsRequestRunning(true);

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
}: TMessageStoreProps) => {
  const store = React.useMemo(() => new MessageStore(roomId), [roomId]);

  React.useEffect(() => {
    const chatId = new URLSearchParams(window.location.search).get("chat");
    if (chatId) store.fetchMessages(chatId);
  }, [store]);

  return (
    <MessageStoreContext.Provider value={store}>
      {children}
    </MessageStoreContext.Provider>
  );
};

export const useMessageStore = () => {
  return React.useContext(MessageStoreContext);
};
