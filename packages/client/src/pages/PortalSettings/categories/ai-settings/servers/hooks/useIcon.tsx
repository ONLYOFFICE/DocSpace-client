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
import { useTranslation } from "react-i18next";
import resizeImage from "resize-image";
import equal from "fast-deep-equal/react";

import { AddButton } from "@docspace/ui-kit/components/add-button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ONE_MEGABYTE } from "@docspace/shared/constants";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import styles from "../styles/AddEditDialog.module.scss";

export const useIcon = (initialValue?: string) => {
  const { t } = useTranslation(["AISettings", "OAuth"]);

  const [icon, setIcon] = React.useState(initialValue || "");

  const initFormData = React.useRef({ icon });

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";

      inputRef.current.files = null;
    }
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file =
      e.target.files && e.target.files?.length > 0 && e.target.files[0];

    if (file && file.type === "image/svg+xml") {
      if (file.size > ONE_MEGABYTE)
        return toastr.error(t("Common:SizeImageLarge"));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string")
          setIcon(reader.result);
      };
      reader.readAsDataURL(file);

      return;
    }

    if (file) {
      const widthProp = 64;
      const heightProp = 64;

      const img = new Image();
      img.onload = () => {
        const data = resizeImage.resize(img, widthProp, heightProp, "png");
        setIcon(data);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const getIcon = () => {
    return icon;
  };

  const hasChanges = !equal(initFormData.current, { icon });

  const onDeleteIcon = () => setIcon("");

  const iconComponent = (
    <FieldContainer
      className={styles.iconContainer}
      labelText={t("AISettings:ServiceIcon")}
      isVertical
      labelVisible
      removeMargin
    >
      <div className={styles.iconBlock} data-testid="set-mcp-icon">
        {icon ? (
          <>
            <img className={styles.icon} alt="img" src={icon} />
            <Link
              type={LinkType.action}
              lineHeight="15px"
              fontWeight={600}
              isHovered
              onClick={onDeleteIcon}
              className={styles.deleteImageLink}
            >
              {t("AISettings:DeleteImage")}
            </Link>
          </>
        ) : (
          <AddButton label={t("OAuth:SelectNewImage")} onClick={onClick} />
        )}
      </div>
      <input
        ref={inputRef}
        id="customFileInput"
        className="custom-file-input"
        multiple
        type="file"
        onChange={onSelect}
        onClick={onInputClick}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/svg+xml"
      />
    </FieldContainer>
  );

  return {
    iconComponent,
    getIcon,
    iconChanged: hasChanges,
  };
};
