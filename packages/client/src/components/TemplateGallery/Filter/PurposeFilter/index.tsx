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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { ComboBox } from "@docspace/ui-kit/components/combobox";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./PurposeFilter.module.scss";
import type { PurposeFilterProps } from "./PurposeFilter.types";

const ALL_PURPOSES = "all-purposes";

const PurposeFilter: React.FC<PurposeFilterProps> = ({
  t,
  purposes,
  currentPurpose,
  filterOformsByPurpose,
  filterOformsByLocaleIsLoading,
  categoryFilterLoaded,
  languageFilterLoaded,
  isShowInitSkeleton,
  isLanguageFilterChange,
}) => {
  const onSelect = (option: TOption) => {
    const purpose = option.key === ALL_PURPOSES ? "" : String(option.key);
    if (purpose !== currentPurpose) filterOformsByPurpose(purpose);
  };

  if (
    (isShowInitSkeleton ||
      filterOformsByLocaleIsLoading ||
      !(categoryFilterLoaded && languageFilterLoaded)) &&
    !isLanguageFilterChange
  )
    return <RectangleSkeleton className={styles.skeleton} />;

  // The purposes come from the CMS: without them there is nothing to switch
  // between, and the gallery keeps showing the whole catalog.
  if (purposes.length < 2) return null;

  const allOption: TOption = {
    key: ALL_PURPOSES,
    label: t("Common:All"),
  };

  const options: TOption[] = [
    allOption,
    ...purposes.map((purpose) => ({
      key: purpose.key,
      label: purpose.name,
    })),
  ];

  const selectedOption =
    options.find((option) => option.key === currentPurpose) ?? allOption;

  return (
    <ComboBox
      id="comboBoxPurpose"
      className={styles.purposeFilter}
      tabIndex={1}
      onSelect={onSelect}
      options={options}
      selectedOption={selectedOption}
      isDisabled={isLanguageFilterChange}
      disableIconClick={isLanguageFilterChange}
      disableItemClick={isLanguageFilterChange}
      isDefaultMode={false}
      directionX="right"
      directionY="both"
      fixedDirection
      displaySelectedOption
      displayArrow
      showDisabledItems
      scaledOptions
      scaled
      size="content"
      withoutBackground
      withBackdrop
    />
  );
};

export default inject<TStore>(({ oformsStore }) => ({
  purposes: oformsStore.purposes,
  currentPurpose: oformsStore.oformsFilter.purpose,
  filterOformsByPurpose: oformsStore.filterOformsByPurpose,
}))(withTranslation(["Common"])(observer(PurposeFilter)));
