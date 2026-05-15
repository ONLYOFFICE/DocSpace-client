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

import hexRgb from "hex-rgb";
import { Text } from "@docspace/ui-kit/components/text";
import { getTextColor } from "@docspace/shared/utils";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { CustomLogoProps, ICover } from "../RoomLogoCoverDialog.types";
import styles from "../RoomLogoCover.module.scss";

export const CustomLogo = ({
  color,
  icon,
  withoutIcon,
  isBaseTheme,
  roomTitle,
}: CustomLogoProps) => {
  const textColor = color && getTextColor(color, 202);

  const darkBg =
    color && !isBaseTheme
      ? hexRgb(color, { alpha: 0.09, format: "css" })
      : undefined;

  return (
    <div
      className={styles.customLogo}
      style={
        {
          "--logo-color": color,
          "--logo-text-color": textColor,
          "--logo-color-dark": darkBg,
        } as React.CSSProperties
      }
    >
      {withoutIcon ? (
        <div className="logo-cover_wrapper">
          <Text
            className="logo-cover-text"
            fontSize="41px"
            color={textColor || globalColors.white}
            fontWeight={700}
          >
            {roomTitle}
          </Text>
        </div>
      ) : (
        <div
          {...((icon as ICover) && {
            dangerouslySetInnerHTML: {
              __html: (icon as ICover).data,
            },
          })}
          className="custom-logo-cover"
        />
      )}
    </div>
  );
};
