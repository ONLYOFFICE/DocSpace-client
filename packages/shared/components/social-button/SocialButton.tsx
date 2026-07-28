/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { memo } from "react";
import equal from "fast-deep-equal/react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";

import type { SocialButtonProps } from "./SocialButton.types";
import styles from "./SocialButton.module.scss";

export const SocialButton = memo((props: SocialButtonProps) => {
  const {
    label = "",
    size = "base",
    IconComponent,
    tabIndex = -1,
    iconName = "SocialButtonGoogleIcon",
    isConnect = false,
    isDisabled = false,
    noHover = false,
    className,
    dataTestId,
    $iconOptions,
    ...otherProps
  } = props;

  const buttonStyle = $iconOptions?.color
    ? ({ "--icon-options-color": $iconOptions.color } as React.CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      className={classNames(styles.socialButton, className, {
        [styles.isConnect]: isConnect,
        [styles.disabled]: isDisabled,
        [styles.small]: size !== "base",
        [styles.noHover]: noHover,
      })}
      data-testid={dataTestId ?? "social-button"}
      data-icon-options-color={$iconOptions ? $iconOptions.color : null}
      style={buttonStyle}
      tabIndex={tabIndex}
      disabled={isDisabled}
      {...otherProps}
    >
      <div
        data-url={props["data-url"]}
        data-providername={props["data-providername"]}
        className={styles.socialButtonContainer}
      >
        {IconComponent ? (
          <IconComponent className={styles.iconWrapper} />
        ) : (
          <ReactSVG className={styles.iconWrapper} src={iconName} />
        )}
        {label ? (
          <Text
            as="div"
            className={classNames(styles.socialButtonText, {
              [styles.isConnect]: isConnect,
            })}
          >
            {label}
          </Text>
        ) : null}
      </div>
    </button>
  );
}, equal);

SocialButton.displayName = "SocialButton";
