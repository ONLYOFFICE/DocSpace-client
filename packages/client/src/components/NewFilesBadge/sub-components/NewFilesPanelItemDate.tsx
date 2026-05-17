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

import { Text } from "@docspace/ui-kit/components/text";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { LANGUAGE } from "@docspace/shared/constants";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { NewFilesPanelItemDateProps } from "../NewFilesBadge.types";

export const NewFilesPanelItemDate = ({
  date,
  culture,
}: NewFilesPanelItemDateProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const getTitle = () => {
    const now = new Date();
    const enteredDate = new Date(date);

    if (now.setHours(0, 0, 0, 0) === enteredDate.setHours(0, 0, 0, 0)) {
      return t("Today");
    }

    now.setDate(now.getDate() - 1);

    if (now.getDate() === enteredDate.getDate()) {
      return t("Yesterday");
    }

    const locale = getCookie(LANGUAGE);

    const correctDate = getCorrectDate(
      locale ?? culture ?? "en",
      new Date(enteredDate.setHours(0, 0, 0, 0)),
    ).split(" ")[0];

    return correctDate;
  };

  const title = getTitle();

  return (
    <Text
      className="date-item"
      fontSize="14px"
      lineHeight="16px"
      fontWeight={600}
      color={isBase ? globalColors.gray : globalColors.grayDark}
    >
      {title}
    </Text>
  );
};
