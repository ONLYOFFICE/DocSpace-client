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

import { BadgeProps } from "./Badge.types";
import styles from "./Badge.module.scss";
import { Text } from "../text";

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>((props, ref) => {
  const {
    onClick,
    fontSize = "11px",
    color,
    fontWeight = 800,
    backgroundColor,
    borderRadius = "11px",
    padding = "0px 5px",
    maxWidth = "50px",
    height,
    type,
    compact,
    isHovered = false,
    border,
    label = 0,
    onMouseLeave,
    onMouseOver,
    noHover = false,
    className,
    isVersionBadge,
    isPaidBadge,
    isMutedBadge,
    ...rest
  } = props;

  const onClickAction = React.useCallback(
    (e: React.MouseEvent) => {
      if (!onClick) return;

      e.preventDefault();
      onClick(e);
    },
    [onClick],
  );

  const shouldDisplay = label && label !== "0";

  const badgeStyle = {
    height,
    border,
    borderRadius,
    "--badge-background-color": backgroundColor,
  } as React.CSSProperties;

  const innerStyle = isPaidBadge
    ? ({
        padding,
        borderRadius,
        "--badge-background-color": backgroundColor,
      } as React.CSSProperties)
    : ({
        maxWidth,
        padding,
        borderRadius,
        "--badge-background-color": backgroundColor,
      } as React.CSSProperties);

  const textStyle = {
    fontSize,
    fontWeight,
    color,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`${styles.badge} ${styles.themed} ${className || ""}`}
      style={badgeStyle}
      onClick={onClickAction}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      role="status"
      aria-label={`${label} ${type || ""}`}
      aria-live="polite"
      aria-atomic="true"
      data-testid="badge"
      data-hidden={!shouldDisplay}
      data-no-hover={noHover}
      data-is-hovered={isHovered}
      data-type={type}
      data-version-badge={isVersionBadge}
      data-paid={isPaidBadge}
      data-muted={isMutedBadge}
      {...rest}
    >
      <div
        className={styles.inner}
        style={innerStyle}
        data-compact={compact}
        data-type={type}
        data-testid="badge-inner"
        aria-hidden="true"
      >
        <Text
          className={styles.text}
          style={textStyle}
          textAlign="center"
          data-testid="badge-text"
          data-color={!!color}
        >
          {label}
        </Text>
      </div>
    </div>
  );
});

Badge.displayName = "Badge";

export { Badge };
