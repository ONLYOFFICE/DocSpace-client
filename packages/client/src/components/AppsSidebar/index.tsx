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

import { useMemo } from "react";

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type {
  NavMenuGroup,
  NavMenuItem,
  NavSubItem,
} from "@docspace/ui-kit/components/nav-menu";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { getLogoUrl } from "@docspace/ui-kit/utils/getLogoUrl";
import { WhiteLabelLogoType } from "@docspace/ui-kit/enums";
import articleStyles from "@docspace/ui-kit/components/article/Article.module.scss";
import { DeviceType } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";
import type { ArticleProfileProps } from "@docspace/ui-kit/components/article";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import BackButton from "@docspace/ui-kit/components/article/sub-components/BackButton";
import { useSectionNavigation } from "SRC_DIR/contexts/SectionNavigationContext";
import CollapseButton from "./CollapseButton";
import FooterMenu from "./FooterMenu";
import ProfileBlock from "./ProfileBlock";
import { useSidebarShowText } from "./useSidebarShowText";
import styles from "./AppsSidebar.module.scss";

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
};

type AppsSidebarViewProps = AppsSidebarProps & {
  showText: boolean;
  toggleShowText: () => void;
  currentDeviceType: DeviceType;
  user?: TUser | null;
  isNotPaidPeriod?: boolean;
  articleOpen?: boolean;
  toggleArticleOpen?: () => void;
  onBack?: () => void;
};

export const AppsSidebarView = ({
  groups,
  activeId,
  variant = "primary",
  showText,
  toggleShowText,
  currentDeviceType,
  user,
  isNotPaidPeriod = false,
  articleOpen = true,
  toggleArticleOpen,
  onBack,
}: AppsSidebarViewProps) => {
  const showBackButton = variant === "secondary";
  const hideFooter = variant === "secondary";
  const { t } = useTranslation(["Common"]);
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
  const isVisitor = user?.isVisitor ?? false;
  const isCollaborator = user?.isCollaborator ?? false;

  const handleBackdropClick = () => {
    toggleArticleOpen?.();
  };

  // On mobile the article overlays the content, so it must close itself after a
  // navigation click. Wrap every item/sub-item onClick to run its own handler
  // first (navigate) and then close the article. Off mobile the article is
  // pinned, so handlers pass through untouched.
  const mobileGroups = useMemo(() => {
    if (!isMobile) return groups;

    const closeAfter =
      <T,>(handler?: (item: T) => void) =>
      (item: T) => {
        handler?.(item);
        toggleArticleOpen?.();
      };

    return groups.map((group) => ({
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
  }, [groups, isMobile, toggleArticleOpen]);

  return (
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
            {showText ? (
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
            <BackButton
              showText={showText}
              currentDeviceType={currentDeviceType}
              onBack={onBack}
              toggleArticleOpen={toggleArticleOpen}
            />
          )}
          <NavMenu
            groups={mobileGroups}
            activeItemId={activeId}
            iconOnly={!showText}
            withAnimation
          />

          {/* Footer menu lives inside the scroll body so it scrolls with the
              apps list when there is overflow, and stays pinned to the bottom
              (via margin-block-start: auto) when there is free space above. */}
          {!hideFooter && (
            <div className={styles.footer}>
              <FooterMenu
                showText={showText}
                isAdmin={isAdmin}
                isOwner={isOwner}
                isVisitor={isVisitor}
                isCollaborator={isCollaborator}
                isNotPaidPeriod={isNotPaidPeriod}
              />
            </div>
          )}
        </Scrollbar>

        {user && !isMobile ? (
          <div className={styles.profileBlockWrapper}>
            <ProfileBlock
              user={user as unknown as ArticleProfileProps["user"]}
              showText={showText}
            />
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
};

// Store-injected fields are optional here so the public type (what call sites
// pass) stays just `AppsSidebarProps`; `inject` supplies the rest at runtime.
type AppsSidebarConnectedProps = AppsSidebarProps & {
  currentDeviceType?: DeviceType;
  user?: TUser | null;
  isNotPaidPeriod?: boolean;
  articleOpen?: boolean;
  toggleArticleOpen?: () => void;
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

  return (
    <AppsSidebarView
      {...rest}
      variant={variant}
      currentDeviceType={currentDeviceType}
      showText={showText}
      toggleShowText={toggleShowText}
      onBack={variant === "secondary" ? navigateBack : undefined}
    />
  );
};

export default inject<TStore>(
  ({ userStore, settingsStore, currentTariffStatusStore }) => ({
    user: userStore.user,
    currentDeviceType: settingsStore.currentDeviceType,
    articleOpen: settingsStore.articleOpen,
    toggleArticleOpen: settingsStore.toggleArticleOpen,
    isNotPaidPeriod: currentTariffStatusStore.isNotPaidPeriod,
  }),
)(observer(AppsSidebar));

