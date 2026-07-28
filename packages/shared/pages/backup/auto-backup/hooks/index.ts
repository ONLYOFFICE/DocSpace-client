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

import { Info } from "luxon";
import { useMemo } from "react";

import type { TTranslation } from "../../../../types";

export const useDefaultOptions = (t: TTranslation, language: string) => {
  const maxNumberCopiesArray = useMemo(() => {
    return Array(30)
      .fill(null)
      .map((_, index) => ({
        key: `${index + 1}`,
        label: `${t("Common:MaxCopies", { copiesCount: index + 1 })}`,
      }));
  }, [t]);

  const periodsObject = useMemo(
    () => [
      {
        key: 0,
        label: t("Common:EveryDay"),
      },
      {
        key: 1,
        label: t("Common:EveryWeek"),
      },
      {
        key: 2,
        label: t("Common:EveryMonth"),
      },
    ],
    [t],
  );

  const weekdaysLabelArray = useMemo(() => {
    const gettingWeekdays = Info.weekdays("long", { locale: language });
    const temp = [];

    const isEnglishLanguage = language === "en";

    const shift = isEnglishLanguage ? 1 : 0;

    for (let item = 0; item < gettingWeekdays.length; item += 1) {
      const index = (shift + item) % gettingWeekdays.length;

      temp.push({
        key: `${index + 1}`,
        label: `${gettingWeekdays[index]}`,
      });
    }

    return temp;
  }, [language]);

  return { maxNumberCopiesArray, weekdaysLabelArray, periodsObject };
};
