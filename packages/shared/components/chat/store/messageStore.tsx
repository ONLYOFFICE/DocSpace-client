import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import FlowsApi from "../../../api/flows/flows.api";

import { TSelectorItem } from "../../selector";

import { ChatMessageType, PropertiesType } from "../types/chat";
import {
  extractFilesFromMessage,
  removeFolderFromMessage,
  getSessionId,
  getChatDate,
} from "../utils";

export default class MessageStore {
  flowId = "";

  aiSelectedFolder: string | number = "";

  aiUserId = "";

  messages: ChatMessageType[] = [];

  sessions: Map<string, ChatMessageType[]> = new Map();

  sortedSessions: Array<[string, Date]> = [];

  currentSession = "";

  isInit = false;

  isRequestRunning = false;

  isSelectSessionOpen = false;

  abortController: AbortController | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setFlowId = (flowId: string) => {
    this.flowId = flowId;
  };

  setAiUserId = (aiUserId: string) => {
    this.aiUserId = aiUserId;
  };

  setAiSelectedFolder = (aiSelectedFolder: string | number) => {
    this.aiSelectedFolder = aiSelectedFolder;

    this.currentSession = getSessionId(aiSelectedFolder, this.aiUserId);
  };

  setIsSelectSessionOpen = (value: boolean) => {
    this.isSelectSessionOpen = value;
  };

  fetchMessages = async () => {
    if (this.isRequestRunning) return;

    this.isRequestRunning = true;

    const messages = await FlowsApi.getMessages(
      this.flowId,
      this.aiSelectedFolder.toString(),
    );

    const sessions = new Map<string, ChatMessageType[]>();

    messages.forEach((message) => {
      const { cleanedMessage, fileIds } = extractFilesFromMessage(message.text);

      const msgWithoutFolder = removeFolderFromMessage(cleanedMessage);

      const isSend = message.sender === "User";

      const chatMessage: ChatMessageType = {
        isSend,
        message: isSend ? msgWithoutFolder : message.text,
        sender_name: message.sender_name,
        id: message.id,
        timestamp: message.timestamp,
        session: message.session_id,
        edit: message.edit,
        content_blocks: message.content_blocks || [],
        category: message.category || "",
        properties: (message.properties || {}) as PropertiesType,
        fileIds,
      };

      if (!chatMessage.session) {
        return;
      }

      if (!sessions.has(chatMessage.session)) {
        sessions.set(chatMessage.session, []);
      }

      sessions.get(chatMessage.session)?.push(chatMessage);
    });

    const newSessions = new Map<string, ChatMessageType[]>();

    const timestampSessions = new Map<string, Date>();

    Array.from(sessions.entries()).forEach(([sessionId, sessionMessages]) => {
      const sortedByTime = [...sessionMessages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const finalSessionHistory: ChatMessageType[] = [];

      const userMessages: ChatMessageType[] = [];
      const aiMessages: ChatMessageType[] = [];

      sortedByTime.forEach((msg) => {
        if (msg.isSend) {
          userMessages.push(msg);
        } else {
          aiMessages.push(msg);
        }
      });

      for (
        let i = 0;
        i < Math.max(userMessages.length, aiMessages.length);
        i += 1
      ) {
        if (i < userMessages.length) {
          finalSessionHistory.push(userMessages[i]);
        }

        if (i < aiMessages.length) {
          finalSessionHistory.push(aiMessages[i]);
        }
      }

      newSessions.set(sessionId, finalSessionHistory);
      timestampSessions.set(
        sessionId,
        new Date(finalSessionHistory[finalSessionHistory.length - 1].timestamp),
      );
    });

    const sortedTimestampSessions = Array.from(timestampSessions.entries())
      .sort((a, b) => {
        return new Date(a[1]).getTime() - new Date(b[1]).getTime();
      })
      .reverse();

    runInAction(() => {
      this.sessions = newSessions;
      this.sortedSessions = sortedTimestampSessions;
      this.isInit = true;
      this.isRequestRunning = false;
    });
  };

  sendMessage = async (message: string, files: TSelectorItem[]) => {
    if (this.isRequestRunning) return;
    this.isRequestRunning = true;

    try {
      const textDecoder = new TextDecoder();

      const filesStr = files.length
        ? `\n@${files.map((f) => f.id).join(",@")}`
        : "";

      const folderStr = `\n@folder-${this.aiSelectedFolder}`;

      this.abortController = new AbortController();

      if (!this.messages.length) {
        const startMsg = extractFilesFromMessage(
          removeFolderFromMessage(message.substring(0, 25)),
        );

        this.currentSession = `${this.currentSession}_${startMsg.cleanedMessage}`;
      }

      const eventsResponse = await FlowsApi.sendMessage(
        {
          inputs: {
            input_value: `${message}${filesStr}${folderStr}`,
            session: this.currentSession,
          },
          files: [],
        },
        this.abortController!,
      );

      const reader = eventsResponse.getReader();

      const stream = async () => {
        if (this.abortController?.signal.aborted)
          throw this.abortController.signal.reason;

        const { done, value } = await reader.read();

        if (done) {
          return;
        }

        const decodedChunk = textDecoder.decode(value);

        const allChunks = decodedChunk.split("\n\n").filter(Boolean);

        try {
          allChunks.forEach(async (c) => {
            try {
              if (
                !c.includes('"event": "add_message"') &&
                !c.includes('"event": "token"') &&
                !c.includes('"event": "end"')
              )
                return;

              const chunk = JSON.parse(c);

              if (chunk.event === "add_message") {
                const data = chunk.data;

                const { cleanedMessage, fileIds } = extractFilesFromMessage(
                  removeFolderFromMessage(data.text),
                );

                runInAction(() => {
                  if (
                    this.messages.length &&
                    this.messages[this.messages.length - 1].id === data.id
                  ) {
                    this.messages[this.messages.length - 1] = {
                      ...this.messages[this.messages.length - 1],
                      message: cleanedMessage,
                      fileIds,
                      content_blocks: data.content_blocks,
                    };

                    return;
                  }

                  this.messages = [
                    ...this.messages,
                    {
                      ...data,
                      message: cleanedMessage,
                      fileIds,
                      isSend:
                        !this.messages[0] ||
                        data.sender === this.messages[0].sender_name,
                    },
                  ];
                });
              }

              if (chunk.event === "token") {
                runInAction(() => {
                  this.messages[this.messages.length - 1].message +=
                    chunk.data.chunk;
                });
              }

              if (chunk.event === "end") {
                const userMsg = this.messages[this.messages.length - 2];
                const msg = this.messages[this.messages.length - 1];

                runInAction(() => {
                  this.isRequestRunning = false;

                  if (this.sessions.get(this.currentSession)) {
                    this.sessions.get(this.currentSession)!.push(userMsg, msg);
                  } else {
                    this.sessions.set(this.currentSession, [userMsg, msg]);
                    this.sortedSessions = [
                      [this.currentSession, new Date(msg.timestamp)],
                      ...this.sortedSessions,
                    ];
                  }
                });
              }
            } catch (e: unknown) {
              console.log(e);
            }
          });
          if (this.isRequestRunning) await stream();
        } catch (e: unknown) {
          if (
            (e as Error).name === "AbortError" ||
            (e as Error).message.includes("aborted")
          ) {
            console.log("Request was canceled");
            this.isRequestRunning = false;
            this.abortController = null;
          }
        }
      };

      await stream();
    } catch (e) {
      if (
        e instanceof Error &&
        (e.name === "AbortError" ||
          e.message.includes("aborted") ||
          e.message.includes("abort"))
      ) {
        console.log("Request was canceled at outer level");
        this.isRequestRunning = false;
        this.abortController = null;
        return;
      }
      console.log("Unexpected error in sendMessage:", e);
      this.isRequestRunning = false;
    }
  };

  cancelBuild = () => {
    try {
      if (this.abortController) {
        this.abortController.abort();
        this.isRequestRunning = false;
      }
    } catch (e) {
      console.log(e);
    }
  };

  selectSession = (session: string) => {
    if (!this.sessions.has(session)) return;

    this.currentSession = session;
    this.messages = this.sessions.get(session) || [];

    console.log(this.messages);
  };

  startNewSessions = () => {
    this.currentSession = getSessionId(this.aiSelectedFolder, this.aiUserId);
    this.messages = [];
  };

  get isEmptyMessages() {
    return this.messages.length === 0;
  }

  get preparedMessages() {
    const messages: {
      title: string;
      value: string;
      isActive?: boolean;
      isDate?: boolean;
    }[] = [];

    let prevDate: string = "";

    this.sortedSessions.forEach(([value, date]) => {
      const currentDate = getChatDate(date);
      if (prevDate !== currentDate) {
        prevDate = currentDate;

        if (prevDate === "today") {
          messages.push({
            title: "",
            value: prevDate,
            isActive: false,
            isDate: true,
          });
        } else if (prevDate === "yesterday") {
          messages.push({
            title: "",
            value: prevDate,
            isActive: false,
            isDate: true,
          });
        } else if (prevDate) {
          messages.push({
            title: prevDate,
            value: prevDate,
            isActive: false,
            isDate: true,
          });
        }
      }

      const splitedValue = value.split("_");

      messages.push({
        title: splitedValue[1],
        value,
        isActive: value === this.currentSession,
      });
    });

    return messages;
  }
}

export const MessageStoreContext = React.createContext<MessageStore>(
  undefined!,
);

export const MessageStoreContextProvider = ({
  children,
  aiChatID,
  aiSelectedFolder,
  aiUserId,
}: {
  children: React.ReactNode;
  aiChatID: string;
  aiSelectedFolder: string | number;
  aiUserId: string;
}) => {
  const store = React.useMemo(() => new MessageStore(), []);

  React.useEffect(() => {
    store.setFlowId(aiChatID);
    store.setAiUserId(aiUserId);
    store.setAiSelectedFolder(aiSelectedFolder);

    store.fetchMessages();
  }, [aiChatID, store, aiSelectedFolder, aiUserId]);

  return (
    <MessageStoreContext.Provider value={store}>
      {children}
    </MessageStoreContext.Provider>
  );
};

export const useMessageStore = () => {
  return React.useContext(MessageStoreContext);
};
