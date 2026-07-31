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

import { inject, observer } from "mobx-react";
import { TFunction } from "i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { NotificationsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";
import styles from "../Notifications.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type UsefulTipsContainerProps = {
  t: TFunction;
  changeSubscription?: TargetUserStore["changeSubscription"];
  usefulTipsSubscription?: TargetUserStore["usefulTipsSubscription"];
  textProps: Record<string, unknown>;
  textDescriptionsProps: Record<string, unknown>;
};

const UsefulTipsContainer = ({
  t,
  changeSubscription,
  usefulTipsSubscription,
  textProps,
  textDescriptionsProps,
}: UsefulTipsContainerProps) => {
  const onChangeEmailSubscription = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = e.currentTarget.checked;
    try {
      await changeSubscription?.(NotificationsType.UsefulTips, checked);
    } catch (err) {
      toastr.error(err as string);
    }
  };

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.row}>
        <Text {...textProps} className="subscription-title">
          {t("UsefulTips", { productName: getBrandName("ProductName") })}
        </Text>
        <ToggleButton
          className="useful-tips toggle-btn"
          onChange={onChangeEmailSubscription}
          isChecked={usefulTipsSubscription}
          dataTestId="useful_tips_toggle_button"
        />
      </div>
      <Text {...textDescriptionsProps}>
        {t("UsefulTipsDescription", { productName: getBrandName("ProductName") })}
      </Text>
    </div>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const { targetUserStore } = peopleStore;

  const { changeSubscription, usefulTipsSubscription } = targetUserStore!;

  return {
    changeSubscription,
    usefulTipsSubscription,
  };
})(observer(UsefulTipsContainer));
