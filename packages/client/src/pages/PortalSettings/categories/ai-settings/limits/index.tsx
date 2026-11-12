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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { BillingRoot } from "@onlyoffice/apps-ui-kit/billing";
import ServiceLimits from "@onlyoffice/apps-ui-kit/billing/shared/service-limits";
import type { TPaymentUser } from "@onlyoffice/apps-ui-kit/billing/types";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import config from "PACKAGE_FILE";
import { PEOPLE_ROUTE } from "SRC_DIR/helpers/contacts/constants";

import { PAYMENT_ROUTES } from "../../payments/utils";

type AILimitsProps = {
  language?: string;
  logoText?: string;
  user?: TPaymentUser;
  openOnNewPage?: boolean;
};

const AILimits = ({
  language = "en",
  logoText,
  user,
  openOnNewPage,
}: AILimitsProps) => {
  const navigate = useNavigate();

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

  const onOpenContacts = () => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/${PEOPLE_ROUTE}`,
      ),
    );
  };

  return (
    <BillingRoot config={paymentConfig}>
      <ServiceLimits onOpenContacts={onOpenContacts} />
    </BillingRoot>
  );
};

export default inject(
  ({ settingsStore, authStore, userStore, filesSettingsStore }: TStore) => {
    const { language } = authStore;
    const { user } = userStore;
    const { logoText } = settingsStore;
    const { openOnNewPage } = filesSettingsStore;

    return {
      language,
      logoText,
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
)(observer(AILimits));
