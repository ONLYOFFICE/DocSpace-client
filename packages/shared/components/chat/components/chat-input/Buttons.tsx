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
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";
import McpToolReactSvgUrl from "PUBLIC_DIR/images/mcp.tool.svg?url";
import AttachmentReactSvgUrl from "PUBLIC_DIR/images/attachment.react.svg?url";

import { IconButton } from "../../../icon-button";
import { Text } from "../../../text";

import { useMessageStore } from "../../store/messageStore";

import { ButtonsProps } from "../../Chat.types";

import styles from "./ChatInput.module.scss";

const Buttons = ({
  inputWidth,
  isFilesSelectorVisible,
  toggleFilesSelector,
  isMcpToolsVisible,
  toggleMcpTools,
  toolSettingsRef,
  sendMessageAction,
}: ButtonsProps) => {
  const { t } = useTranslation(["Common"]);

  const { isRequestRunning, stopMessage } = useMessageStore();

  const sendIconProps = !isRequestRunning
    ? { onClick: sendMessageAction, isDisabled: false, iconNode: null }
    : {
        onClick: stopMessage,
        isDisabled: false,
        iconNode: <div className={styles.square} />,
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
          })}
          onClick={toggleFilesSelector}
        >
          <IconButton
            iconName={AttachmentReactSvgUrl}
            size={16}
            isFill={false}
          />
        </div>
        <div
          ref={toolSettingsRef}
          className={classNames(styles.chatInputButton, {
            [styles.activeChatInputButton]: isMcpToolsVisible,
          })}
          onClick={toggleMcpTools}
        >
          <IconButton iconName={McpToolReactSvgUrl} size={16} isFill={false} />
          <Text lineHeight="16px" fontSize="13px" fontWeight={600} noSelect>
            {t("Tools")}
          </Text>
        </div>
      </div>
      <IconButton
        iconName={SendReactSvgUrl}
        size={16}
        isClickable
        className={classNames(styles.chatInputButtonsSend, {
          [styles.disabled]: false,
        })}
        {...sendIconProps}
      />
    </div>
  );
};

export default observer(Buttons);
