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
import { Text } from "../text";
import { LinkProps } from "./Link.types";
import { LinkType, LinkTarget } from "./Link.enums";
import styles from "./Link.module.scss";

const Link: React.FC<LinkProps> = ({
  className,
  children,
  color,
  fontSize,
  href,
  isBold = false,
  isHovered = false,
  isSemitransparent = false,
  lineHeight,
  rel,
  tabIndex,
  type = LinkType.page,
  isTextOverflow = false,
  noHover = false,
  enableUserSelect = false,
  textDecoration,
  ariaLabel,
  dataTestId,
  ...rest
}: LinkProps) => {
  const linkClasses = classNames(
    styles.link,
    {
      [styles.semitransparent]: isSemitransparent,
      [styles.isHovered]: isHovered,
      [styles.textOverflow]: isTextOverflow,
      [styles.noHover]: noHover,
      [styles.enableUserSelect]: enableUserSelect,
      [styles.page]: type === LinkType.page,
    },
    className,
  );

  return (
    <Text
      className={linkClasses}
      fontSize={fontSize}
      as="a"
      href={href}
      rel={rel}
      tabIndex={tabIndex}
      isBold={isBold}
      style={{
        color,
        lineHeight,
        textDecoration,
      }}
      aria-label={ariaLabel || children}
      data-testid={dataTestId || "link"}
      {...rest}
    >
      {children}
    </Text>
  );
};

export { LinkType, LinkTarget, Link };
