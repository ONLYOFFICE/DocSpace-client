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

import { PropsWithChildren } from "react";
import classNames from "classnames";

import { Text } from "../../../../../../text";
import { Heading, HeadingLevel } from "../../../../../../heading";
import { Link, LinkTarget } from "../../../../../../link";

import styles from "../../../ChatMessageBody.module.scss";
import CodeBlock from "../CodeBlock";
import { Scrollbar } from "../../../../../../scrollbar";

export const Code = ({
  className,
  children,
  propLanguage,
  successCopyMessage,
  ...props
}: PropsWithChildren<{
  className?: string;
  propLanguage?: string;
  successCopyMessage?: string;
}>) => {
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
      if (content[0] === " ") {
        return <span className="form-modal-markdown-span">{content}</span>;
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
        successCopyMessage={successCopyMessage}
      />
    );
  }
};

export const H1 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h1}
    fontWeight={700}
    fontSize="24px"
    lineHeight="32px"
  >
    {children}
  </Heading>
);

export const H2 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h2}
    fontWeight={700}
    fontSize="20px"
    lineHeight="28px"
  >
    {children}
  </Heading>
);

export const H3 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h3}
    fontWeight={600}
    fontSize="18px"
    lineHeight="26px"
  >
    {children}
  </Heading>
);

export const H4 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h4}
    fontWeight={600}
    fontSize="16px"
    lineHeight="24px"
  >
    {children}
  </Heading>
);

export const H5 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h5}
    fontWeight={600}
    fontSize="15px"
    lineHeight="22px"
  >
    {children}
  </Heading>
);

export const H6 = ({ children }: PropsWithChildren) => (
  <Heading
    className={styles.heading}
    level={HeadingLevel.h6}
    fontWeight={600}
    fontSize="14px"
    lineHeight="20px"
  >
    {children}
  </Heading>
);

export const Anchor = ({
  children,
  href,
}: PropsWithChildren<{ href?: string }>) => (
  <Link
    className={styles.link}
    target={LinkTarget.blank}
    href={href}
    fontSize="15px"
    lineHeight="22px"
    color="accent"
  >
    {children}
  </Link>
);

export const Blockquote = ({ children }: PropsWithChildren) => (
  <blockquote className={styles.blockquote}>{children}</blockquote>
);

export const Hr = () => (
  <div className={styles.hrWrapper}>
    <hr className={styles.hr} />
  </div>
);

export const Table = ({ children }: PropsWithChildren) => (
  <Scrollbar
    className={styles.tableScroll}
    scrollBodyClassName={styles.tableScrollBody}
    translateContentSizeYToHolder
  >
    <table className={styles.table}>{children}</table>
  </Scrollbar>
);

export const Th = ({ children }: PropsWithChildren) => (
  <th className={styles.th}>{children}</th>
);

export const Td = ({ children }: PropsWithChildren) => (
  <td className={styles.td}>{children}</td>
);

export const Tr = ({ children }: PropsWithChildren) => (
  <tr className={styles.tr}>{children}</tr>
);

export const Paragraph = ({ children }: PropsWithChildren) => {
  return (
    <Text
      fontSize="15px"
      lineHeight="22px"
      className={classNames(styles.paragraph)}
    >
      {children as React.ReactNode}
    </Text>
  );
};

export const Ol = ({ children }: PropsWithChildren) => (
  <ol className={classNames(styles.listBlock, styles.ol)}>{children}</ol>
);

export const Ul = ({ children }: PropsWithChildren) => (
  <ul className={classNames(styles.listBlock, styles.ul)}>{children}</ul>
);

export const Li = ({ children }: PropsWithChildren) => (
  <li className={styles.listItem}>{children}</li>
);
