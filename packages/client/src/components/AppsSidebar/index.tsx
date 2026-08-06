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
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useMemo } from "react";

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type {
  NavMenuGroup,
  NavMenuItem,
  NavSubItem,
} from "@docspace/ui-kit/components/nav-menu";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { Portal } from "@docspace/ui-kit/components/portal";
import { getLogoUrl } from "@docspace/ui-kit/utils/getLogoUrl";
import { WhiteLabelLogoType } from "@docspace/ui-kit/enums";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { DeviceType } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";
import type { ArticleProfileProps } from "@docspace/ui-kit/components/article";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import BackButton from "@docspace/ui-kit/components/article/sub-components/BackButton";
import ArticleDevToolsBar from "@docspace/ui-kit/components/article/sub-components/DevToolsBar";
import { ArticleProfileLoader } from "@docspace/ui-kit/components/article/skeletons";
import { useSectionNavigation } from "SRC_DIR/contexts/SectionNavigationContext";
import type { Section } from "SRC_DIR/helpers/plugins/enums";
import type PluginStore from "SRC_DIR/store/PluginStore";
import CollapseButton from "./CollapseButton";
import ProfileBlock from "./ProfileBlock";
import AppsPluginItems from "./AppsPluginItems/AppsPluginItems";
import { BackButtonLoader, HeaderLoader, NavMenuLoader } from "./SidebarLoader";
import { useSidebarShowText } from "./useSidebarShowText";
import {
  usePluginNavGroup,
  type PluginNavigationItems,
} from "./usePluginNavGroup";
import styles from "./AppsSidebar.module.scss";
import type { AppsPluginsItems } from "./AppsPluginItems/AppsPluginItems.types";

// "primary" — main client sidebar (footer + no back button).
// "secondary" — accounts / developer-tools / portal-settings (back button, no footer).
export type SidebarVariant = "primary" | "secondary";

// Props a caller provides. Common store data (user, device, article state) is
// injected by the connected default export below, so sections only pass what
// actually differs between them.
export type AppsSidebarProps = {
  groups: NavMenuGroup[];
  activeId?: string;
  variant?: SidebarVariant;
  isNavLoading?: boolean;
  /** Hides the section "Back" button (secondary variant). */
  hideBack?: boolean;
  /** Overrides the default section "Back" handler (secondary variant). */
  onBack?: () => void;
  /** Overrides the section "Back" button caption (secondary variant). */
  backLabel?: string;
  /** Shows the Developer Tools banner on a secondary sidebar (hidden there by default). */
  withDevTools?: boolean;
  /** Portal section this sidebar stands for — plugins add their navigation items to it. */
  pluginSection?: Section;
};

type AppsSidebarViewProps = AppsSidebarProps & {
  showText: boolean;
  toggleShowText: () => void;
  currentDeviceType: DeviceType;
  user?: TUser | null;
  isNotPaidPeriod?: boolean;
  articleOpen?: boolean;
  articleButtonItems?: AppsPluginsItems | null;
  articleNavigationItems?: PluginNavigationItems | null;
  dispatchMessage?: PluginStore["dispatchMessage"];
  toggleArticleOpen?: () => void;
  onBack?: () => void;
  backLabel?: string;
  limitedAccessDevToolsForUsers?: boolean;
};

export const AppsSidebarView = ({
  groups,
  activeId,
  variant = "primary",
  showText,
  toggleShowText,
  currentDeviceType,
  user,
  articleOpen = true,
  toggleArticleOpen,
  onBack,
  hideBack,
  backLabel,
  articleButtonItems,
  articleNavigationItems,
  dispatchMessage,
  pluginSection,
  isNavLoading,
  limitedAccessDevToolsForUsers,
  withDevTools,
}: AppsSidebarViewProps) => {
  const showBackButton = variant === "secondary" && !hideBack;
  const hideFooter = variant === "secondary";

  const hasPluginItems = !!articleButtonItems && articleButtonItems.length > 0;
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const { isBase } = useTheme();
  const isMobile = currentDeviceType === DeviceType.mobile;
  const collapseLabel = showText
    ? t("Common:HideArticleMenu")
    : t("Common:ShowArticleMenu");

  const fullLogo = getLogoUrl(
    WhiteLabelLogoType.LightSmall,
    !isBase,
    false,
    "",
    true,
  );
  const burgerLogo = getLogoUrl(
    WhiteLabelLogoType.LeftMenu,
    !isBase,
    false,
    "",
    true,
  );

  const isAdmin = user?.isAdmin ?? false;
  const isOwner = user?.isOwner ?? false;
  // Developer Tools banner mirrors the route guard in Route.private.tsx: hidden
  // for guests, and for non-admins when access is limited. On the secondary
  // sidebars (accounts/dev-tools/settings) it is hidden via `hideFooter` unless
  // the section opts in with `withDevTools` (portal-settings, billing).
  const showDevTools =
    !user?.isVisitor &&
    (isAdmin || isOwner || !limitedAccessDevToolsForUsers);
  const showDevToolsBar = showDevTools && (!hideFooter || !!withDevTools);
  // While the nav skeleton is up, the footer (plugin slots + banner) stays
  // hidden so it doesn't appear ahead of the navigation it sits under.
  const showFooter = !isNavLoading && (hasPluginItems || showDevToolsBar);

  const handleBackdropClick = () => {
    toggleArticleOpen?.();
  };

  const { pluginGroup, activePluginItemId } = usePluginNavGroup({
    section: pluginSection,
    items: articleNavigationItems,
    dispatchMessage,
  });

  const navGroups = useMemo(
    () => (pluginGroup ? [...groups, pluginGroup] : groups),
    [groups, pluginGroup],
  );

  // On mobile the article overlays the content, so it must close itself after a
  // navigation click. Wrap every item/sub-item onClick to run its own handler
  // first (navigate) and then close the article. Off mobile the article is
  // pinned, so handlers pass through untouched.
  const mobileGroups = useMemo(() => {
    if (!isMobile) return navGroups;

    const closeAfter =
      <T,>(handler?: (item: T) => void) =>
      (item: T) => {
        handler?.(item);
        toggleArticleOpen?.();
      };

    return navGroups.map((group) => ({
      ...group,
      items: group.items.map((item: NavMenuItem) => ({
        ...item,
        onClick: closeAfter(item.onClick),
        children: item.children?.map((sub: NavSubItem) => ({
          ...sub,
          onClick: closeAfter(sub.onClick),
        })),
      })),
    }));
  }, [navGroups, isMobile, toggleArticleOpen]);

  const articleContent = (
    <>
      <div
        id="article-container"
        className={`${articleStyles.article} ${styles.articleFlex}`}
        data-show-text={showText ? "true" : "false"}
        data-open={articleOpen ? "true" : "false"}
        data-sidebar-open={articleOpen ? "true" : "false"}
        data-with-main-button="false"
      >
        {!isMobile && (
          <div
            className={`${articleStyles.articleHeader} ${styles.header}`}
            data-show-text={showText ? "true" : "false"}
          >
            {isNavLoading ? (
              <HeaderLoader showText={showText} />
            ) : showText ? (
              <>
                <a href="/" className={styles.logoWrapper}>
                  <img
                    className={styles.logoFull}
                    src={fullLogo}
                    alt="portal logo"
                  />
                </a>

                <CollapseButton
                  showText={showText}
                  toggleShowText={toggleShowText}
                  label={collapseLabel}
                />
              </>
            ) : (
              <div className={styles.collapsedHeader}>
                <button
                  type="button"
                  className={styles.logoBurgerButton}
                  onClick={toggleShowText}
                  title={collapseLabel}
                  aria-label={collapseLabel}
                >
                  <img
                    className={styles.logoBurger}
                    src={burgerLogo}
                    alt="portal logo"
                  />
                </button>

                <CollapseButton
                  showText={showText}
                  toggleShowText={toggleShowText}
                  label={collapseLabel}
                  className={styles.collapseButton}
                />
              </div>
            )}
          </div>
        )}

        <Scrollbar
          className={`article-body__scrollbar ${styles.scrollbar}`}
          scrollClass="article-scroller"
          scrollBodyClassName={styles.scrollBody}
        >
          {showBackButton && (
            <div className={styles.backButtonWrapper}>
              {isNavLoading ? (
                <BackButtonLoader
                  showText={showText}
                  className={articleStyles.backButton}
                />
              ) : (
                <BackButton
                  showText={showText}
                  currentDeviceType={currentDeviceType}
                  onBack={onBack}
                  label={backLabel}
                  toggleArticleOpen={toggleArticleOpen}
                />
              )}
            </div>
          )}
          {isNavLoading ? (
            <NavMenuLoader showText={showText} />
          ) : (
            <NavMenu
              groups={mobileGroups}
              activeItemId={activePluginItemId ?? activeId}
              iconOnly={!showText}
              withExpandControl={isMobile}
              withAnimation
            />
          )}

          {showFooter && (
            <div className={styles.footer}>
              {articleButtonItems?.length ? (
                <AppsPluginItems
                  items={articleButtonItems}
                  showText={showText}
                  withDevTools={showDevToolsBar}
                />
              ) : null}
              {showDevToolsBar && (
                <ArticleDevToolsBar
                  showText={showText}
                  articleOpen={articleOpen}
                  withCustomSlot={hasPluginItems}
                  currentDeviceType={currentDeviceType}
                  toggleArticleOpen={toggleArticleOpen ?? (() => {})}
                  path="/developer-tools/overview"
                  navigate={navigate}
                />
              )}
            </div>
          )}
        </Scrollbar>

        {!isMobile && (isNavLoading || user) ? (
          <div className={styles.profileBlockWrapper}>
            {isNavLoading ? (
              <ArticleProfileLoader showText={showText} />
            ) : (
              <ProfileBlock
                user={user as unknown as ArticleProfileProps["user"]}
                showText={showText}
              />
            )}
          </div>
        ) : null}
      </div>
      {isMobile && articleOpen && (
        <Backdrop
          visible={true}
          isAside={true}
          onClick={handleBackdropClick}
          zIndex={229}
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <Portal
        visible
        element={articleContent}
        appendTo={
          (typeof document !== "undefined" &&
            document.getElementById("root")) ||
          undefined
        }
      />
    );
  }

  return articleContent;
};

// Store-injected fields are optional here so the public type (what call sites
// pass) stays just `AppsSidebarProps`; `inject` supplies the rest at runtime.
type AppsSidebarConnectedProps = AppsSidebarProps & {
  currentDeviceType?: DeviceType;
  user?: TUser | null;
  isNotPaidPeriod?: boolean;
  articleOpen?: boolean;
  toggleArticleOpen?: () => void;
  articleButtonItems?: AppsPluginsItems | null;
  articleNavigationItems?: PluginNavigationItems | null;
  dispatchMessage?: PluginStore["dispatchMessage"];
  limitedAccessDevToolsForUsers?: boolean;
};

const AppsSidebar = ({
  variant = "primary",
  currentDeviceType = DeviceType.desktop,
  ...rest
}: AppsSidebarConnectedProps) => {
  const { showText, toggleShowText } = useSidebarShowText({
    storageKey:
      variant === "secondary"
        ? "secondary_showSidebarText"
        : "home_showSidebarText",
    currentDeviceType,
  });
  const { navigateBack } = useSectionNavigation();

  const isSecondary = variant === "secondary";
  const handleBack = rest.onBack ?? (isSecondary ? navigateBack : undefined);

  return (
    <AppsSidebarView
      {...rest}
      variant={variant}
      currentDeviceType={currentDeviceType}
      showText={showText}
      toggleShowText={toggleShowText}
      onBack={handleBack}
    />
  );
};

export default inject<TStore>(
  ({ userStore, settingsStore, currentTariffStatusStore, pluginStore }) => ({
    user: userStore.user,
    currentDeviceType: settingsStore.currentDeviceType,
    articleOpen: settingsStore.articleOpen,
    toggleArticleOpen: settingsStore.toggleArticleOpen,
    isNotPaidPeriod: currentTariffStatusStore.isNotPaidPeriod,
    articleButtonItems: pluginStore?.articleButtonItemsList,
    articleNavigationItems: pluginStore?.articleNavigationItemsList,
    dispatchMessage: pluginStore?.dispatchMessage,
    limitedAccessDevToolsForUsers: settingsStore.limitedAccessDevToolsForUsers,
  }),
)(observer(AppsSidebar));

