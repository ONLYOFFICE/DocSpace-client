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

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import classNames from "classnames";

import { Text } from "../../../../../text";

import { MessageMarkdownFieldProps } from "../../../../Chat.types";

import styles from "../../ChatMessageBody.module.scss";

import CodeBlock from "./CodeBlock";

// Function to replace <think> tags with a placeholder before markdown processing
const preprocessChatMessage = (text: string): string => {
  // Replace <think> tags with `<span class="think-tag">think:</span>`
  return text
    .replace(/<think>/g, "`<think>`")
    .replace(/<\/think>/g, "`</think>`");
};

const MarkdownField = ({
  chatMessage,
  propLanguage,
}: MessageMarkdownFieldProps) => {
  // Process the chat message to handle <think> tags
  const processedChatMessage = preprocessChatMessage(chatMessage);

  return (
    <div style={{ width: "100%" }} className={styles.markdownField}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => {
            return (
              <Text
                fontSize="13px"
                lineHeight="20px"
                fontWeight={400}
                className={styles.chatMessageTextColor}
                style={{ whiteSpace: "pre-line", padding: "8px 0" }}
              >
                {children as React.ReactNode}
              </Text>
            );
          },
          ol({ children }) {
            return (
              <ol
                className={classNames(
                  styles.chatMessageTextColor,
                  styles.listBlock,
                )}
              >
                {children}
              </ol>
            );
          },
          ul({ children }) {
            return (
              <ul
                className={classNames(
                  styles.chatMessageTextColor,
                  styles.listBlock,
                )}
              >
                {children}
              </ul>
            );
          },
          pre: ({ children }) => {
            return <pre>{children}</pre>;
          },
          code: ({ className, children, ...props }) => {
            let content = children as string;

            const inline = content ? content.indexOf("\n") === -1 : false;

            if (
              Array.isArray(children) &&
              children.length === 1 &&
              typeof children[0] === "string"
            ) {
              content = children[0] as string;
            }

            const match = /language-(\w+)/.exec(className || "");

            if (typeof content === "string") {
              if (content.length) {
                if (content[0] === "▍") {
                  return <span className="form-modal-markdown-span" />;
                }

                // Specifically handle <think> tags that were wrapped in backticks
                if (content === "<think>" || content === "</think>") {
                  return <span>{content}</span>;
                }
              }

              if (inline) {
                return (
                  <code className={styles.inlineCodeBlock} {...props}>
                    {content}
                  </code>
                );
              }

              return (
                <CodeBlock
                  language={propLanguage ?? match?.[1].toLowerCase()}
                  content={content}
                />
              );
            }
          },
        }}
      >
        {processedChatMessage}
      </Markdown>
    </div>
  );
};

export default MarkdownField;
