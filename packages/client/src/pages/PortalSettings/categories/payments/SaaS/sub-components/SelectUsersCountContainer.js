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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedSize } from "@docspace/shared/utils/common";
import QuantityPicker from "@docspace/shared/components/quantity-picker";

let formattedSizeTitle = null;
const SelectUsersCountContainer = ({
  managersCount,
  isDisabled,
  isLoading,
  minAvailableManagersValue,
  isAlreadyPaid,
  maxAvailableManagersCount,
  setManagersCount,
  setTotalPrice,
  isLessCountThanAcceptable,
  step,
  addedManagersCountTitle,
  isNeedPlusSign,
  allowedStorageSizeByQuota,
  usedTotalStorageSizeTitle,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const sizeValue = getConvertedSize(t, allowedStorageSizeByQuota);
  formattedSizeTitle = `${usedTotalStorageSizeTitle}: ${sizeValue}${isNeedPlusSign ? "+" : ""}`;

  const onChangeNumber = (value) => {
    setManagersCount(value);
    setTotalPrice(value);
  };

  const isUpdatingTariff = isLoading && isAlreadyPaid;

  return (
    <QuantityPicker
      className="select-users-count-container"
      value={
        isLessCountThanAcceptable ? minAvailableManagersValue : managersCount
      }
      minValue={minAvailableManagersValue}
      maxValue={maxAvailableManagersCount}
      step={step}
      title={addedManagersCountTitle}
      subtitle={formattedSizeTitle}
      showPlusSign
      isDisabled={isDisabled || isUpdatingTariff}
      onChange={onChangeNumber}
      showSlider
    />
  );
};

export default inject(({ paymentQuotasStore, paymentStore }) => {
  const {
    isLoading,
    minAvailableManagersValue,
    managersCount,
    maxAvailableManagersCount,
    setManagersCount,
    setTotalPrice,
    isLessCountThanAcceptable,
    stepByQuotaForManager,
    isAlreadyPaid,
    allowedStorageSizeByQuota,
  } = paymentStore;
  const { addedManagersCountTitle, usedTotalStorageSizeTitle } =
    paymentQuotasStore;

  return {
    isAlreadyPaid,
    isLoading,
    minAvailableManagersValue,
    managersCount,
    maxAvailableManagersCount,
    setManagersCount,
    setTotalPrice,
    isLessCountThanAcceptable,
    step: stepByQuotaForManager,
    addedManagersCountTitle,
    allowedStorageSizeByQuota,
    usedTotalStorageSizeTitle,
  };
})(observer(SelectUsersCountContainer));
