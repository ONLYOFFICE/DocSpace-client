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

import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

import api from "../api";
import {
  TPaymentFeature,
  TPaymentQuota,
  TBooleanPaymentFeature,
} from "../api/portal/types";
import { MANAGER, TOTAL_SIZE, YEAR_KEY } from "../constants";
import { Nullable } from "../types";
import { CurrentQuotasStore } from "./CurrentQuotaStore";
import { SettingsStore } from "./SettingsStore";

type QuotaId = string | number;

type QuotaWithFeatureMap = TPaymentQuota & {
  featuresMap: Map<string, TPaymentFeature>;
};

const transformQuotaFeatures = (quota: TPaymentQuota): QuotaWithFeatureMap => {
  return {
    ...quota,
    featuresMap: new Map(
      quota.features.map((feature) => [feature.id, feature]),
    ),
  };
};

const createQuotasMap = (quotas: TPaymentQuota[]) => {
  return new Map<QuotaId, QuotaWithFeatureMap>(
    quotas.map((quota) => [quota.id, transformQuotaFeatures(quota)]),
  );
};

const createYearQuotasMap = (quotasById: Map<QuotaId, QuotaWithFeatureMap>) => {
  return new Map(
    Array.from(quotasById.values()).map((quota) => {
      const yearFeature = quota.featuresMap.get(
        YEAR_KEY,
      ) as TBooleanPaymentFeature;

      return [yearFeature?.value, quota];
    }),
  );
};

const findQuotaByYear = (
  yearValue: boolean,
  quotasByYear: Map<boolean, QuotaWithFeatureMap>,
) => {
  const quota = quotasByYear.get(yearValue);

  return {
    quota,
    featuresMap: quota?.featuresMap ?? new Map(),
  };
};

const getCurrentQuota = (
  isFreeTariff: boolean | undefined,
  currentQuotaId: QuotaId | undefined,
  quotasById: Map<QuotaId, QuotaWithFeatureMap>,
  quotasByYear: Map<boolean, QuotaWithFeatureMap>,
) => {
  if (isFreeTariff) {
    return findQuotaByYear(false, quotasByYear);
  }

  if (currentQuotaId) {
    const currentQuota = quotasById.get(currentQuotaId);

    if (currentQuota) {
      return {
        quota: currentQuota,
        featuresMap: currentQuota.featuresMap,
      };
    }
  }

  return findQuotaByYear(true, quotasByYear);
};

class PaymentQuotasStore {
  portalPaymentQuotas: Nullable<TPaymentQuota> = null;

  portalPaymentQuotasFeatures: Map<string, TPaymentFeature> = new Map();

  isLoaded = false;

  private currentQuotaStore: CurrentQuotasStore;

  private settingsStore: SettingsStore;

  constructor(
    currentQuotaStore: CurrentQuotasStore,
    settingsStore: SettingsStore,
  ) {
    makeAutoObservable(this);
    this.currentQuotaStore = currentQuotaStore;
    this.settingsStore = settingsStore;
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get planCost() {
    if (this.portalPaymentQuotas?.price) return this.portalPaymentQuotas.price;
    return { value: 0, currencySymbol: "" };
  }

  get stepAddingQuotaManagers() {
    return this.portalPaymentQuotasFeatures.get(MANAGER)?.value;
  }

  get stepAddingQuotaTotalSize() {
    return this.portalPaymentQuotasFeatures.get(TOTAL_SIZE)?.value;
  }

  get tariffTitle() {
    return this.portalPaymentQuotas?.title;
  }

  get usedTotalStorageSizeTitle() {
    return this.portalPaymentQuotasFeatures.get(TOTAL_SIZE)?.priceTitle;
  }

  get addedManagersCountTitle() {
    return this.portalPaymentQuotasFeatures.get(MANAGER)?.priceTitle;
  }

  get tariffPlanTitle() {
    return this.portalPaymentQuotas?.title;
  }

  setPortalPaymentQuotas = async () => {
    if (this.isLoaded) return;
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await api.portal.getPortalPaymentQuotas(
        abortController.signal,
      );
      if (!res) return;

      const { isFreeTariff, currentQuotaId } = this.currentQuotaStore;

      const quotasById = createQuotasMap(res);
      const quotasByYear = createYearQuotasMap(quotasById);

      runInAction(() => {
        const result = getCurrentQuota(
          isFreeTariff,
          currentQuotaId,
          quotasById,
          quotasByYear,
        );

        this.portalPaymentQuotas = result?.quota || null;
        this.portalPaymentQuotasFeatures = result?.featuresMap || new Map();
      });

      this.setIsLoaded(true);
    } catch (error) {
      if (axios.isCancel(error)) return;
      throw error;
    }
  };
}

export { PaymentQuotasStore };
