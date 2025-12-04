// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { QuotaForm } from "@docspace/shared/components/quota-form";

import { StyledBaseQuotaComponent } from "../StyledComponent";

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
    <StyledBaseQuotaComponent isDisabled={isDisabled}>
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
    </StyledBaseQuotaComponent>
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
