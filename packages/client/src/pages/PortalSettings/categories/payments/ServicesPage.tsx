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

import { inject, observer } from "mobx-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";

import { BillingRoot } from "@docspace/ui-kit/billing";
import { default as AiPage } from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPage";
import { default as BackupPage } from "@docspace/ui-kit/billing/services/pages/backup/BackupPage";
import { default as AdditionalStoragePage } from "@docspace/ui-kit/billing/services/pages/additional-storage/AdditionalStoragePage";
import type { TPaymentUser } from "@docspace/ui-kit/billing/types";
import { PAYMENT_ROUTES } from "./utils";

interface ServicesPageProps {
  language?: string;
  logoText?: string;
  user?: TPaymentUser;
  openOnNewPage?: boolean;
  getAIConfig?: () => Promise<void>;
  fetchPayerInfo?: () => Promise<void>;
}

const ServicesPage = (props: ServicesPageProps) => {
  const {
    language = "en",
    logoText,
    user,
    openOnNewPage,
    getAIConfig,
    fetchPayerInfo,
  } = props;
  const location = useLocation();
  useEffect(() => {
    fetchPayerInfo?.();
  }, [fetchPayerInfo]);

  const paymentConfig = useMemo(
    () => ({
      language,
      logoText,
      user,
      openOnNewPage,
      routes: PAYMENT_ROUTES,
    }),
    [language, logoText, user, openOnNewPage],
  );

  const pathname = location.pathname;

  return (
    <BillingRoot config={paymentConfig}>
      {pathname.includes("ai-services") ? (
        <AiPage getAIConfig={getAIConfig} />
      ) : null}
      {pathname.includes("backup") ? <BackupPage /> : null}
      {pathname.includes("disk-storage") ? <AdditionalStoragePage /> : null}
    </BillingRoot>
  );
};

export const Component = inject(
  ({
    settingsStore,
    authStore,
    userStore,
    currentTariffStatusStore,
    filesSettingsStore,
  }: TStore) => {
    const { language } = authStore;
    const { user } = userStore;
    const { logoText, getAIConfig } = settingsStore;
    const { fetchPayerInfo } = currentTariffStatusStore;
    const { openOnNewPage } = filesSettingsStore;

    return {
      language,
      logoText,
      getAIConfig,
      fetchPayerInfo,
      openOnNewPage,
      user: user
        ? {
            id: user.id,
            email: user.email,
            isOwner: user.isOwner,
          }
        : undefined,
    };
  },
)(observer(ServicesPage));

