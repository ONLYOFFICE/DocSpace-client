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
import copy from "copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
// @ts-expect-error file not inside global exports
import a11yLight from "react-syntax-highlighter/dist/cjs/styles/prism/a11y-one-light";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useTheme } from "../../../../../../hooks/useTheme";

import { Text } from "../../../../../text";
import { IconButton } from "../../../../../icon-button";

import styles from "../../ChatMessageBody.module.scss";

import { MessageCodeBlockProps } from "../../../../Chat.types";

const CodeBlock = ({ language, content }: MessageCodeBlockProps) => {
  const { isBase } = useTheme();

  const onCopy = () => {
    copy(content);
  };

  return (
    <div className={styles.codeContainer}>
      <div className={styles.codeHeader}>
        {language ? <Text>{language}</Text> : null}
        <IconButton
          iconName={CopyIconUrl}
          size={16}
          isClickable
          onClick={onCopy}
        />
      </div>
      <SyntaxHighlighter
        language={language}
        style={isBase ? a11yLight : a11yDark}
        className={styles.codeBody}
        customStyle={isBase ? {} : { background: "none" }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
