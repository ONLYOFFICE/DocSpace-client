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

import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

import { getConstName } from "@docspace/shared/constants/consts";

import { FILE_TYPE_CATEGORIES, FILE_TYPE_EXTENSIONS } from "../constants";

import {
  CategorySubHeader,
  LabelGroup,
  ControlsSection,
  CheckboxGroup,
} from "../presets/StyledPresets";

export const FileTypesFilter = (props) => {
  const { t, config, setConfig } = props;

  const getSelectedExtensions = () => {
    return config.acceptExtensions ? config.acceptExtensions.split(",") : [];
  };

  const isCategorySelected = (category) => {
    const selectedExtensions = getSelectedExtensions();
    const categoryExtensions = FILE_TYPE_EXTENSIONS[category] || [];
    return categoryExtensions.every((ext) => selectedExtensions.includes(ext));
  };

  const onChangeCategoryCheckbox = (category) => {
    const selectedExtensions = getSelectedExtensions();
    const categoryExtensions = FILE_TYPE_EXTENSIONS[category] || [];
    const isSelected = isCategorySelected(category);

    let newExtensions;
    if (isSelected) {
      newExtensions = selectedExtensions.filter(
        (ext) => !categoryExtensions.includes(ext),
      );
    } else {
      const extensionsSet = new Set([
        ...selectedExtensions,
        ...categoryExtensions,
      ]);
      newExtensions = [...extensionsSet];
    }

    setConfig((oldConfig) => ({
      ...oldConfig,
      acceptExtensions: newExtensions.join(","),
      init: true,
    }));
  };

  return (
    <ControlsSection>
      <LabelGroup>
        <CategorySubHeader>{t("AvailableFileTypes")}</CategorySubHeader>
        <HelpButton
          offsetRight={0}
          size={12}
          place="right"
          tooltipContent={<Text fontSize="12px">{t("AllowedFileTypes")}</Text>}
          dataTestId="available_file_types_help_button"
        />
      </LabelGroup>
      <CheckboxGroup>
        {FILE_TYPE_CATEGORIES.map((category) => (
          <Checkbox
            key={category.key}
            className="checkbox"
            label={
              category.constLabelKey
                ? getConstName(category.constLabelKey)
                // biome-ignore lint/plugin/no-dynamic-i18n-key: labelKey literals on FILE_TYPE_CATEGORIES are captured by the locales scanner
                : t(category.labelKey)
            }
            onChange={() => onChangeCategoryCheckbox(category.key)}
            isChecked={isCategorySelected(category.key)}
            dataTestId={`${category.key}_checkbox`}
          />
        ))}
      </CheckboxGroup>
    </ControlsSection>
  );
};
