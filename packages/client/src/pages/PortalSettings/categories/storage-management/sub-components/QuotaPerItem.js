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

import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { QuotaForm } from "@docspace/shared/components/quota-form";

import styles from "../StyledComponent.module.scss";

let timerId = null;
const QuotaPerItemComponent = (props) => {
  const {
    isDisabled,
    saveQuota,
    disableQuota,
    toggleLabel,
    formLabel,
    updateQuotaInfo,
    initialSize,
    isQuotaSet,
    type,

    tabIndex,
    dataTestId,
    toggleDescription,
  } = props;

  const [isToggleChecked, setIsToggleChecked] = useState(isQuotaSet);

  const [isLoading, setIsLoading] = useState(false);

  const quotaFormRef = useRef(null);

  useEffect(() => {
    if (isToggleChecked && quotaFormRef.current) {
      quotaFormRef.current?.focus();
    }
  }, [isToggleChecked]);

  const onToggleChange = async (e) => {
    const { checked } = e.currentTarget;

    setIsToggleChecked(checked);

    if (checked) return;

    setIsLoading(true);

    if (!isQuotaSet) {
      setIsLoading(false);
      return;
    }

    await disableQuota();
    await updateQuotaInfo(type);

    setIsLoading(false);
  };

  const onSaveQuota = async (size) => {
    timerId = setTimeout(() => setIsLoading(true), 200);

    await saveQuota(size);
    await updateQuotaInfo(type);

    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
  };

  const onCancel = () => {
    !isQuotaSet && setIsToggleChecked(false);
  };

  return (
    <div
      className={`${styles.baseQuotaComponent}${isDisabled ? ` ${styles.disabled}` : ""}`}
    >
      <div className="toggle-container">
        <ToggleButton
          fontWeight={600}
          fontSize="14px"
          className="quotas_toggle-button"
          label={toggleLabel}
          onChange={onToggleChange}
          isChecked={isToggleChecked}
          isDisabled={isDisabled || isLoading}
          dataTestId={dataTestId ? `${dataTestId}_button` : undefined}
        />
        <Text className="toggle_label" fontSize="12px">
          {toggleDescription}
        </Text>
        {isToggleChecked ? (
          <QuotaForm
            ref={quotaFormRef}
            isButtonsEnable
            label={formLabel}
            maxInputWidth="214px"
            isLoading={isLoading}
            isDisabled={isDisabled}
            onSave={onSaveQuota}
            onCancel={onCancel}
            initialSize={initialSize}
            tabIndex={tabIndex}
            dataTestId={dataTestId ? `${dataTestId}_form` : undefined}
          />
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ currentQuotaStore, storageManagement }, { type }) => {
  const { setUserQuota } = currentQuotaStore;
  const { isStatisticsAvailable } = currentQuotaStore;

  const { updateQuotaInfo } = storageManagement;

  return {
    setUserQuota,
    isDisabled: !isStatisticsAvailable,
    updateQuotaInfo,
  };
})(observer(QuotaPerItemComponent));
