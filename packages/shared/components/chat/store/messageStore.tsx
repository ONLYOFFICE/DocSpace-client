import React from "react";
import { makeAutoObservable } from "mobx";

import FlowsApi from "../../../api/flows/flows.api";

import { getCookie } from "../../../utils";

import { ChatMessageType, PropertiesType } from "../types/chat";

export default class MessageStore {
  flowId: string;

  messages: ChatMessageType[] = [];

  isLoading: boolean = true;

  isRequestRunning: boolean = false;

  constructor(flowId: string) {
    this.flowId = flowId;
    makeAutoObservable(this);

    this.fetchMessages();
  }

  fetchMessages = async () => {
    if (this.isRequestRunning) return;
    this.isRequestRunning = true;

    const messages = await FlowsApi.getMessages(this.flowId);

    const messagesFromMessagesStore: ChatMessageType[] = messages
      .filter((message) => message.flow_id === this.flowId)
      .map((message) => {
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
        return {
          isSend: message.sender === "User",
          message: message.text,
          sender_name: message.sender_name,
          files,
          id: message.id,
          timestamp: message.timestamp,
          session: message.session_id,
          edit: message.edit,
          background_color: message.background_color || "",
          text_color: message.text_color || "",
          content_blocks: message.content_blocks || [],
          category: message.category || "",
          properties: (message.properties || {}) as PropertiesType,
        };
      });

    const finalChatHistory = [...messagesFromMessagesStore].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    console.log("finalChatHistory");
    this.messages = finalChatHistory;

    this.isLoading = false;
    this.isRequestRunning = false;
  };
}

export const MessageStoreContext = React.createContext<MessageStore>(
  undefined!,
);

export const MessageStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const flowId = getCookie("docspace_ai_chat");

  const store = React.useMemo(() => new MessageStore(flowId || ""), [flowId]);

  React.useEffect(() => {
    store.fetchMessages();
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
