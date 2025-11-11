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

import { makeAutoObservable } from "mobx";
import React from "react";
import {
  getChatMessages,
  sendMessageToChat,
  startNewChat,
} from "../../../api/ai";
import { ContentType, EventType, RoleType } from "../../../api/ai/enums";
import type {
  TContent,
  TMessage,
  TToolCallContent,
} from "../../../api/ai/types";
import type { TFile } from "../../../api/files/types";

import { toastr } from "../../toast";

import type { TMessageStoreProps } from "../Chat.types";

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

  knowledgeSearchToolName: string = "";

  webSearchToolName: string = "";

  webCrawlingToolName: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setRoomId = (roomId: number | string) => {
    this.roomId = roomId;
  };

  setCurrentChatId = (chatId: string) => {
    this.currentChatId = chatId;
  };

  setMessages = (messages: TMessage[]) => {
    this.messages = messages;
  };

  setKnowledgeSearchToolName = (knowledgeSearchToolName: string) => {
    this.knowledgeSearchToolName = knowledgeSearchToolName;
  };

  setWebSearchToolName = (webSearchToolName: string) => {
    this.webSearchToolName = webSearchToolName;
  };

  setWebCrawlingToolName = (webCrawlingToolName: string) => {
    this.webCrawlingToolName = webCrawlingToolName;
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
      const reversedItems = items.reverse();

      this.setMessages(reversedItems);
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
      const reversedItems = items.reverse();

      this.setMessages([...reversedItems, ...this.messages]);
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
    const lastIndex = this.messages.length - 1;

    this.messages[lastIndex] = {
      ...this.messages[lastIndex],
      id,
    };
  };

  addUserMessage = (message: string, files: Partial<TFile>[]) => {
    const filesContent: TContent[] = files.map((f) => {
      return {
        type: ContentType.Files,
        extension: f.fileExst ? f.fileExst : "",
        title: f.title ? f.title : "",
        id: f.id ? Number(f.id) : 0,
      };
    });

    const newMsg: TMessage = {
      role: RoleType.UserMessage,
      createdOn: new Date().toString(),
      contents: [{ type: ContentType.Text, text: message }, ...filesContent],
    };

    const lastIndex = this.messages.length - 1;

    if (this.messages[lastIndex]?.role === RoleType.Error) {
      this.messages[lastIndex] = newMsg;
    } else {
      this.setMessages([...this.messages, newMsg]);
    }

    this.setTotalMessages(this.totalMessages + 1);
    this.setStartIndex(this.startIndex + 1);
  };

  addNewAIMessage = (message: string) => {
    const lastIndex = this.messages.length - 1;

    if (this.messages[lastIndex].role === RoleType.AssistantMessage) {
      const newMsg: TMessage = {
        ...this.messages[lastIndex],
        contents: [
          ...this.messages[lastIndex].contents,
          { type: ContentType.Text, text: message },
        ],
      };

      this.setMessages([...this.messages.slice(0, lastIndex), newMsg]);
      return;
    } else {
      const newMsg: TMessage = {
        role: RoleType.AssistantMessage,
        createdOn: new Date().toString(),
        contents: [{ type: ContentType.Text, text: message }],
      };

      this.setMessages([...this.messages, newMsg]);

      this.setTotalMessages(this.totalMessages + 1);
      this.setStartIndex(this.startIndex + 1);
    }
  };

  continueAIMessage = (message: string) => {
    const lastIndex = this.messages.length - 1;

    const msg: TMessage = {
      ...this.messages[lastIndex],
      contents: [
        ...this.messages[lastIndex].contents.slice(0, -1),
        {
          type: ContentType.Text,
          text: message,
        },
      ],
    };

    this.setMessages([...this.messages.slice(0, lastIndex), msg]);
  };

  handleMetadata = (jsonData: string) => {
    const { chatId } = JSON.parse(jsonData);

    if (chatId) {
      this.setCurrentChatId(chatId);
    }
  };

  handleToolCall = (jsonData: string) => {
    const { name, arguments: args, callId, ...rest } = JSON.parse(jsonData);
    const lastIndex = this.messages.length - 1;

    const shouldCreateNewMessage =
      this.messages[lastIndex].role !== RoleType.AssistantMessage;

    const content = {
      type: ContentType.Tool,
      name,
      arguments: args,
      callId,
      ...rest,
    };

    if (shouldCreateNewMessage) {
      const newMsg: TMessage = {
        role: RoleType.AssistantMessage,
        createdOn: new Date().toString(),
        contents: [content],
      };

      this.setMessages([...this.messages, newMsg]);
      this.setTotalMessages(this.totalMessages + 1);
      this.setStartIndex(this.startIndex + 1);
    } else {
      const newMsg: TMessage = {
        ...this.messages[lastIndex],
        contents: [...this.messages[lastIndex].contents, content],
      };

      this.setMessages([...this.messages.slice(0, lastIndex), newMsg]);
    }
  };

  handleToolResult = (jsonData: string) => {
    const { result, callId } = JSON.parse(jsonData);
    const lastIndex = this.messages.length - 1;

    const lstMsgContents = this.messages[lastIndex].contents;

    const idx = lstMsgContents.findIndex(
      (c) => (c as TToolCallContent).callId === callId,
    );

    const content = {
      ...lstMsgContents[idx],
      managed: false,
      result,
    } as TToolCallContent;

    const newMsg: TMessage = {
      ...this.messages[lastIndex],

      contents: [
        ...lstMsgContents.slice(0, idx),
        content,
        ...lstMsgContents.slice(idx + 1),
      ],
    };

    this.setMessages([...this.messages.slice(0, lastIndex), newMsg]);
  };

  handleStreamError = (jsonData: string) => {
    this.setIsStreamRunning(true);
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

    this.setMessages([...this.messages, newMsg]);
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
        files.map((f) => (f.id ? f.id.toString() : "")),
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
      files.map((f) => (f.id ? f.id.toString() : "")),
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

  findPreviousUserMessage = (fromIndex: number) => {
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (this.messages[i].role === RoleType.UserMessage)
        return this.messages[i];
    }
    return undefined;
  };
}

export const MessageStoreContext = React.createContext<MessageStore>(
  {} as MessageStore,
);

export const MessageStoreContextProvider = ({
  children,
  roomId,
}: TMessageStoreProps) => {
  const store = React.useMemo(() => new MessageStore(), []);

  React.useEffect(() => {
    store.setRoomId(roomId);
  }, [store, roomId]);

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
