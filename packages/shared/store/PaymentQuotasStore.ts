// (c) Copyright Ascensio System SIA 2009-2024
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

import { makeAutoObservable, runInAction } from "mobx";
import api from "../api";
import { TPaymentFeature, TPaymentQuota } from "../api/portal/types";
import { MANAGER, TOTAL_SIZE } from "../constants";
import { Nullable } from "../types";

class PaymentQuotasStore {
  portalPaymentQuotas: Nullable<TPaymentQuota> = null;

  portalPaymentQuotasFeatures: TPaymentFeature[] = [];

  isLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get planCost() {
    if (this.portalPaymentQuotas?.price) return this.portalPaymentQuotas.price;
    return { value: 0, currencySymbol: "" };
  }

  get stepAddingQuotaManagers() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === MANAGER,
    );
    return result?.value;
  }

  get stepAddingQuotaTotalSize() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );
    return result?.value;
  }

  get tariffTitle() {
    return this.portalPaymentQuotas?.title;
  }

  get usedTotalStorageSizeTitle() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );
    return result?.priceTitle;
  }

  get addedManagersCountTitle() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === MANAGER,
    );
    return result?.priceTitle;
  }

  get tariffPlanTitle() {
    return this.portalPaymentQuotas?.title;
  }

  setPortalPaymentQuotas = async () => {
    if (this.isLoaded) return;

    const res = await api.portal.getPortalPaymentQuotas();

    if (!res) return;

    runInAction(() => {
      [this.portalPaymentQuotas] = res;

      this.portalPaymentQuotasFeatures = res[0].features;
    });

    this.setIsLoaded(true);
  };
}

export { PaymentQuotasStore };
