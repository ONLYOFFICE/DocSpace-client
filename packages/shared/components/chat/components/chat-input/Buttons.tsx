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
import { observer } from "mobx-react";

import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";
import AttachmentReactSvgUrl from "PUBLIC_DIR/images/attachment.react.svg?url";

import { IconButton } from "../../../icon-button";

import { useMessageStore } from "../../store/messageStore";

import { ButtonsProps } from "../../Chat.types";

import styles from "./ChatInput.module.scss";
import ToolsSettings from "./ToolsSettings";

const Buttons = ({
  inputWidth,
  isFilesSelectorVisible,
  toggleFilesSelector,
  sendMessageAction,
  value,
  selectedModel,
  toolsSettings,
  isAdmin,
  aiReady,
}: ButtonsProps) => {
  const { isRequestRunning, stopMessage } = useMessageStore();

  const isSendButtonDisabled = !isRequestRunning
    ? !value || !selectedModel
    : false;

  const sendIconProps = !isRequestRunning
    ? {
        onClick: sendMessageAction,
        isDisabled: isSendButtonDisabled,
        iconNode: null,
      }
    : {
        onClick: stopMessage,
        isDisabled: false,
        iconNode: <div className={styles.square} />,
      };

  const onAttachmentToggleClick = () => {
    if (!aiReady) return;

    toggleFilesSelector();
  };

  return (
    <div
      className={styles.chatInputButtons}
      style={{ width: `${inputWidth}px` }}
    >
      <div className={styles.chatInputButtonsTools}>
        <div
          className={classNames(styles.chatInputButton, {
            [styles.activeChatInputButton]: isFilesSelectorVisible,
            [styles.disabled]: !aiReady,
          })}
          onClick={onAttachmentToggleClick}
        >
          <IconButton
            iconName={AttachmentReactSvgUrl}
            size={16}
            isFill={false}
            isDisabled={!aiReady}
            className={classNames({ [styles.disabled]: !aiReady })}
          />
        </div>
        <ToolsSettings {...toolsSettings} isAdmin={isAdmin} aiReady={aiReady} />
      </div>
      <IconButton
        iconName={SendReactSvgUrl}
        size={16}
        isClickable
        className={classNames(styles.chatInputButtonsSend, {
          [styles.disabled]: isSendButtonDisabled,
        })}
        {...sendIconProps}
      />
    </div>
  );
};

export default observer(Buttons);
