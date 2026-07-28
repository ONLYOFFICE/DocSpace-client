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

import { useMemo } from "react";
import classNames from "classnames";
import {
  TOption,
  ComboBoxSize,
  ComboBox,
} from "@docspace/ui-kit/components/combobox";
import { mapCulturesToArray } from "../../utils/cultures";
import { TCulture, ComboboxProps } from "./LanguageCombobox.types";
import styles from "./LanguageCombobox.module.scss";

const LanguageCombobox = (props: ComboboxProps) => {
  const {
    cultures,
    onSelectLanguage,
    selectedCulture,
    className,
    withBorder = true,
    isMobileView = false,
    dataTestId,
    directionY = "both",
    fixedDirection = false,
    isDefaultMode = true,
    manualWidth = "42px",
    usePortalBackdrop = false,
    withBackdrop = false,
    shouldShowBackdrop = false,
    isDisabled = false,
    showLanguageName = false,
  } = props;

  const withLabel = isMobileView || showLanguageName;

  const cultureNames = useMemo(() => {
    return mapCulturesToArray(cultures, false);
  }, [cultures]);

  const currentCulture = cultureNames.find(
    (item) => item.key === selectedCulture,
  );

  const onSelect = (option: TOption) => {
    const culture = option as TCulture;
    if (culture.key === selectedCulture) return;

    onSelectLanguage(culture);
  };

  if (!currentCulture) return null;

  return (
    <ComboBox
      className={classNames(
        styles.comboBox,
        {
          [styles.withBorder]: withBorder,
          [styles.withoutBorder]: !withBorder,
          [styles.withLanguageName]: showLanguageName,
        },
        className,
        "language-combo-box",
      )}
      directionY={directionY}
      fixedDirection={fixedDirection}
      isDefaultMode={isDefaultMode}
      options={cultureNames}
      selectedOption={currentCulture}
      onSelect={onSelect}
      isDisabled={isDisabled}
      scaled={false}
      scaledOptions={false}
      size={ComboBoxSize.content}
      showDisabledItems
      dropDownMaxHeight={300}
      fillIcon={false}
      displaySelectedOption
      manualWidth={manualWidth === "42px" ? "280px" : manualWidth}
      noBorder={false}
      type={showLanguageName ? undefined : "onlyIcon"}
      optionStyle={{ padding: "0 8px" }}
      isMobileView={isMobileView}
      withBlur={isMobileView}
      withLabel={!!withLabel}
      modernView={showLanguageName}
      usePortalBackdrop={usePortalBackdrop}
      withBackdrop={withBackdrop}
      shouldShowBackdrop={shouldShowBackdrop}
      dataTestId={dataTestId ?? "language-combobox"}
      role="combobox"
      aria-label="Select language"
      aria-haspopup="listbox"
      aria-controls="language-options"
    />
  );
};
export { LanguageCombobox };
