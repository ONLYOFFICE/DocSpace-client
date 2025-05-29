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
import classNames from "classnames";

import AIIconReactSvgUrl from "PUBLIC_DIR/images/ai.chat.avatar.react.svg?url";

import { TFile } from "../../../../../../api/files/types";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";

import { MessageProps } from "../../../../types";

import FilePreview from "../../../file-preview";

import styles from "../../ChatMessageBody.module.scss";

import Agent from "./agent";
import Markdown from "./Markdown";
import ButtonsBlock from "./ButtonsBlock";

const Message = ({
  message,
  displayFileExtension,
  vectorizedFiles,
  user,
  isFullScreen,
  currentDeviceType,
  getIcon,
}: MessageProps) => {
  const files: TFile[] = message.fileIds?.length
    ? (message.fileIds
        ?.map((id) => {
          const file = vectorizedFiles.find((f) => String(f.id) === String(id));

          if (!file) return false;

          return file;
        })
        .filter(Boolean) as TFile[])
    : [];

  console.log(message);

  return (
    <div
      className={classNames(styles.message, {
        [styles.userMessage]: message.isSend,
        [styles.isFullScreen]: isFullScreen,
      })}
    >
      <Avatar
        size={AvatarSize.min}
        source={!message.isSend ? AIIconReactSvgUrl : user.avatarSmall || ""}
        role={AvatarRole.user}
        noClick
        isNotIcon
        imgClassName={!message.isSend ? styles.aiAvatar : ""}
      />

      <div className={classNames(styles.chatMessageContent)}>
        <div
          className={classNames(
            styles.chatMessagePadding,
            styles.chatMessageBorderRadius,
            {
              [styles.chatMessageUser]: message.isSend,
              [styles.chatMessageAI]: !message.isSend,
              [styles.chatMessageError]: message.category === "error",
            },
          )}
        >
          {message.content_blocks &&
          message.content_blocks.length > 0 &&
          message.content_blocks.some((b) =>
            b.contents.some((bc) => bc.type === "tool_use"),
          ) ? (
            <Agent content={message.content_blocks} />
          ) : null}

          <Markdown chatMessage={message.message as string} />
        </div>

        {message.isSend && files && files.length > 0 ? (
          <FilePreview
            files={files.map((f) => ({
              id: f.id,
              label: f.title.replace(f.fileExst, ""),
              fileExst: f.fileExst,
              fileType: f.fileType,
              parentId: f.folderId,
              rootFolderType: f.rootFolderType,
              security: f.security,
              icon: "",
            }))}
            displayFileExtension={displayFileExtension}
            getIcon={getIcon}
          />
        ) : null}

        {!message.isSend ? (
          <ButtonsBlock
            message={message.message as string}
            getIcon={getIcon}
            currentDeviceType={currentDeviceType}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Message;
