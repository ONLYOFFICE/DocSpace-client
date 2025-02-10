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
import styles from "./Text.module.scss";
import type { TextProps } from "./Text.types";

const TextPure = React.forwardRef<HTMLDivElement, TextProps>(
  (
    {
      title,
      tag,
      as,
      fontSize,
      fontWeight,
      color,
      textAlign,
      onClick,
      dir,
      children,
      view,
      isInline,
      isBold,
      isItalic,
      lineHeight,
      noSelect,
      backgroundColor,
      truncate,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const elementType = !as && tag ? tag : as;
    const isAutoDir = dir === "auto";
    const dirProps = isAutoDir ? {} : { dir };

    const textStyles = {
      fontSize,
      fontWeight: isBold ? 700 : fontWeight,
      color,
      textAlign,
      lineHeight,
      backgroundColor,
      ...style,
    };

    const textClassName = classNames(
      styles.text,
      {
        [styles.inline]: isInline,
        [styles.italic]: isItalic,
        [styles.bold]: isBold,
        [styles.noSelect]: noSelect,
        [styles.truncate]: truncate,
      },
      className,
    );

    const Element = elementType || "p";

    return (
      <Element
        ref={ref}
        title={title}
        data-testid="text"
        onClick={onClick}
        className={textClassName}
        style={textStyles}
        {...dirProps}
        {...rest}
      >
        {isAutoDir ? (
          <span
            className={classNames(styles.autoDirSpan, {
              [styles.tile]: view === "tile",
            })}
            dir="auto"
          >
            {children}
          </span>
        ) : (
          children
        )}
      </Element>
    );
  },
);

TextPure.displayName = "TextPure";

const Text = React.memo(TextPure);

export { Text };
