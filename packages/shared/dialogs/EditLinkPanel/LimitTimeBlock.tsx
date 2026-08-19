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

import { type FC, useId } from "react";
import { useTranslation } from "react-i18next";
import type { DateTime } from "luxon";

import { DateTimePicker } from "@docspace/ui-kit/components/date-time-picker";
import { subtractFromDate, now } from "@docspace/ui-kit/utils/date";

import ToggleBlock from "./ToggleBlock";
import type { LimitTimeBlockProps } from "./EditLinkPanel.types";
import styles from "./EditLinkPanel.module.scss";
import { getConstName } from "@docspace/shared/constants/consts";

const LimitTimeBlock: FC<LimitTimeBlockProps> = (props) => {
  const id = useId();

  const {
    expirationDate,
    setExpirationDate,
    setIsExpired,
    isExpired,
    language,
    canChangeLifetime,
    headerText,
    bodyText,
  } = props;

  const { t } = useTranslation(["Common"]);

  const onChange = (date: DateTime | null) => {
    const expired = date
      ? date.toJSDate().getTime() <= new Date().getTime()
      : false;

    setExpirationDate(date?.toJSDate().toISOString() ?? null);
    setIsExpired(expired);
  };

  if (!canChangeLifetime) {
    return (
      <ToggleBlock
        withToggle={false}
        bodyText={bodyText}
        headerText={headerText}
        isExpired={isExpired}
      />
    );
  }

  const minDate = subtractFromDate(now(), 1, "days")!;

  return (
    <ToggleBlock {...props} withToggle={false}>
      <DateTimePicker
        id={id}
        locale={language}
        minDate={minDate}
        hasError={false}
        onChange={onChange}
        openDate={new Date()}
        initialDate={expirationDate}
        className={styles.datePicker}
        selectDateText={t("Common:SelectDate")}
        dataTestId="edit_link_panel_date_time_picker"
        useMaxTime
        translations={{ AM: t("Common:AM"), PM: getConstName("PM") }}
      />
    </ToggleBlock>
  );
};

export default LimitTimeBlock;
