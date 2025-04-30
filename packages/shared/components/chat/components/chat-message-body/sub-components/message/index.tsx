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
          <ButtonsBlock message={message.message as string} />
        ) : null}
      </div>
    </div>
  );
};

export default Message;
