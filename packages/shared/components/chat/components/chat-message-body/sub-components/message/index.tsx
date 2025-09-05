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

import { ContentType, RoleType } from "../../../../../../api/ai/enums";

import { Avatar, AvatarRole, AvatarSize } from "../../../../../avatar";

import { MessageProps } from "../../../../Chat.types";
import { useChatStore } from "../../../../store/chatStore";

import styles from "../../ChatMessageBody.module.scss";

import Markdown from "./Markdown";
import ToolCallMessage from "./ToolCallMessage";
import Error from "./Error";
import Files from "./Files";
import Buttons from "./Buttons";

const Message = ({
  message,
  idx,
  userAvatar,
  isLast,
  getIcon,
}: MessageProps) => {
  const { currentChat } = useChatStore();

  const isUser = message.role === RoleType.UserMessage;
  const isError = message.role === RoleType.Error;

  if (isUser) {
    const files = message.contents.filter((c) => c.type === ContentType.Files);

    return (
      <div
        key={`${currentChat?.id}-${message.createdOn}-${idx * 2}`}
        className={classNames(styles.userMessage)}
      >
        <Avatar
          size={AvatarSize.min}
          source={currentChat?.createdBy.avatarOriginal ?? userAvatar}
          role={AvatarRole.user}
          noClick
          isNotIcon
        />

        <div className={classNames(styles.chatMessageContent)}>
          {files ? <Files files={files} getIcon={getIcon} /> : null}

          {message.contents.map((c) => {
            if (c.type === ContentType.Text)
              return (
                <div
                  key={`${currentChat?.id}-${c.text}-${idx * 2}`}
                  className={classNames(styles.chatMessageUser)}
                >
                  <Markdown chatMessage={c.text} />
                </div>
              );

            return null;
          })}
        </div>
      </div>
    );
  }

  if (isError)
    return (
      <div key={`error-${currentChat?.id}-${message.createdOn}-${idx * 2}`}>
        <Error content={message.contents[0]} />
      </div>
    );

  const fullText = message.contents
    .map((c) => {
      if (c.type === ContentType.Text) return c.text;

      if (c.type === ContentType.Tool)
        return `\n\n${JSON.stringify(c.arguments)}\n${JSON.stringify(c.result)}`;

      return "";
    })
    .join("");

  return (
    <div key={`${currentChat?.id}-${message.createdOn}-${idx * 2}`}>
      {message.contents.map((c) => {
        if (c.type === ContentType.Text)
          return <Markdown key={c.text} chatMessage={c.text} />;

        if (c.type === ContentType.Tool)
          return <ToolCallMessage key={c.name} content={c} />;

        return null;
      })}
      {message.id ? (
        <Buttons
          text={fullText}
          chatName={currentChat?.title}
          isLast={isLast}
          messageId={message.id}
          getIcon={getIcon}
        />
      ) : null}
    </div>
  );
};

export default Message;
