/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React from "react";
import { useTranslation } from "react-i18next";

import styles from "../../../ChatMessageBody.module.scss";
import { Text } from "../../../../../../text";
import type {
  TToolCallContent,
  TToolCallResultSourceData,
} from "../../../../../../../api/ai/types";
import { formatJsonWithMarkdown } from "../../../../../utils";

import MarkdownField from "../Markdown";
import type { ToolCallPlacement } from "./ToolCall.enum";
import { Heading, HeadingLevel } from "../../../../../../heading";
import { Link, LinkTarget } from "../../../../../../link";

const getRootDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname;

    return hostname.split(".").slice(-2).join(".");
  } catch {
    return "";
  }
};

const SourceView = ({
  query,
  sources,
}: {
  query: string;
  sources: TToolCallResultSourceData[];
}) => {
  return (
    <div className={styles.sourceView}>
      <Heading
        className={styles.sourceViewHeading}
        level={HeadingLevel.h4}
        fontSize="15px"
        fontWeight={600}
        truncate
      >
        Search for {query}
      </Heading>

      <div className={styles.sourceViewList}>
        {sources.map((s, index) => {
          const hostName = getRootDomain(s.url || "");
          const faviconUrl = s.faviconUrl; // TODO: CSP error. Maybe need to change to google favicon api

          return (
            <Link
              key={s.fileId || `${s.title}_${index * 2}`}
              className={styles.sourceItem}
              href={s.url || ""}
              target={LinkTarget.blank}
              textDecoration="none"
            >
              <img src={faviconUrl} alt="source icon" width={16} height={16} />
              <Text
                fontSize="14px"
                fontWeight={600}
                lineHeight="16px"
                truncate
                title={s.title}
              >
                {s.title}
              </Text>
              {hostName ? (
                <Text
                  className={styles.sourceUrl}
                  fontSize="13px"
                  fontWeight={600}
                  lineHeight="20px"
                  truncate
                  title={hostName}
                >
                  {hostName}
                </Text>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

type ToolCallBodyProps = {
  content: TToolCallContent;
  placement: ToolCallPlacement;
  withSource?: boolean;
};

export const ToolCallBody = ({
  content,
  placement,
  withSource,
}: ToolCallBodyProps) => {
  const { t } = useTranslation(["Common"]);

  const getResult = () => {
    if (withSource) {
      return JSON.stringify(
        content.result?.data as TToolCallResultSourceData[],
        null,
        2,
      );
    }

    if (content.result && "content" in content.result) {
      return (content.result?.content as Record<string, unknown>[])?.[0]
        .text as string;
    }

    return "";
  };

  const result = getResult();

  let isJson = false;

  try {
    JSON.parse(result);
    isJson = true;
  } catch {
    isJson = false;
  }

  const showResult = placement === "message" && content.result;

  return (
    <div className={styles.toolCallBody}>
      {withSource ? (
        <SourceView
          query={content.arguments.query as string}
          sources={
            Array.isArray(content.result?.data)
              ? content.result?.data
              : [content.result?.data]
          }
        />
      ) : (
        <>
          <div className={styles.toolCallCodeViewItem}>
            <Text fontSize="15px" lineHeight="16px" fontWeight={600}>
              {t("Common:ToolCallArg")}
            </Text>
            <MarkdownField
              chatMessage={formatJsonWithMarkdown(content.arguments)}
            />
          </div>
          {showResult ? (
            <div className={styles.toolCallCodeViewItem}>
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
        </>
      )}
    </div>
  );
};
