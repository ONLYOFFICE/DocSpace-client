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

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { setLanguageForUnauthorized } from "@docspace/shared/utils/common";
import { LanguageCombobox } from "@docspace/shared/components/language-combobox";
import { Nullable } from "@docspace/shared/types";
import { TPortalCultures } from "@docspace/shared/api/settings/types";
import { classNames } from "@docspace/shared/utils";

type TLanguageComboboxWrapper = {
  initialCultures?: TPortalCultures;
  className?: string;
  isMobileView?: boolean;
};

const LanguageComboboxWrapper = ({
  initialCultures,
  className,
  isMobileView = false,
}: TLanguageComboboxWrapper) => {
  const { i18n } = useTranslation(["Login", "Common"]);
  const currentCulture = i18n.language;

  const [cultures, setCultures] = useState<Nullable<TPortalCultures>>(
    initialCultures || null,
  );

  useEffect(() => {
    if (initialCultures) setCultures(initialCultures);
  }, [initialCultures]);

  const onLanguageSelect = (culture: { key: string }) => {
    const { key } = culture;

    setLanguageForUnauthorized(key);
  };

  if (!cultures) return null;

  return (
    <LanguageCombobox
      className={classNames("language-combo-box", className)}
      onSelectLanguage={onLanguageSelect}
      cultures={cultures}
      selectedCulture={currentCulture}
      withBorder={!isMobileView}
      isMobileView={isMobileView}
      showLanguageName={!isMobileView}
    />
  );
};
export default LanguageComboboxWrapper;
