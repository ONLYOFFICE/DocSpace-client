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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import api from "@docspace/shared/api";
import type { TUserServiceLimit } from "@docspace/shared/api/people/types";
import { formatAiAmount } from "@docspace/shared/utils/common";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@onlyoffice/apps-ui-kit/components/combobox";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { changeUserAILimit, type TAILimitUser } from "SRC_DIR/helpers/contacts";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import styles from "../SpaceQuota/space-quota.module.scss";

const getPeriodLabel = (
  t: (key: string) => string,
  period: TUserServiceLimit["period"],
) => {
  switch (period) {
    case "Week":
      return t("Common:LimitPerWeek");
    case "Month":
      return t("Common:LimitPerMonth");
    case "Lifetime":
      return t("Common:LimitLifetime");
    default:
      return t("Common:LimitPerDay");
  }
};

const CHANGE_KEY = "change-limit";
const CURRENT_KEY = "current-limit";
const DEFAULT_KEY = "default-limit";

type AILimitOwnProps = {
  item: TAILimitUser;
  className?: string;
  isReadOnly?: boolean;
  dataTestId?: string;
};

type AILimitInjectedProps = {
  refreshUser?: UsersStore["refreshUser"];
};

type AILimitProps = AILimitOwnProps & AILimitInjectedProps;

const AILimit = ({
  item,
  className,
  isReadOnly,
  dataTestId,
  refreshUser,
}: AILimitProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const [isLoading, setIsLoading] = useState(false);

  const limit = item.aiServicesLimit;
  const currency = limit?.currency;

  const format = (amount: number) =>
    formatAiAmount(i18n.language, amount, currency);

  const spent =
    limit && currency ? format(limit.usage?.amountConsumed ?? 0) : "";

  const current =
    limit && currency && limit.amountValue !== null
      ? `${format(limit.amountValue)} ${getPeriodLabel(t, limit.period)}`
      : t("Common:Unlimited");

  const options: TOption[] = [
    { key: CHANGE_KEY, label: t("Common:ChangeAILimit") },
    { key: CURRENT_KEY, label: current },
  ];

  if (limit?.scope === "Custom") {
    options.push({ key: DEFAULT_KEY, label: t("Common:SetToDefault") });
  }

  const onSelect = async (option: TOption) => {
    if (option.key === CHANGE_KEY) {
      changeUserAILimit([item]);
      return;
    }

    if (option.key !== DEFAULT_KEY || !limit) return;

    setIsLoading(true);

    try {
      await api.portal.deleteServiceLimit(limit.id);
      await refreshUser?.(item.id);
      toastr.success(t("Common:AILimitReset"));
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!limit) return null;

  if (isReadOnly) {
    return (
      <Text
        fontWeight={600}
        className={classNames(styles.text, styles.withoutPadding)}
      >
        {spent ? `${spent} / ${current}` : current}
      </Text>
    );
  }

  return (
    <div
      className={classNames(styles.body, className)}
      data-testid={dataTestId}
    >
      {spent ? <Text fontWeight={600}>{spent} / </Text> : null}
      <ComboBox
        className={classNames(styles.comboBoxSpaceQuota, {
          [styles.loading]: isLoading,
        })}
        selectedOption={options[1]}
        options={options.filter((option) => option.key !== CURRENT_KEY)}
        onSelect={onSelect}
        scaled={false}
        size={ComboBoxSize.content}
        modernView
        isLoading={isLoading}
        manualWidth="auto"
        directionY="both"
      />
    </div>
  );
};

export default inject(({ peopleStore }: TStore) => ({
  refreshUser: peopleStore.usersStore!.refreshUser,
}))(observer(AILimit));
