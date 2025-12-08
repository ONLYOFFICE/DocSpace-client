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
import { classNames } from "../../utils";

import styles from "./Heading.module.scss";
import { HeadingProps } from "./Heading.types";
import { HeadingLevel, HeadingSize } from "./Heading.enums";

export const HeadingPure = ({
  id,
  level = HeadingLevel.h1,
  color,
  title,
  truncate = false,
  isInline = false,
  className = "",
  size = HeadingSize.medium,
  type,
  children,
  style,
  as,
  fontSize,
  fontWeight,
  lineHeight,
  ...rest
}: HeadingProps) => {
  const Element = (as || `h${level}`) as React.ElementType;

  const classes = classNames(className, styles.heading, {
    [styles.small]: size === HeadingSize.small,
    [styles.medium]: size === HeadingSize.medium,
    [styles.large]: size === HeadingSize.large,
    [styles.xlarge]: size === HeadingSize.xlarge,
    [styles.xsmall]: size === HeadingSize.xsmall,
    [styles.truncate]: truncate,
    [styles.inline]: isInline,
    [styles.header]: type === "header",
    [styles.menu]: type === "menu",
    [styles.content]: type === "content",
    [styles["not-selectable"]]: true,
  });

  return (
    <Element
      id={id}
      title={title}
      className={classes}
      style={{
        ...style,
        color: color || undefined,
        fontSize: fontSize || undefined,
        fontWeight: fontWeight || undefined,
        lineHeight: lineHeight || undefined,
      }}
      data-testid="heading"
      {...rest}
    >
      {children}
    </Element>
  );
};

const Heading = React.memo(HeadingPure);

export { Heading, HeadingSize, HeadingLevel };
