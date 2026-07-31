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

import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import Section from "@docspace/ui-kit/components/section";
import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import PrivateRoute from "SRC_DIR/components/PrivateRouteWrapper";
import ErrorBoundary from "SRC_DIR/components/ErrorBoundaryWrapper";
import SectionWrapper from "SRC_DIR/components/Section";

import DeveloperToolsHeader from "./DeveloperToolsHeader";
import HistoryHeader from "./Webhooks/WebhookHistory/sub-components/HistoryHeader";
import DetailsNavigationHeader from "./Webhooks/WebhookEventDetails/sub-components/DetailsNavigationHeader";
import OAuthSectionHeader from "./OAuth/OAuthSectionHeader";
import useDeveloperTools from "./useDeveloperTools";
import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

interface WrapperProps {
  settingsStore?: TStore["settingsStore"];
  webhooksStore?: TStore["webhooksStore"];
  oauthStore?: TStore["oauthStore"];
}

const getSection = (pathname: string) => {
  const match = pathname.match(/\/developer-tools\/([^/]+)/);
  return match ? match[1] : "";
};

const DeveloperToolsWrapperComponent = observer(
  ({ settingsStore, webhooksStore, oauthStore }: WrapperProps) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const prevSectionRef = useRef<string>("");

    const defaultProps = createDefaultHookSettingsProps({
      settingsStore,
      webhooksStore,
      oauthStore,
    });

    const { getDeveloperToolsInitialValue } = useDeveloperTools(
      defaultProps.developerTools,
    );

    useEffect(() => {
      const currentSection = getSection(location.pathname);
      const previousSection = prevSectionRef.current;

      prevSectionRef.current = currentSection;

      if (previousSection && currentSection === previousSection) {
        return;
      }

      const loadData = async () => {
        setIsLoading(true);
        try {
          settingsStore?.clearAbortControllerArr();
          await getDeveloperToolsInitialValue();
        } catch (error) {
          if (
            error instanceof Error &&
            (error.name === "CanceledError" || error.message === "canceled")
          ) {
            return;
          }
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [location.pathname]);

    useEffect(() => {
      if (!isLoading) {
        window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
      }
    }, [isLoading]);

    const currentPath = location.pathname;
    const segments = currentPath.split("/").filter(Boolean);
    // segments: ["developer-tools", section, ...rest]
    const section = segments[1] ?? "";
    const depth = segments.length;

    const isWebhookHistory = section === "webhooks" && depth === 3;
    const isWebhookDetails = section === "webhooks" && depth === 4;
    const isOAuthForm = section === "oauth" && depth === 3;
    const isOAuthEdit = isOAuthForm && !currentPath.endsWith("/create");

    return (
      <PrivateRoute>
        {/* @ts-expect-error ErrorBoundary props are injected from MobX stores */}
        <ErrorBoundary>
          <SectionWrapper
            withBodyScroll
            viewAs="settings"
            settingsStudio
          >
            <Section.SectionHeader>
              {isWebhookHistory ? (
                <HistoryHeader />
              ) : isWebhookDetails ? (
                <DetailsNavigationHeader />
              ) : isOAuthForm ? (
                <OAuthSectionHeader isEdit={isOAuthEdit} />
              ) : (
                <DeveloperToolsHeader />
              )}
            </Section.SectionHeader>

            <Section.SectionBody>
              <LoaderWrapper isLoading={isLoading}>
                <Outlet />
              </LoaderWrapper>
            </Section.SectionBody>
          </SectionWrapper>
        </ErrorBoundary>
      </PrivateRoute>
    );
  },
);

export const Component = inject(
  ({ settingsStore, webhooksStore, oauthStore }: TStore) => ({
    settingsStore,
    webhooksStore,
    oauthStore,
  }),
)(DeveloperToolsWrapperComponent);
