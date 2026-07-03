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

import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HotkeysReactSvgUrl from "PUBLIC_DIR/images/hotkeys.react.svg?url";
import ProfileReactSvgUrl from "PUBLIC_DIR/images/profile.react.svg?url";
import PaymentsReactSvgUrl from "PUBLIC_DIR/images/payments.react.svg?url";
import HelpCenterReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";
import EmailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import LiveChatReactSvgUrl from "PUBLIC_DIR/images/support.react.svg?url";
import BookTrainingReactSvgUrl from "PUBLIC_DIR/images/book.training.react.svg?url";
// import VideoGuidesReactSvgUrl from "PUBLIC_DIR/images/video.guides.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import SpacesReactSvgUrl from "PUBLIC_DIR/images/spaces.react.svg?url";
import LampReactSvgUrl from "PUBLIC_DIR/images/lamp.react.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.accounts.react.svg?url";

import type {
  ComponentType,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";

import { makeAutoObservable } from "mobx";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { isMobile } from "react-device-detect";
import axios from "axios";

import { zendeskAPI } from "@docspace/shared/components/zendesk/Zendesk.utils";
import { CategoryType } from "@docspace/shared/constants";

import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type {
  ContextMenuModel,
  ContextMenuType,
  SeparatorType,
  TContextMenuValueTypeOnClick,
} from "@docspace/ui-kit/components/context-menu";

import {
  PersistenceKeys,
  getPersistedString,
  setPersistedString,
} from "./utils/persistence";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isDesktop, isTablet } from "@docspace/shared/utils";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import AccountsFilter from "@docspace/shared/api/people/filter";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
// FABLE5-REVIEW: TariffBar (SRC_DIR/components/TariffBar/index.js) is still
// .js — untyped component import; remove this note once it is converted.
import TariffBar from "SRC_DIR/components/TariffBar";
import { PEOPLE_ROUTE_WITH_FILTER } from "SRC_DIR/helpers/contacts";
import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";
import type { IProfileMenuItemClient } from "SRC_DIR/helpers/plugins/types";
import i18n from "SRC_DIR/i18n";

import type ClientLoadingStore from "./ClientLoadingStore";
import type InfoPanelStore from "./InfoPanelStore";
import type PluginStore from "./PluginStore";
import type SelectedFolderStore from "./SelectedFolderStore";
import type TreeFoldersStore from "./TreeFoldersStore";
import type FilesStore from "./FilesStore";

type TFilesStore = FilesStore;

/** Shape used to read `originalEvent` off context-menu click payloads. */
type TClickEventObj = { originalEvent?: ReactMouseEvent };

type TTranslationFn = (
  key: string,
  options?: Record<string, string | number>,
) => string;

/**
 * Profile menu items are ContextMenuType entries extended with the extra
 * fields consumed by DropDownItem (additionalElement, isButton) and by the
 * management sub-menu (isPortal); `items` may also be null (old JS behavior).
 */
type TProfileActionType = Omit<ContextMenuType, "items"> & {
  additionalElement?: ReactNode;
  isButton?: boolean;
  isPortal?: boolean;
  items?: (TProfileActionType | SeparatorType)[] | null;
};

type TProfileAction = TProfileActionType | SeparatorType;

// FABLE5-REVIEW: TariffBar is still .js — its inject()-inferred props are
// spuriously required, so the prop-less `<TariffBar />` usage from the old JS
// only typechecks through this type-only alias (same component at runtime).
const TariffBarElement = TariffBar as unknown as ComponentType;

const PROXY_HOMEPAGE_URL = combineUrl(window.ClientConfig?.proxy?.url, "/");
const PROFILE_SELF_URL = combineUrl(PROXY_HOMEPAGE_URL, "/profile/login");
const SETTINGS_URL = combineUrl(PROXY_HOMEPAGE_URL, "/portal-settings");
// const PROFILE_MY_URL = combineUrl(PROXY_HOMEPAGE_URL, "/my");
const ABOUT_URL = combineUrl(PROXY_HOMEPAGE_URL, "/about");
const PAYMENTS_URL = combineUrl(
  PROXY_HOMEPAGE_URL,
  "/portal-settings/payments/portal-payments",
);

// const VIDEO_GUIDES_URL = "https://onlyoffice.com/";

const SPACES_URL = combineUrl(PROXY_HOMEPAGE_URL, "/management");
class ProfileActionsStore {
  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  authStore: AuthStore = null!;

  userStore: UserStore = null!;

  infoPanelStore: InfoPanelStore = null!;

  settingsStore: SettingsStore = null!;

  filesStore: TFilesStore = null!;

  treeFoldersStore: TreeFoldersStore = null!;

  selectedFolderStore: SelectedFolderStore = null!;

  pluginStore: PluginStore = null!;

  clientLoadingStore: ClientLoadingStore = null!;

  // No class-field initializer in the original JS — `declare` keeps the
  // runtime shape (the own property is created by the constructor assignment).
  declare currentTariffStatusStore: CurrentTariffStatusStore;

  isAboutDialogVisible = false;

  isDebugDialogVisible = false;

  isShowLiveChat = false;

  profileClicked = false;

  constructor(
    authStore: AuthStore,
    filesStore: TFilesStore,
    treeFoldersStore: TreeFoldersStore,
    selectedFolderStore: SelectedFolderStore,
    pluginStore: PluginStore,
    userStore: UserStore,
    settingsStore: SettingsStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    infoPanelStore: InfoPanelStore,
    clientLoadingStore: ClientLoadingStore,
  ) {
    this.authStore = authStore;
    this.filesStore = filesStore;
    this.treeFoldersStore = treeFoldersStore;
    this.selectedFolderStore = selectedFolderStore;
    this.pluginStore = pluginStore;
    this.userStore = userStore;
    this.settingsStore = settingsStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.infoPanelStore = infoPanelStore;
    this.clientLoadingStore = clientLoadingStore;

    this.isShowLiveChat = this.getStateLiveChat();

    makeAutoObservable(this);

    this.checkUrlActions();
  }

  getStateLiveChat = () => {
    const state = getPersistedString(PersistenceKeys.liveChatState) === "true";

    if (!state) return false;

    return state;
  };

  setStateLiveChat = (state: boolean) => {
    if (typeof state !== "boolean") return;

    setPersistedString(PersistenceKeys.liveChatState, state.toString());

    this.isShowLiveChat = state;
  };

  setIsAboutDialogVisible = (visible: boolean) => {
    this.isAboutDialogVisible = visible;
  };

  setIsDebugDialogVisible = (visible: boolean) => {
    this.isDebugDialogVisible = visible;
  };

  onProfileClick = (obj?: TContextMenuValueTypeOnClick) => {
    const prefix = window.DocSpace.location.pathname.includes("portal-settings")
      ? "/portal-settings"
      : "";

    const profileUrl = `${prefix}${PROFILE_SELF_URL}`;

    const originalEvent = (obj as TClickEventObj | undefined)?.originalEvent;

    if (openingNewTab(profileUrl, originalEvent)) return;

    this.profileClicked = true;

    // if ((isAdmin || isOwner || isRoomAdmin) && !prefix) {
    //   this.selectedFolderStore.setSelectedFolder(null);
    // }

    const state = {
      fromUrl: `${window.DocSpace.location.pathname}${window.DocSpace.location.search}`,
    };

    window.DocSpace.navigate(profileUrl, { state });
  };

  onSettingsClick = (
    settingsUrl: string,
    obj: TContextMenuValueTypeOnClick,
  ) => {
    if (openingNewTab(settingsUrl, (obj as TClickEventObj).originalEvent))
      return;

    this.selectedFolderStore.setSelectedFolder(null);

    window.DocSpace.navigate(settingsUrl);
  };

  onAccountsClick = (
    accountsUrl: string,
    obj: TContextMenuValueTypeOnClick,
  ) => {
    if (openingNewTab(accountsUrl, (obj as TClickEventObj).originalEvent))
      return;

    this.selectedFolderStore.setSelectedFolder(null);
    this.filesStore.setSelection([]);
    this.clientLoadingStore.setIsSectionBodyLoading(true, true);

    const accountsFilter = AccountsFilter.getDefault();
    const params = accountsFilter.toUrlParams();
    const path = getCategoryUrl(CategoryType.Accounts);

    window.DocSpace.navigate(`${path}?${params}`);
  };

  onSpacesClick = () => {
    // this.selectedFolderStore.setSelectedFolder(null);
    window.open(SPACES_URL, "_blank");
  };

  onPaymentsClick = (obj: TContextMenuValueTypeOnClick) => {
    if (openingNewTab(PAYMENTS_URL, (obj as TClickEventObj).originalEvent))
      return;

    this.selectedFolderStore.setSelectedFolder(null);
    window.DocSpace.navigate(PAYMENTS_URL);
  };

  onHelpCenterClick = () => {
    const helpCenterDomain = this.settingsStore.helpCenterDomain;

    window.open(helpCenterDomain, "_blank");
  };

  onLiveChatClick = (t: TTranslationFn) => {
    const isShow = !this.isShowLiveChat;

    this.setStateLiveChat(isShow);

    zendeskAPI.addChanges("webWidget", isShow ? "show" : "hide");

    toastr.success(isShow ? t("Common:LiveChatOn") : t("Common:LiveChatOff"));
  };

  onSupportClick = () => {
    const supportUrl = this.settingsStore.feedbackAndSupportUrl;

    window.open(supportUrl, "_blank");
  };

  onSuggestFeatureClick = () => {
    const SuggestFeatureUrl = this.settingsStore.suggestFeatureUrl;

    window.open(SuggestFeatureUrl, "_blank");
  };

  onBookTraining = () => {
    const trainingEmail = this.settingsStore?.bookTrainingEmail;

    trainingEmail && window.open(`mailto:${trainingEmail}`, "_blank");
  };

  // onVideoGuidesClick = () => {
  //  window.open(VIDEO_GUIDES_URL, "_blank");
  // };

  onHotkeysClick = (event?: TContextMenuValueTypeOnClick) => {
    const e = event as TClickEventObj | undefined;
    if (e && e.originalEvent) {
      e.originalEvent.preventDefault();
    }
    this.settingsStore.setHotkeyPanelVisible(true);
  };

  onAboutClick = (event?: TContextMenuValueTypeOnClick) => {
    const e = event as TClickEventObj | undefined;
    if (e && e.originalEvent) {
      e.originalEvent.preventDefault();
    }
    if (isDesktop() || isTablet()) {
      this.setIsAboutDialogVisible(true);
    } else {
      window.DocSpace.navigate(ABOUT_URL);
    }
  };

  onLogoutClick = async (t: TTranslationFn) => {
    try {
      const ssoLogoutUrl = await this.authStore.logout(false);
      window.location.replace(
        combineUrl(window.ClientConfig?.proxy?.url, ssoLogoutUrl || "/login"),
      );
    } catch (e) {
      if (axios.isCancel(e)) return;
      console.error(e);
      toastr.error(t("Common:UnexpectedError"));
    }
  };

  onDebugClick = () => {
    this.setIsDebugDialogVisible(true);
  };

  getActions = (
    t: TTranslationFn = i18n.t.bind(i18n) as TTranslationFn,
  ): ContextMenuModel[] => {
    const {
      enablePlugins,
      standalone,
      portals,
      baseDomain,
      tenantAlias,
      limitedAccessSpace,
      displayAbout,
    } = this.settingsStore;
    const isAdmin = this.authStore.isAdmin;
    const isCommunity = this.currentTariffStatusStore.isCommunity;
    const isNotPaidPeriod = this.currentTariffStatusStore.isNotPaidPeriod;
    // FABLE5-REVIEW: userStore.user is TUser | null; the old JS destructuring
    // crashed here when user was null — the `!` keeps that runtime unchanged.
    const { isVisitor, isCollaborator } = this.userStore.user!;

    // const settingsModule = modules.find((module) => module.id === "settings");
    // const peopleAvailable = modules.some((m) => m.appName === "people");
    //   settingsModule && combineUrl(PROXY_HOMEPAGE_URL, settingsModule.link);

    const {
      // currentProductId,
      debugInfo,
    } = this.settingsStore;

    const settings: TProfileActionType | null =
      isAdmin && !isNotPaidPeriod
        ? {
            key: "user-menu-settings",
            icon: CatalogSettingsReactSvgUrl,
            label: t("Common:Settings"),
            onClick: (obj) => this.onSettingsClick("/portal-settings", obj),
            url: SETTINGS_URL,
            preventNewTab: true,
          }
        : null;

    const protocol = window?.location?.protocol;

    const managementItems: TProfileActionType[] =
      portals?.map((portal) => {
        return {
          key: portal.tenantId,
          label: portal.domain,
          isPortal: true,
          onClick: () => window.open(`${protocol}//${portal.domain}/`, "_self"),
          disabled: false,
          checked: tenantAlias === portal.portalName,
        };
      }) ?? [];

    const management: TProfileActionType | null =
      isAdmin && standalone && !limitedAccessSpace
        ? {
            key: "spaces-management-settings",
            id: "spaces",
            icon: SpacesReactSvgUrl,
            label: t("Common:Spaces"),
            onClick: this.onSpacesClick,
            url: SPACES_URL,
            preventNewTab: true,
            items:
              baseDomain && baseDomain !== "localhost"
                ? [
                    ...managementItems,
                    {
                      key: "spaces-separator",
                      isSeparator: true,
                    },
                    {
                      key: "spaces-management",
                      label: t("Common:SpaceManagement"),
                      onClick: this.onSpacesClick,
                    },
                  ]
                : null,
          }
        : null;

    let hotkeys: TProfileActionType | null = null;
    // if (modules) {
    //   const moduleIndex = modules.findIndex((m) => m.appName === "files");

    if (
      // moduleIndex !== -1 &&
      // modules[moduleIndex].id === currentProductId &&
      !isMobile
    ) {
      hotkeys = {
        key: "user-menu-hotkeys",
        icon: HotkeysReactSvgUrl,
        label: t("Common:Hotkeys"),
        onClick: (e) => this.onHotkeysClick(e),
        url: `${window.location.pathname}?action=hotkeys`,
        preventNewTab: true,
      };
    }
    // }

    let liveChat: TProfileActionType | null = null;

    if (
      !isMobile &&
      this.authStore.isLiveChatAvailable &&
      !window.navigator.userAgent.includes("ZoomWebKit") &&
      !window.navigator.userAgent.includes("ZoomApps")
    ) {
      liveChat = {
        key: "user-menu-live-chat",
        icon: LiveChatReactSvgUrl,
        label: t("Common:LiveChat"),
        onClick: () => this.onLiveChatClick(t),
        checked: this.isShowLiveChat,
        withToggle: true,
      };
    }

    let bookTraining: TProfileActionType | null = null;

    if (!isMobile && this.authStore.isTeamTrainingAlertAvailable) {
      bookTraining = {
        key: "user-menu-book-training",
        icon: BookTrainingReactSvgUrl,
        label: t("Common:BookTraining"),
        onClick: this.onBookTraining,
      };
    }

    let about: TProfileActionType | null = null;

    if (displayAbout) {
      about = {
        key: "user-menu-about",
        icon: InfoOutlineReactSvgUrl,
        label: t("Common:AboutCompanyTitle"),
        onClick: (e) => this.onAboutClick(e),
        url: `${window.location.pathname}?action=about`,
      };
    }

    const accounts: TProfileActionType | null =
      !isNotPaidPeriod && !isVisitor && !isCollaborator
        ? {
            key: "user-menu-accounts",
            icon: CatalogAccountsReactSvgUrl,
            label: t("Common:Contacts"),
            onClick: (obj) =>
              this.onAccountsClick(PEOPLE_ROUTE_WITH_FILTER, obj),
            url: PEOPLE_ROUTE_WITH_FILTER,
            preventNewTab: true,
          }
        : null;

    const feedbackAndSupportEnabled =
      this.settingsStore.additionalResourcesData?.feedbackAndSupportEnabled;
    const helpCenterEnabled =
      this.settingsStore.additionalResourcesData?.helpCenterEnabled;
    const showFrameSignOut =
      !this.settingsStore.isFrame ||
      this.settingsStore.frameConfig?.showSignOut;

    const actions: (TProfileAction | boolean | null | undefined)[] = [
      !isNotPaidPeriod && {
        key: "user-menu-profile",
        icon: ProfileReactSvgUrl,
        label: t("Common:Profile"),
        onClick: (obj) => this.onProfileClick(obj),
        url: PROFILE_SELF_URL,
        preventNewTab: true,
      },
      accounts,
      settings,
      management,
      !isNotPaidPeriod &&
        isAdmin &&
        !isCommunity && {
          key: "user-menu-payments",
          icon: PaymentsReactSvgUrl,
          label: standalone ? t("Common:PaymentsTitle") : t("Common:Billing"),
          onClick: (obj) => this.onPaymentsClick(obj),
          additionalElement: <TariffBarElement />,
          url: PAYMENTS_URL,
          preventNewTab: true,
        },
      !isNotPaidPeriod && {
        isSeparator: true,
        key: "separator1",
      },
      helpCenterEnabled && {
        key: "user-menu-help-center",
        icon: HelpCenterReactSvgUrl,
        label: t("Common:HelpCenter"),
        onClick: this.onHelpCenterClick,
        url: this.settingsStore.helpCenterDomain || "#",
        preventNewTab: true,
      },
      /* videoGuidesEnabled && {
        key: "user-menu-video",
        icon: VideoGuidesReactSvgUrl,
        label: "VideoGuides",
        onClick: this.onVideoGuidesClick,
      }, */
      hotkeys,
      !isMobile && {
        isSeparator: true,
        key: "separator2",
      },
      liveChat,
      feedbackAndSupportEnabled && {
        key: "user-menu-support",
        icon: EmailReactSvgUrl,
        label: t("Common:FeedbackAndSupport"),
        onClick: this.onSupportClick,
        url: this.settingsStore.feedbackAndSupportUrl || "#",
        preventNewTab: true,
      },
      feedbackAndSupportEnabled && {
        key: "user-menu-suggest-feature",
        icon: LampReactSvgUrl,
        label: t("Common:SuggestFeature"),
        onClick: this.onSuggestFeatureClick,
        url: this.settingsStore.suggestFeatureUrl || "#",
        preventNewTab: true,
      },
      bookTraining,
      about,
    ];

    if (showFrameSignOut) {
      actions.push({
        key: "user-menu-logout",
        icon: LogoutReactSvgUrl,
        label: t("Common:LogoutButton"),
        onClick: () => this.onLogoutClick(t),
        isButton: true,
      });
    }

    if (debugInfo) {
      actions.splice(4, 0, {
        key: "user-menu-debug",
        icon: InfoOutlineReactSvgUrl,
        label: "Debug Info",
        onClick: this.onDebugClick,
      });
    }

    if (
      !isAIAgents() &&
      this.pluginStore.profileMenuItemsList &&
      enablePlugins
    ) {
      this.pluginStore.profileMenuItemsList.forEach((option) => {
        // FABLE5-REVIEW: the plugin SDK's IProfileMenuItem has no `position`
        // field; the old JS read option.value.position (undefined unless a
        // plugin supplies it — Array.prototype.splice coerces undefined to 0).
        // The cast keeps that runtime behavior unchanged.
        const position = (
          option.value as IProfileMenuItemClient & { position?: number }
        ).position as number;

        // The Omit<> cast is type-only: at runtime the spread still carries
        // option.value.key which overwrites option.key, exactly as before
        // (it silences TS2783 "key is specified more than once").
        actions.splice(position, 0, {
          key: option.key,
          ...(option.value as Omit<IProfileMenuItemClient, "key">),
        });
      });
    }

    // FABLE5-REVIEW: the returned items carry extra DropDownItem-only fields
    // (additionalElement, isButton, isPortal) and `items` may be null, which
    // ContextMenuType does not model — the cast preserves the old JS contract
    // expected by ArticleProfileProps.getActions.
    return actions.filter(Boolean) as ContextMenuModel[];
  };

  checkUrlActions = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    if (action === "hotkeys") {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      setTimeout(() => {
        this.onHotkeysClick();
      }, 1000);
    } else if (action === "about") {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      setTimeout(() => {
        this.onAboutClick();
      }, 1000);
    }
  };
}

export default ProfileActionsStore;
