import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import FlowsApi from "../../../api/flows/flows.api";

import { TSelectorItem } from "../../selector";

import { ChatMessageType, PropertiesType } from "../types/chat";
import { FlowType } from "../types/flow";
import { extractFilesFromMessage, removeFolderFromMessage } from "../utils";

export default class MessageStore {
  flowId: string = "";

  messages: ChatMessageType[] = [];

  aiSelectedFolder: string | number = "";

  sessions: Map<string, ChatMessageType[]> = new Map();

  currentSessions: string = "";

  isInit: boolean = false;

  isRequestRunning: boolean = false;

  abortController: AbortController | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setFlowId = (flowId: string) => {
    this.flowId = flowId;
  };

  setAiSelectedFolder = (aiSelectedFolder: string | number) => {
    this.aiSelectedFolder = aiSelectedFolder;

    this.currentSessions = `folder-${aiSelectedFolder}-${new Date().getTime()}`;
  };

  fetchMessages = async () => {
    if (this.isRequestRunning) return;

    this.isRequestRunning = true;

    const messages = await FlowsApi.getMessages(this.flowId);

    const sessions = new Map<string, ChatMessageType[]>();

    messages.forEach((message) => {
      let files = message.files;
      // Handle the "[]" case, empty string, or already parsed array
      if (Array.isArray(files)) {
        // files is already an array, no need to parse
      } else if (files === "[]" || files === "") {
        files = [];
      } else if (typeof files === "string") {
        try {
          files = JSON.parse(files);
        } catch (error) {
          console.error("Error parsing files:", error);
          files = [];
        }
      }

      const msgWithoutFolder = removeFolderFromMessage(message.text);

      const { cleanedMessage, fileIds } =
        extractFilesFromMessage(msgWithoutFolder);

      const isSend = message.sender === "User";

      const chatMessage: ChatMessageType = {
        isSend,
        message: isSend ? cleanedMessage : message.text,
        sender_name: message.sender_name,
        files,
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

    // Process each session individually
    Array.from(sessions.entries()).forEach(([sessionId, sessionMessages]) => {
      // First sort by timestamp to get chronological order
      const sortedByTime = [...sessionMessages].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // Then implement alternating pattern (user → AI → user → AI) for this session
      const finalSessionHistory: ChatMessageType[] = [];
      const userMessages = sortedByTime.filter((msg) => msg.isSend);
      const aiMessages = sortedByTime.filter((msg) => !msg.isSend);

      // Create pairs of user message followed by AI message
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

      // Update the session with sorted and paired messages
      newSessions.set(sessionId, finalSessionHistory);
    });

    runInAction(() => {
      this.sessions = newSessions;
      this.isInit = true;
      this.isRequestRunning = false;
    });
  };

  sendMessage = async (
    message: string,
    flow: FlowType,
    files: TSelectorItem[],
  ) => {
    if (this.isRequestRunning) return;
    this.isRequestRunning = true;

    try {
      const textDecoder = new TextDecoder();

      const filesStr = files ? `\n@${files.map((f) => f.id).join(",@")}` : "";

      const folderStr = `\n@folder-${this.aiSelectedFolder}`;

      this.abortController = new AbortController();

      const eventsResponse = await FlowsApi.sendMessage(
        {
          inputs: {
            input_value: `${message}${filesStr}${folderStr}`,
            session: this.currentSessions,
          },
          data: flow.data,
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

        try {
          if (decodedChunk.indexOf('"event": "add_message"') !== -1) {
            const parsedChunk = JSON.parse(decodedChunk);

            const data = parsedChunk.data;

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

          if (decodedChunk.indexOf('"event": "token"') !== -1) {
            const parsedChunks = decodedChunk
              .split("\n\n")
              .filter(Boolean)
              .map((chunk) => JSON.parse(chunk))
              .map((c) => c.data.chunk)
              .join("");

            runInAction(() => {
              this.messages[this.messages.length - 1].message += parsedChunks;
            });
          }

          if (decodedChunk.indexOf('"event": "end"') !== -1) {
            const userMsg = this.messages[this.messages.length - 2];
            const msg = this.messages[this.messages.length - 1];

            runInAction(() => {
              this.isRequestRunning = false;

              if (this.sessions.get(this.currentSessions)) {
                this.sessions.get(this.currentSessions)!.push(userMsg, msg);
              } else {
                this.sessions.set(this.currentSessions, [userMsg, msg]);
              }
            });
          } else {
            await stream();
          }
        } catch (e: unknown) {
          if (
            (e as Error).name === "AbortError" ||
            (e as Error).message.includes("aborted")
          ) {
            console.log("Request was canceled");
            this.isRequestRunning = false;
            this.abortController = null;
            return; // Stop processing
          }

          console.log("++++++++ERROR++++++++");
          console.log("Parsing failed");
          console.log("-------------------");
          console.log(decodedChunk);
          this.isRequestRunning = false;
        }
      };

      await stream();
    } catch (e) {
      // Check if this is an abort error
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

    this.currentSessions = session;
    this.messages = this.sessions.get(session) || [];
  };

  startNewSessions = () => {
    this.currentSessions = `folder-${this.aiSelectedFolder}-${new Date().getTime()}`;
    this.messages = [];
  };

  get isEmptyMessages() {
    return this.messages.length === 0;
  }
}

export const MessageStoreContext = React.createContext<MessageStore>(
  undefined!,
);

export const MessageStoreContextProvider = ({
  children,
  aiChatID,
  aiSelectedFolder,
}: {
  children: React.ReactNode;
  aiChatID: string;
  aiSelectedFolder: string | number;
}) => {
  const store = React.useMemo(() => new MessageStore(), []);

  React.useEffect(() => {
    store.setFlowId(aiChatID);
    store.setAiSelectedFolder(aiSelectedFolder);

    store.fetchMessages();
  }, [aiChatID, store, aiSelectedFolder]);

  return (
    <MessageStoreContext.Provider value={store}>
      {children}
    </MessageStoreContext.Provider>
  );
};

export const useMessageStore = () => {
  return React.useContext(MessageStoreContext);
};
