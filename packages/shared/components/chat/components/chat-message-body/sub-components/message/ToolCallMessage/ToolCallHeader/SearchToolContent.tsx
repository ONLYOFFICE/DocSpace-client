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
import { ReactSVG } from "react-svg";

import DocumentsIcon from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.svg?url";

import {
  TToolCallContent,
  TToolCallResultSourceData,
} from "../../../../../../../../api/ai/types";
import { useMessageStore } from "../../../../../../store/messageStore";
import styles from "../../../../ChatMessageBody.module.scss";
import { Text } from "../../../../../../../text";
import { Link, LinkTarget } from "../../../../../../../link";

const WebCrawlingToolContent = ({ content }: { content: TToolCallContent }) => {
  const { t } = useTranslation(["Common"]);

  const toolInfo = ((content.result?.data as TToolCallResultSourceData)
    ?.title || content.arguments.url) as string;

  return (
    <Link
      style={{ display: "contents" }}
      href={content.arguments?.url as string}
      target={LinkTarget.blank}
      textDecoration="none"
    >
      <ReactSVG className={styles.searchToolIcon} src={UniverseIcon} />
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} truncate>
        {t("Common:WebCrawling")} | <span title={toolInfo}>{toolInfo}</span>
      </Text>
      <ReactSVG className={styles.externalLinkIcon} src={ExternalLinkIcon} />
    </Link>
  );
};

const WebSearchToolContent = ({ content }: { content: TToolCallContent }) => {
  const { t } = useTranslation(["Common"]);

  const toolInfo = content.arguments.query as string;

  return (
    <>
      <ReactSVG className={styles.searchToolIcon} src={UniverseIcon} />
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} truncate>
        {t("Common:WebSearch")} | <span title={toolInfo}>{toolInfo}</span>
      </Text>
    </>
  );
};

const KnowledgeSearchToolContent = ({
  content,
}: {
  content: TToolCallContent;
}) => {
  const { t } = useTranslation(["Common"]);

  const toolInfo = content.arguments.query as string;

  return (
    <>
      <ReactSVG className={styles.searchToolIcon} src={DocumentsIcon} />
      <Text fontSize="13px" lineHeight="20px" fontWeight={600} truncate>
        {t("Common:KnowledgeSearch")} | <span title={toolInfo}>{toolInfo}</span>
      </Text>
    </>
  );
};

export const SearchToolContent = ({
  content,
}: {
  content: TToolCallContent;
}) => {
  const { knowledgeSearchToolName, webSearchToolName, webCrawlingToolName } =
    useMessageStore();

  return (
    <>
      {content.name === knowledgeSearchToolName ? (
        <KnowledgeSearchToolContent content={content} />
      ) : null}

      {content.name === webSearchToolName ? (
        <WebSearchToolContent content={content} />
      ) : null}

      {content.name === webCrawlingToolName ? (
        <WebCrawlingToolContent content={content} />
      ) : null}
    </>
  );
};
