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
import { withTranslation } from "react-i18next";
import { FC, useEffect } from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  LanguageCombobox,
  TCulture,
} from "@docspace/shared/components/language-combobox";

import { type LanguageFilterProps } from "./LanguageFilter.types";
import { LANGUAGE_CULTURE_MAP } from "../../constants";

const convertToCulture = (key: string) => {
  return LANGUAGE_CULTURE_MAP[key] ?? key;
};

const getOformLocaleByIndex = (index: number, array: string[]) => {
  return array[index];
};

const LanguageFilter: FC<LanguageFilterProps> = ({
  oformLocales,
  filterOformsByLocale,
  filterOformsByLocaleIsLoading,
  setLanguageFilterLoaded,
  categoryFilterLoaded,
  languageFilterLoaded,
  oformsLocal,
  isShowInitSkeleton,
  viewMobile,
  isLanguageFilterChange,
  setIsLanguageFilterChange,
}) => {
  const onFilterByLocale = async (newLocale: TCulture) => {
    if (typeof newLocale.index !== "number" || !oformLocales) return;
    setIsLanguageFilterChange(true);
    const key = getOformLocaleByIndex(newLocale.index, oformLocales);

    await filterOformsByLocale(key);

    const sectionScroll = document.querySelector(
      "#scroll-template-gallery .scroll-wrapper > .scroller",
    );
    if (sectionScroll) sectionScroll.scrollTop = 0;
  };

  useEffect(() => {
    setLanguageFilterLoaded(
      Boolean(oformLocales && oformLocales?.length !== 0),
    );
  }, [oformLocales, oformLocales?.length, setLanguageFilterLoaded]);

  useEffect(() => {
    if (!isLanguageFilterChange) return;
    if (
      categoryFilterLoaded &&
      languageFilterLoaded &&
      !filterOformsByLocaleIsLoading
    )
      setIsLanguageFilterChange(false);
  }, [
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    isLanguageFilterChange,
  ]);

  if (
    (isShowInitSkeleton ||
      filterOformsByLocaleIsLoading ||
      !(categoryFilterLoaded && languageFilterLoaded)) &&
    !isLanguageFilterChange
  ) {
    return <RectangleSkeleton width="41px" height="32px" />;
  }

  const convertedLocales =
    oformLocales?.map((item) => convertToCulture(item)) || [];

  return (
    <LanguageCombobox
      cultures={convertedLocales}
      onSelectLanguage={onFilterByLocale}
      selectedCulture={convertToCulture(oformsLocal)}
      id="comboBoxLanguage"
      isMobileView={viewMobile}
      withBackdrop={viewMobile}
      usePortalBackdrop={viewMobile}
      shouldShowBackdrop={viewMobile}
      isDisabled={isLanguageFilterChange}
    />
  );
};

export default withTranslation(["Common"])(LanguageFilter);
