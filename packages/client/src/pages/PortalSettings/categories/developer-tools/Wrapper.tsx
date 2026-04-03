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
