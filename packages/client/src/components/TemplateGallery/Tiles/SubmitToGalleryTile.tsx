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

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { useTheme } from "styled-components";
import hexRgb from "hex-rgb";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import { globalColors } from "@docspace/shared/themes";

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
