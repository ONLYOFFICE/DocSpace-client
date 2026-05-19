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

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import hexRgb from "hex-rgb";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import classNames from "classnames";
import styles from "./SubmitToGalleryTile.module.scss";
import type { FC } from "react";
import type { SubmitToGalleryTileProps } from "./SubmitToGalleryTile.types";

const SubmitToGalleryTile: FC<SubmitToGalleryTileProps> = ({
  t,
  hideSubmitToGalleryTile,
  setSubmitToGalleryDialogVisible,
  currentColorScheme,
  logoText,
  smallPreview,
  isSubmitTile,
  submitToGalleryTileIsVisible,
  viewMobile,
  isKeyboardFocused,
}) => {
  const { isBase } = useTheme();

  if (!submitToGalleryTileIsVisible) return null;

  const onSubmitToGallery = (): void => setSubmitToGalleryDialogVisible(true);

  const tileClassName = classNames(styles.submitToGalleryTile, {
    [styles.viewMobile]: viewMobile,
  });

  const contentClassName = classNames(styles.content, {
    [styles.smallPreview]: smallPreview,
  });

  return (
    <div
      className={tileClassName}
      data-small-preview={smallPreview ? "true" : "false"}
      data-submit-tile={isSubmitTile ? "true" : "false"}
    >
      <div
        className={contentClassName}
        style={
          {
            "--color-background": isBase
              ? hexRgb(
                  currentColorScheme.main?.accent || globalColors.lightBlueMain,
                  {
                    alpha: 0.03,
                    format: "css",
                  },
                )
              : hexRgb(globalColors.white, {
                  alpha: 0.03,
                  format: "css",
                }),
          } as React.CSSProperties
        }
      >
        <ReactSVG
          src={CrossIcon}
          onClick={hideSubmitToGalleryTile}
          className={styles.closeIcon}
        />

        <div className={styles.info}>
          <div className={styles.title}>
            {t("FormGallery:GalleryTitle", {
              organizationName: logoText,
            })}
          </div>
          <div className={styles.body}>
            {t("Common:SubmitToGalleryBlockBody", {
              organizationName: logoText,
            })}
          </div>
        </div>

        <Button
          className={styles.buttonSubmit}
          onClick={onSubmitToGallery}
          size={ButtonSize.small}
          label={t("FormGallery:UploadGallery")}
          isHovered={isKeyboardFocused}
          scale
        />
      </div>
    </div>
  );
};

export default inject<TStore>(
  ({ settingsStore, oformsStore, dialogsStore }) => {
    const { currentColorScheme, logoText } = settingsStore;

    return {
      submitToGalleryTileIsVisible: oformsStore.submitToGalleryTileIsVisible,
      hideSubmitToGalleryTile: oformsStore.hideSubmitToGalleryTile,
      setSubmitToGalleryDialogVisible:
        dialogsStore.setSubmitToGalleryDialogVisible,
      currentColorScheme,
      logoText,
    };
  },
)(withTranslation(["Common", "FormGallery"])(observer(SubmitToGalleryTile)));
