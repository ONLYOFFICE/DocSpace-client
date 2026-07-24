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

import { makeAutoObservable, runInAction } from "mobx";
import copy from "copy-to-clipboard";

import {
  getDocsConnectInfo,
  startDocsConnectTrial,
  buyDocsConnectPlan,
  calculateDocsConnectDevPack,
  switchDocsConnectToDevPack,
  cancelDocsConnectPlan,
  cancelDocsConnectScheduledChange,
  updateDocsConnectConfig,
  startDocsConnectReport,
  getDocsConnectReportStatus,
} from "@docspace/shared/api/docs-connect";
import type {
  TDocsConnectInfo,
  TDocsConnectConfigUpdate,
} from "@docspace/shared/api/docs-connect/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  openStripeCheckout,
  pollUntil,
} from "@docspace/ui-kit/billing/utils/stripe-flow";
import type { TStripeCheckoutDeps } from "@docspace/ui-kit/billing/utils/stripe-flow";
import { DOCS_CONNECT } from "@docspace/ui-kit/billing/constants";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { Nullable, TTranslation } from "@docspace/shared/types";

import { isDocsConnectPaid } from "SRC_DIR/pages/PortalSettings/categories/developer-tools/DocsConnect/utils";

export type BuyPlanMode = "trial" | "edit";

class DocsConnectStore {
  settingsStore: Nullable<SettingsStore> = null;

  currentTariffStatusStore: Nullable<CurrentTariffStatusStore> = null;

  currentQuotaStore: Nullable<CurrentQuotasStore> = null;

  info: Nullable<TDocsConnectInfo> = null;

  isLoading: boolean = true;

  error: Nullable<Error> = null;

  buyPlanPanelVisible: boolean = false;

  getStartedVisible: boolean = false;

  buyPlanMode: BuyPlanMode = "trial";

  cancelPlanDialogVisible: boolean = false;

  removeSubscriptionDialogVisible: boolean = false;

  isReportGenerating: boolean = false;

  reportT: Nullable<TTranslation> = null;

  reportPageLeft: boolean = false;

  constructor(
    settingsStore: SettingsStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    currentQuotaStore: CurrentQuotasStore,
  ) {
    this.settingsStore = settingsStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.currentQuotaStore = currentQuotaStore;
    makeAutoObservable(this, {
      reportT: false,
      reportPageLeft: false,
    });
  }

  refreshPortalState = () => {
    this.currentTariffStatusStore?.fetchPortalTariff(true)?.catch(() => {});
    this.currentQuotaStore?.fetchPortalQuota(true)?.catch(() => {});
  };

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setError = (error: Nullable<Error>) => {
    this.error = error;
  };

  fetchInfo = async () => {
    const initialLoad = this.info == null;
    try {
      if (initialLoad) this.setIsLoading(true);
      this.setError(null);
      const info = await getDocsConnectInfo();
      runInAction(() => {
        this.info = info;
      });
    } catch (error) {
      toastr.error(error as Error);
      runInAction(() => {
        this.error = error as Error;
      });
    } finally {
      if (initialLoad) this.setIsLoading(false);
    }
  };

  openBuyPlan = (mode: BuyPlanMode) => {
    this.buyPlanMode = mode;
    this.buyPlanPanelVisible = true;
  };

  closeBuyPlan = () => {
    this.buyPlanPanelVisible = false;
  };

  openCancelPlanDialog = () => {
    this.cancelPlanDialogVisible = true;
  };

  closeCancelPlanDialog = () => {
    this.cancelPlanDialogVisible = false;
  };

  openRemoveSubscriptionDialog = () => {
    this.removeSubscriptionDialogVisible = true;
  };

  closeRemoveSubscriptionDialog = () => {
    this.removeSubscriptionDialogVisible = false;
  };

  openGetStarted = () => {
    this.getStartedVisible = true;
  };

  closeGetStarted = () => {
    this.getStartedVisible = false;
  };

  startTrial = async () => {
    const info = await startDocsConnectTrial();
    runInAction(() => {
      this.info = info;
    });
    this.refreshPortalState();
  };

  buyPlan = async ({
    users,
    devPack,
    topUp,
  }: {
    users: number;
    devPack: boolean;
    topUp?: number;
  }) => {
    const isPaid = this.info ? isDocsConnectPaid(this.info) : false;

    const info = await buyDocsConnectPlan({
      users,
      devPackEnabled: devPack,
      topUp,
      currentUsers:
        !isPaid || this.info?.deactivated
          ? 0
          : (this.info?.tenant.payment?.quantity ?? 0),
      currentDevPackEnabled: isPaid
        ? (this.info?.devPackEnabled ?? false)
        : false,
      currency: this.info?.wallet?.currency ?? "USD",
    });
    runInAction(() => {
      this.info = info;
    });
    this.closeBuyPlan();
    this.refreshPortalState();
  };

  buyPlanViaStripe = async ({
    users,
    devPack,
    topUp,
    totalMonthly,
    language,
    fetchCardLinked,
    signal,
  }: {
    users: number;
    devPack: boolean;
    topUp: number;
    totalMonthly: number;
    language: string;
    fetchCardLinked: TStripeCheckoutDeps["fetchCardLinked"];
    signal: AbortSignal;
  }) => {
    const isPaid = this.info ? isDocsConnectPaid(this.info) : false;
    const currentUsers =
      !isPaid || this.info?.deactivated
        ? 0
        : (this.info?.tenant.payment?.quantity ?? 0);
    const addUsers = Math.max(0, users - currentUsers);

    await openStripeCheckout(
      {
        walletCodeCurrency: this.info?.wallet?.currency ?? "USD",
        language,
        fetchCardLinked,
      },
      String(topUp),
      DOCS_CONNECT,
      {
        users: String(users),
        add: String(addUsers),
        price: String(totalMonthly),
        ...(devPack ? { devpack: "1" } : {}),
      },
    );

    await pollUntil(async () => {
      const payer = await this.currentTariffStatusStore?.fetchPayerInfo(true);
      return !!payer?.email;
    }, signal);

    await pollUntil(async () => {
      let info: Nullable<TDocsConnectInfo> = null;
      try {
        info = await getDocsConnectInfo(true);
      } catch {
        return false;
      }
      const activated =
        !!info &&
        isDocsConnectPaid(info) &&
        !info.deactivated &&
        (info.tenant.payment?.quantity ?? 0) >= users &&
        (!devPack || info.devPackEnabled === true);
      if (activated) {
        runInAction(() => {
          this.info = info;
        });
      }
      return activated;
    }, signal);

    if (signal.aborted) return false;

    this.closeBuyPlan();
    this.refreshPortalState();
    return true;
  };

  calculateDevPack = async (quantity: number) =>
    calculateDocsConnectDevPack(quantity);

  switchToDevPack = async ({
    quantity,
    topUp,
  }: {
    quantity: number;
    topUp?: number;
  }) => {
    const info = await switchDocsConnectToDevPack({
      quantity,
      topUp,
      currency: this.info?.wallet?.currency ?? "USD",
    });
    runInAction(() => {
      this.info = info;
    });
    this.closeBuyPlan();
    this.refreshPortalState();
  };

  cancelPlan = async () => {
    const info = await cancelDocsConnectPlan(
      this.info?.devPackEnabled ?? false,
    );
    runInAction(() => {
      this.info = info;
    });
    this.refreshPortalState();
  };

  cancelScheduledChange = async () => {
    const info = await cancelDocsConnectScheduledChange(
      this.info?.devPackEnabled ?? false,
    );
    runInAction(() => {
      this.info = info;
    });
    this.refreshPortalState();
  };

  updateConfig = async (data: TDocsConnectConfigUpdate) => {
    const config = await updateDocsConnectConfig(data);
    runInAction(() => {
      if (config && this.info) {
        this.info = { ...this.info, config };
      }
    });
  };

  private resetReportState = () => {
    this.reportT = null;
    this.reportPageLeft = false;
    runInAction(() => {
      this.isReportGenerating = false;
    });
  };

  private finishReport = (resultFileUrl?: string) => {
    const t = this.reportT;
    if (t) {
      toastr.success(
        t("Common:ReportSaveLocation", { sectionName: t("Common:Files") }),
      );
    }
    if (!this.reportPageLeft && resultFileUrl) {
      setTimeout(() => window.open(resultFileUrl, "_blank"), 100); // hack for ios
    }
    this.resetReportState();
  };

  markReportPageLeft = () => {
    if (this.isReportGenerating) this.reportPageLeft = true;
  };

  downloadReport = async (t: TTranslation) => {
    if (this.isReportGenerating) return;

    this.reportT = t;
    this.reportPageLeft = false;
    runInAction(() => {
      this.isReportGenerating = true;
    });

    const controller = new AbortController();

    try {
      let status = await startDocsConnectReport();

      if (!status?.isCompleted && !status?.error) {
        await pollUntil(async () => {
          status = await getDocsConnectReportStatus();
          return !!status?.isCompleted || !!status?.error;
        }, controller.signal);
      }

      if (status?.error) {
        toastr.error(status.error);
        this.resetReportState();
        return;
      }

      this.finishReport(status?.resultFileUrl);
    } catch (error) {
      toastr.error(error as Error);
      this.resetReportState();
    }
  };

  copyToClipboard = (value: string, t: TTranslation) => {
    if (!value) return;

    copy(value);
    toastr.success(t("Common:Copied"));
  };

  copySecretKey = (t: TTranslation) => {
    const secret = this.info?.config.security.secret;
    if (!secret) return;

    this.copyToClipboard(secret, t);
  };
}

export default DocsConnectStore;
