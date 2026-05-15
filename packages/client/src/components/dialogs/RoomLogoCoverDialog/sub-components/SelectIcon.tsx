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

import React from "react";

import hexRgb from "hex-rgb";
import { SelectIconProps, ILogo } from "../RoomLogoCoverDialog.types";
import styles from "../RoomLogoCover.module.scss";

export const SelectIcon = ({
  t,
  withoutIcon,
  setWithoutIcon,
  setIcon,
  covers,
  $currentColorScheme,
  coverId,
}: SelectIconProps) => {
  const toggleWithoutIcon = () => setWithoutIcon(!withoutIcon);

  const onSelectIcon = (icon: ILogo | string | null) => {
    setIcon(icon);
  };

  return (
    <div>
      <div className="icon-container">
        <div className="color-name">{t("CreateEditRoomDialog:Icon")}</div>
        <div
          className={`${styles.withoutIcon}${withoutIcon ? ` ${styles.isSelected}` : ""}`}
          onClick={toggleWithoutIcon}
          data-testid="room_logo_cover_without_icon"
        >
          {t("WithoutIcon")}
        </div>
      </div>

      <div className="cover-icon-container">
        {covers
          ? covers?.map((icon, index) => {
              function createMarkup() {
                return { __html: icon.data };
              }
              const isSelected = coverId === icon.id ? !withoutIcon : false;
              const accent = $currentColorScheme?.main?.accent;
              const iconStyle = accent
                ? ({
                    "--icon-hover-color": accent,
                    "--icon-selected-bg": isSelected
                      ? hexRgb(accent, { alpha: 0.2, format: "css" })
                      : undefined,
                  } as React.CSSProperties)
                : undefined;

              return (
                <div
                  className={`${styles.iconContainer}${isSelected ? ` ${styles.isSelected}` : ""}`}
                  style={iconStyle}
                  onClick={
                    coverId === icon.id
                      ? toggleWithoutIcon
                      : () => onSelectIcon(icon as unknown as string)
                  }
                  key={icon.id}
                  id={`cover-icon-${icon?.id}`}
                  data-testid={`room_logo_cover_icon_${index}`}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                  dangerouslySetInnerHTML={createMarkup()}
                />
              );
            })
          : null}
      </div>
    </div>
  );
};
