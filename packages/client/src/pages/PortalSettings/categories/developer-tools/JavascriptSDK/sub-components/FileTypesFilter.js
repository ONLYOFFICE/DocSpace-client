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
