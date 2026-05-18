// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { MemoryRouter } from "react-router";

import { BillingRoot } from "@docspace/ui-kit/billing";
import AiPaywallPage from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPaywallPage";
import AiPageLoader from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPageLoader";
import { useServicesStore } from "@docspace/ui-kit/billing/store/ServicesStoreProvider";
import { AI_TOOLS, AI_ENUM } from "@docspace/ui-kit/billing/constants";
import type { TPaymentConfig } from "@docspace/ui-kit/billing/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useFormsUserStore } from "../../../_store/FormsUserStore";
import { useFormsTourStore } from "../../../_store/FormsTourStore";

import styles from "./SettingsPanel.module.scss";

import AiBillingDashboard from "./AiBillingDashboard";

const PAYMENT_CALLBACK_PATH = "/billing/payment-complete";

type RenderTarget = "loading" | "paywall" | "dashboard";

const AiBillingContent = observer(
  ({ integrationUrl }: { integrationUrl?: string }) => {
    const { t } = useTranslation();
    const servicesStore = useServicesStore();

    const [renderTarget, setRenderTarget] =
      React.useState<RenderTarget>("loading");

    React.useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const hadTopUp = await servicesStore.aiPaywallInit(t);

          if (cancelled) return;

          if (hadTopUp) {
            await servicesStore.initServiceData(
              t,
              AI_TOOLS,
              AI_ENUM,
              integrationUrl,
            );

            if (cancelled) return;
            setRenderTarget("dashboard");
          } else {
            setRenderTarget("paywall");
          }
        } catch (e) {
          console.error("[ai-billing-content] bootstrap failed", e);
          if (!cancelled) {
            toastr.error(t("UnexpectedError"));
            setRenderTarget("paywall");
          }
        }
      })();

      return () => {
        cancelled = true;
      };
      // integrationUrl is derived from window.location.origin and is stable
      // across the component's lifetime; bootstrap intentionally runs once on mount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPaywallCompleted = React.useCallback(() => {
      setRenderTarget("dashboard");
    }, []);

    if (renderTarget === "loading") {
      return <AiPageLoader />;
    }

    if (renderTarget === "dashboard") {
      return <AiBillingDashboard integrationUrl={integrationUrl} />;
    }

    return (
      <AiPaywallPage
        integrationUrl={integrationUrl}
        onCompleted={onPaywallCompleted}
      />
    );
  },
);

const BillingForm = () => {
  const { i18n } = useTranslation();
  const { user } = useFormsUserStore();
  const tourStore = useFormsTourStore();

  const billingConfig = React.useMemo<TPaymentConfig>(
    () => ({
      language: i18n.language || "en",
      user: user
        ? {
            id: user.id,
            email: user.email,
            isOwner: user.isOwner,
          }
        : undefined,
    }),
    [i18n.language, user],
  );

  const integrationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PAYMENT_CALLBACK_PATH}`
      : undefined;

  return (
    <div className={styles.billingWrapper}>
      {!tourStore.showMockItems && (
        <MemoryRouter>
          <BillingRoot config={billingConfig}>
            <div className={styles.billingContent}>
              <AiBillingContent integrationUrl={integrationUrl} />
            </div>
          </BillingRoot>
        </MemoryRouter>
      )}
    </div>
  );
};

export default observer(BillingForm);

