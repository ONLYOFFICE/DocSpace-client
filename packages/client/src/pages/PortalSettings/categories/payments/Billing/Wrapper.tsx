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

import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import Section from "@docspace/ui-kit/components/section";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { BillingRoot } from "@docspace/ui-kit/billing";

import PrivateRoute from "SRC_DIR/components/PrivateRouteWrapper";
import ErrorBoundary from "SRC_DIR/components/ErrorBoundaryWrapper";
import SectionWrapper from "SRC_DIR/components/Section";

import type { TPaymentUser } from "@docspace/ui-kit/billing/types";

import BillingHeader from "./BillingHeader";
import { PAYMENT_ROUTES } from "../utils";

interface WrapperProps {
  language?: string;
  logoText?: string;
  walletHelpUrl?: string;
  openOnNewPage?: boolean;
  user?: TPaymentUser;
}

const BillingWrapperComponent = ({
  language = "en",
  logoText,
  walletHelpUrl,
  openOnNewPage,
  user,
}: WrapperProps) => {
  const location = useLocation();

  const paymentConfig = useMemo(
    () => ({
      language,
      logoText,
      walletHelpUrl,
      user,
      openOnNewPage,
      routes: PAYMENT_ROUTES,
    }),
    [language, logoText, walletHelpUrl, user, openOnNewPage],
  );

  // Billing pages fetch their own data on mount (self-contained stores),
  // so the wrapper only needs to release the section transition animation.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
  }, [location.pathname]);

  return (
    <PrivateRoute>
      {/* @ts-expect-error ErrorBoundary props are injected from MobX stores */}
      <ErrorBoundary>
        <SectionWrapper withBodyScroll viewAs="settings" settingsStudio>
          <Section.SectionHeader>
            <BillingHeader />
          </Section.SectionHeader>

          <Section.SectionBody>
            <BillingRoot config={paymentConfig}>
              <Outlet />
            </BillingRoot>
          </Section.SectionBody>
        </SectionWrapper>
      </ErrorBoundary>
    </PrivateRoute>
  );
};

export const Component = inject(
  ({ settingsStore, authStore, userStore, filesSettingsStore }: TStore) => {
    const { logoText, walletHelpUrl } = settingsStore;
    const { user } = userStore;
    const { openOnNewPage } = filesSettingsStore;

    return {
      logoText,
      walletHelpUrl,
      openOnNewPage,
      language: authStore?.language,
      user: user
        ? {
            id: user.id,
            email: user.email,
            isOwner: user.isOwner,
          }
        : undefined,
    };
  },
)(observer(BillingWrapperComponent));
