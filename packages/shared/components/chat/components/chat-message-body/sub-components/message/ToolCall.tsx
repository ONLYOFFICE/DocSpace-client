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
import { ReactSVG } from "react-svg";

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg?url";
import ToolFinish from "PUBLIC_DIR/images/tool.finish.svg?url";

import {
  ContentType,
  ServerType,
  ToolsPermission,
} from "../../../../../../api/ai/enums";
import { updateToolsPermission } from "../../../../../../api/ai";
import { getServerIcon } from "../../../../../../utils";
import { useTheme } from "../../../../../../hooks/useTheme";

import { Text } from "../../../../../text";
import { Loader, LoaderTypes } from "../../../../../loader";
import { Button, ButtonSize } from "../../../../../button";

import { formatJsonWithMarkdown } from "../../../../utils";

import { MessageToolCallProps } from "../../../../Chat.types";

import styles from "../../ChatMessageBody.module.scss";
import MarkdownField from "./Markdown";

const ToolCall = ({ content }: MessageToolCallProps) => {
  const { isBase } = useTheme();
  const { t } = useTranslation(["Common"]);
  const [isHide, setIsHide] = React.useState(true);
  const [isManage, setIsManage] = React.useState(() => {
    if (content.type !== ContentType.Tool) return false;

    return content?.managed;
  });

  if (content.type !== ContentType.Tool) return null;

  const result = (content.result?.content as Record<string, unknown>[])?.[0]
    .text as string;

  let isJson = false;

  try {
    JSON.parse(result);
    isJson = true;
  } catch (e) {
    console.log(e);
    isJson = false;
  }

  const onClickAction = (decision: ToolsPermission) => {
    if (!content.callId) return;

    setIsManage(false);

    updateToolsPermission(content.callId, decision);
  };

  const icon = getServerIcon(
    content.mcpServerInfo?.serverType || ServerType.Custom,
    isBase,
  );

  const toolCallComponent = (
    <div className={styles.toolCall}>
      <div
        className={classNames(styles.toolCallHeader, {
          [styles.hide]: isHide,
        })}
        onClick={() => setIsHide((val) => !val)}
      >
        {content.result ? (
          <ReactSVG src={ToolFinish} className={styles.toolFinishIcon} />
        ) : (
          <Loader type={LoaderTypes.track} size="12px" />
        )}
        <Text
          className={styles.toolCallHeaderText}
          fontSize="13px"
          lineHeight="15px"
          fontWeight={600}
        >
          {t("Common:ToolCallExecuted")}:
          {icon ? (
            <img className={styles.toolCallHeaderIcon} src={icon} alt="" />
          ) : null}
          <span> {content.name}</span>
        </Text>
        <ReactSVG src={ArrowRightIcon} className={styles.arrowRightIcon} />
      </div>
      {isHide ? null : (
        <div className={styles.toolCallBody}>
          <div className={styles.toolCallBodyItem}>
            <Text fontSize="15px" lineHeight="16px" fontWeight={600}>
              {t("Common:ToolCallArg")}
            </Text>
            <MarkdownField
              chatMessage={formatJsonWithMarkdown(content.arguments)}
            />
          </div>
          {content.result ? (
            <div className={styles.toolCallBodyItem}>
              <Text fontSize="15px" lineHeight="16px" fontWeight={600}>
                {t("Common:ToolCallResult")}
              </Text>
              <MarkdownField
                chatMessage={formatJsonWithMarkdown(
                  isJson ? JSON.parse(result) : result,
                )}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  return isManage ? (
    <div className={styles.toolCallManage}>
      <Text>AI would like to use this tool</Text>

      {toolCallComponent}

      <div>
        <Text>{t("Common:ReviewAction")}</Text>
        <Text>{t("Common:CannotGuaranteeSecurity")}</Text>
      </div>
      <div className={styles.buttonsBlockContaiener}>
        <div className={styles.approveButtonBlock}>
          <Button
            size={ButtonSize.small}
            primary
            scale
            label={t("Common:AllowAlways")}
            onClick={() => onClickAction(ToolsPermission.AlwaysAllow)}
          />
          <Button
            size={ButtonSize.small}
            primary
            scale
            label={t("Common:AllowOnce")}
            onClick={() => onClickAction(ToolsPermission.Allow)}
          />
        </div>
        <Button
          size={ButtonSize.small}
          label={t("Common:Deny")}
          onClick={() => onClickAction(ToolsPermission.Deny)}
        />
      </div>
    </div>
  ) : (
    toolCallComponent
  );
};

export default ToolCall;
