// (c) Copyright Ascensio System SIA 2009-2026
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
