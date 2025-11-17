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

import { observer } from "mobx-react";

import { MessageStoreContextProvider } from "./store/messageStore";
import { ChatStoreContextProvider, useChatStore } from "./store/chatStore";

import type { ChatProps } from "./Chat.types";

import ChatContainer from "./components/chat-container";
import ChatHeader from "./components/chat-header";
import ChatMessageBody from "./components/chat-message-body";
import { ChatNoAccessScreen } from "./components/chat-no-access-screen";
import ChatFooter from "./components/chat-footer";

import { CHAT_SUPPORTED_FORMATS } from "./Chat.constants";

export { CHAT_SUPPORTED_FORMATS };

const Chat = observer(
  ({
    isLoadingChat,
    selectedModel,
    getIcon,
    roomId,
    userAvatar,
    attachmentFile,
    clearAttachmentFile,
    toolsSettings,
    isAdmin = false,
    standalone = false,
    aiReady = false,
    getResultStorageId,
  }: ChatProps & { isLoadingChat: boolean }) => {
    const { currentChat } = useChatStore();

    const showEmptyScreen = !isLoadingChat && !aiReady && !currentChat;

    return (
      <>
        <ChatHeader
          selectedModel={selectedModel}
          isLoading={isLoadingChat}
          getIcon={getIcon}
          getResultStorageId={getResultStorageId}
          roomId={roomId}
          aiReady={aiReady}
        />
        {showEmptyScreen ? (
          <ChatNoAccessScreen
            aiReady={aiReady}
            standalone={standalone}
            isPortalAdmin={isAdmin}
          />
        ) : (
          <>
            <ChatMessageBody
              userAvatar={userAvatar}
              isLoading={isLoadingChat}
              getIcon={getIcon}
              getResultStorageId={getResultStorageId}
            />
            <ChatFooter
              attachmentFile={attachmentFile}
              clearAttachmentFile={clearAttachmentFile}
              isLoading={isLoadingChat}
              getIcon={getIcon}
              selectedModel={selectedModel}
              toolsSettings={toolsSettings}
              isPortalAdmin={isAdmin}
              aiReady={aiReady}
              standalone={standalone}
            />
          </>
        )}
      </>
    );
  },
);

const ChatWrapper = (props: ChatProps) => {
  const {
    roomId,
    isLoading,

    initChats,

    messagesSettings,

    isAdmin = false,
    standalone = false,
    aiReady = false,
  } = props;

  const isLoadingChat = isLoading || !roomId;
  const hasChats = initChats?.chats?.length > 0;

  if (!isLoadingChat && !aiReady && !hasChats) {
    return (
      <ChatNoAccessScreen
        aiReady={aiReady}
        standalone={standalone}
        isPortalAdmin={isAdmin}
      />
    );
  }

  return (
    <ChatStoreContextProvider roomId={roomId} {...initChats}>
      <MessageStoreContextProvider roomId={roomId} {...messagesSettings}>
        <ChatContainer>
          <Chat {...props} isLoadingChat={isLoadingChat} />
        </ChatContainer>
      </MessageStoreContextProvider>
    </ChatStoreContextProvider>
  );
};

export default ChatWrapper;
