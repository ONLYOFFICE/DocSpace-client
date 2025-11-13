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

import { TContent, TMessage, type TToolCallContent } from "../../api/ai/types";
import { TGetIcon } from "../../selectors/utils/types";
import { TFile } from "../../api/files/types";

import useToolsSettings from "./hooks/useToolsSettings";
import useInitChats from "./hooks/useInitChats";

export type TChatStoreProps = {
  roomId: string | number;
  children: React.ReactNode;
} & ReturnType<typeof useInitChats>;

export type TMessageStoreProps = {
  roomId: string | number;
  children: React.ReactNode;
};

export type SelectModelProps = {
  selectedModel: string;
  isLoading?: boolean;
};

export type SelectChatProps = {
  isLoadingProp?: boolean;
  roomId: string | number;
  getIcon: TGetIcon;
};

export type RenameChatProps = {
  chatId: string;
  prevTitle: string;
  onRenameToggle: VoidFunction;
};

export type ChatHeaderProps = SelectModelProps &
  Omit<SelectChatProps, "isLoadingProp"> & {
    aiReady: boolean;
  };

export type MessageProps = {
  message: TMessage;
  idx: number;
  userAvatar: string;
  isLast: boolean;
  getIcon: TGetIcon;
};

export type MessageButtonsProps = {
  text: string;
  chatName?: string;
  messageId?: number;
  isLast: boolean;
  getIcon: TGetIcon;
  messageIndex: number;
};

export type MessageCodeBlockProps = {
  language?: string;
  content: string;
};

export type MessageErrorProps = {
  content: TContent;
};

export type MessageFilesProps = {
  files: TContent[];
  getIcon: TGetIcon;
};

export type MessageMarkdownFieldProps = {
  chatMessage: string;
  propLanguage?: string;
};

export type MessageToolCallProps = {
  content: TToolCallContent;
};

export type MessageEmptyProps = {
  isLoading?: boolean;
};

export type MessageBodyProps = {
  userAvatar: string;
  isLoading?: boolean;

  getIcon: TGetIcon;
};

export type FilesListProps = {
  files: Partial<TFile>[];
  isFixed?: boolean;
  getIcon: TGetIcon;
  onRemove?: (file: Partial<TFile>) => void;
};

export type ButtonsProps = {
  inputWidth: number;
  isFilesSelectorVisible: boolean;

  toggleFilesSelector: VoidFunction;
  sendMessageAction: () => Promise<void>;

  value: string;
  selectedModel: string;

  toolsSettings: ReturnType<typeof useToolsSettings>;
  isAdmin?: boolean;
  aiReady: boolean;
};

export type AttachmentProps = {
  isVisible: boolean;
  toggleAttachment: VoidFunction;
  getIcon: TGetIcon;
  setSelectedFiles: (files: Partial<TFile>[]) => void;

  attachmentFile: Partial<TFile> | null;
  clearAttachmentFile: VoidFunction;
};

export type ChatInputProps = {
  getIcon: AttachmentProps["getIcon"];
  isLoading?: boolean;

  attachmentFile: AttachmentProps["attachmentFile"];
  clearAttachmentFile: AttachmentProps["clearAttachmentFile"];
  selectedModel: string;

  toolsSettings: ReturnType<typeof useToolsSettings>;
  isPortalAdmin: boolean;
  aiReady: boolean;
};

export type ChatInfoBlockProps = {
  standalone: boolean;
  isPortalAdmin: boolean;
};

export type ChatFooterProps = ChatInputProps & ChatInfoBlockProps;

export type ChatContainerProps = {
  children: React.ReactNode;
};

export type ChatProps = {
  roomId: TChatStoreProps["roomId"];
  userAvatar: MessageBodyProps["userAvatar"];
  selectedModel: string;
  getIcon: ChatInputProps["getIcon"];
  isLoading?: boolean;
  aiReady: boolean;

  attachmentFile: ChatInputProps["attachmentFile"];
  clearAttachmentFile: ChatInputProps["clearAttachmentFile"];

  toolsSettings: ChatInputProps["toolsSettings"];
  initChats: ReturnType<typeof useInitChats>;
  isAdmin?: boolean;
  standalone?: boolean;
};
