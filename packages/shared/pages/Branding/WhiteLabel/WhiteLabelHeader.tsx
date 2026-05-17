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
import classNames from "classnames";

import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

import { globalColors } from "@docspace/ui-kit/providers/theme";

import { Text } from "@docspace/ui-kit/components/text";
import { Badge } from "@docspace/ui-kit/components/badge";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/ui-kit/components/text-input";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { IHeaderProps } from "./WhiteLabel.types";
import styles from "./WhiteLabel.module.scss";

export const WhiteLabelHeader = ({
  isSettingPaid,
  standalone,
  onUseTextAsLogo,
  isEmpty,
  logoTextWhiteLabel,
  onChange,
  onClear,
}: IHeaderProps) => {
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();

  return (
    <div className={styles.header}>
      <div className={classNames(styles.headerContainer, "header-container")}>
        <Text fontSize="16px" fontWeight="700">
          {t("WhiteLabel")}
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

      <div className={classNames(styles.wlHelper, "wl-helper")}>
        <Text
          as="div"
          className={classNames(
            styles.wlSubtitle,
            styles.wlHelperLabel,
            "wl-helper-label",
          )}
          fontSize="13px"
        >
          {t("WhiteLabelLogoSubtitle")}
          <HelpButton
            tooltipContent={
              <Text fontSize="12px">{t("Common:WhiteLabelTooltip")}</Text>
            }
            place="right"
            offsetRight={0}
            dataTestId="white_label_helper_button"
          />
        </Text>
      </div>

      <div className="settings-block">
        <FieldContainer
          id="fieldContainerGenerateLogo"
          labelText={t("GenerateLogoLabel")}
          isVertical
          className="field-container"
          labelVisible
        >
          <div
            className={classNames(styles.whiteLabelInput, {
              [styles.showCross]: !!logoTextWhiteLabel,
            })}
          >
            <TextInput
              testId="logo-text-input"
              className={classNames(styles.input, "input")}
              placeholder={t("YourLogo")}
              value={logoTextWhiteLabel}
              onChange={onChange}
              isDisabled={!isSettingPaid}
              isReadOnly={!isSettingPaid}
              scale
              maxLength={10}
              type={InputType.text}
              size={InputSize.base}
              withBorder={false}
            />

            <div
              className={styles.append}
              onClick={onClear}
              data-testid="white_label_input_clear"
            >
              <CrossIcon />
            </div>
          </div>
          <Button
            testId="generate-logo-button"
            id="btnGenerateLogo"
            className={styles.generateLogo}
            size={ButtonSize.small}
            label={t("GenerateLogoButton")}
            onClick={onUseTextAsLogo}
            isDisabled={!isSettingPaid || isEmpty}
          />
        </FieldContainer>
      </div>
    </div>
  );
};
