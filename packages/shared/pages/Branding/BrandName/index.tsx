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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import classNames from "classnames";
import { Nullable } from "../../../types";

import { globalColors } from "@docspace/ui-kit/providers/theme";

import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { Text } from "@docspace/ui-kit/components/text";
import { Badge } from "@docspace/ui-kit/components/badge";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/ui-kit/components/text-input";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { NotAvailable } from "../WhiteLabel/NotAvailable";
import { IWhiteLabelData } from "../WhiteLabel/WhiteLabel.types";

import { IBrandNameProps } from "./BrandName.types";
import styles from "./BrandName.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const BrandName = ({
  showNotAvailable,
  isSettingPaid,
  standalone,
  onSave,
  isBrandNameLoaded,
  defaultBrandName,
  brandName,
  error,
  onValidate,
}: IBrandNameProps) => {
  const { t } = useTranslation("Common");

  const { isBase } = useTheme();

  const [brandNameWhiteLabel, setBrandNameWhiteLabel] =
    useState<Nullable<string>>(null);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!isBrandNameLoaded || !brandName) return;
    setBrandNameWhiteLabel(brandName);
  }, [brandName, isBrandNameLoaded]);

  useEffect(() => {
    setHasError(!!error);
  }, [error]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setBrandNameWhiteLabel(value);

    if (onValidate) {
      onValidate(value);
    }
  };

  const onSaveAction = (): void => {
    const data: IWhiteLabelData = {
      logoText: brandNameWhiteLabel ?? "",
      logo: [],
    };
    onSave(data);
  };

  const onCancelAction = (): void => {
    setBrandNameWhiteLabel(defaultBrandName);
    if (onValidate) {
      onValidate(defaultBrandName);
    }
  };

  const isEqualText = defaultBrandName === (brandNameWhiteLabel ?? "");
  const showReminder = !isEqualText && brandNameWhiteLabel !== null;

  const getErrorText = () => {
    if (!error) return "";

    switch (error) {
      case "Empty":
        return t("Common:EmptyFieldError");
      case "MinLength":
        return t("Common:BrandNameLength", {
          minLength: 2,
          maxLength: 40,
        });
      case "SpecSymbols":
        return t("Common:BrandNameForbidden");
      default:
        return t("Common:Error");
    }
  };

  return (
    <div
      className={classNames(styles.brandName, {
        ["isEnableBranding"]: !isSettingPaid,
        ["settings_unavailable"]: !isSettingPaid,
      })}
    >
      {showNotAvailable ? <NotAvailable /> : null}

      <div className={classNames(styles.headerContainer, "header-container")}>
        <Text fontSize="16px" fontWeight="700">
          {t("BrandName")}
        </Text>

        {!isSettingPaid && !standalone ? (
          <Badge
            className={classNames(styles.paidBadge, "paid-badge")}
            fontWeight="700"
            label={t("Common:Paid")}
            isPaidBadge
            backgroundColor={
              isBase
                ? globalColors.favoritesStatus
                : globalColors.favoriteStatusDark
            }
          />
        ) : null}
      </div>

      <Text
        className={classNames(styles.wlSubtitle, "wl-subtitle")}
        fontSize="13px"
      >
        {t("BrandNameSubtitle", { productName: getBrandName("ProductName") })}
      </Text>

      <div className="settings-block">
        <FieldContainer id="fieldContainerBrandName" isVertical>
          <TextInput
            testId="brand_name_input"
            name="brand_name"
            className="brand-name input"
            value={brandNameWhiteLabel ?? ""}
            onChange={onChange}
            isDisabled={!isSettingPaid}
            isReadOnly={!isSettingPaid}
            scale
            isAutoFocussed={!isMobile}
            maxLength={40}
            type={InputType.text}
            size={InputSize.base}
            hasError={hasError}
          />
          {hasError ? (
            <Text fontSize="12px" className={styles.errorText}>
              {getErrorText()}
            </Text>
          ) : null}
          <SaveCancelButtons
            id="btnBrandName"
            className={classNames(
              styles.brandNameButtons,
              "brand-name-buttons",
            )}
            onSaveClick={onSaveAction}
            onCancelClick={onCancelAction}
            saveButtonLabel={t("Common:SaveButton")}
            cancelButtonLabel={t("Common:CancelButton")}
            reminderText={t("Common:YouHaveUnsavedChanges")}
            displaySettings
            saveButtonDisabled={isEqualText || hasError}
            disableRestoreToDefault={isEqualText}
            showReminder={showReminder}
            saveButtonDataTestId="brand_name_save_button"
            cancelButtonDataTestId="brand_name_cancel_button"
          />
        </FieldContainer>
      </div>
    </div>
  );
};
