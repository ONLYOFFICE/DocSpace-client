// (c) Copyright Ascensio System SIA 2009-2024
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

import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HotkeysReactSvgUrl from "PUBLIC_DIR/images/hotkeys.react.svg?url";
import ProfileReactSvgUrl from "PUBLIC_DIR/images/profile.react.svg?url";
import PaymentsReactSvgUrl from "PUBLIC_DIR/images/payments.react.svg?url";
import HelpCenterReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";
import EmailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import LiveChatReactSvgUrl from "PUBLIC_DIR/images/support.react.svg?url";
import BookTrainingReactSvgUrl from "PUBLIC_DIR/images/book.training.react.svg?url";
//import VideoGuidesReactSvgUrl from "PUBLIC_DIR/images/video.guides.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import SpacesReactSvgUrl from "PUBLIC_DIR/images/spaces.react.svg?url";
import { makeAutoObservable } from "mobx";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { isMobile } from "react-device-detect";

import { zendeskAPI } from "@docspace/shared/components/zendesk/Zendesk.utils";
import { LIVE_CHAT_LOCAL_STORAGE_KEY } from "@docspace/shared/constants";
import { toastr } from "@docspace/shared/components/toast";
import { isDesktop, isTablet } from "@docspace/shared/utils";
import TariffBar from "SRC_DIR/components/TariffBar";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";

const PROXY_HOMEPAGE_URL = combineUrl(window.ClientConfig?.proxy?.url, "/");
const PROFILE_SELF_URL = combineUrl(PROXY_HOMEPAGE_URL, "/profile");
//const PROFILE_MY_URL = combineUrl(PROXY_HOMEPAGE_URL, "/my");
const ABOUT_URL = combineUrl(PROXY_HOMEPAGE_URL, "/about");
const PAYMENTS_URL = combineUrl(
  PROXY_HOMEPAGE_URL,
  "/portal-settings/payments/portal-payments",
);

//const VIDEO_GUIDES_URL = "https://onlyoffice.com/";

const SPACES_URL = combineUrl(PROXY_HOMEPAGE_URL, "/management");
class ProfileActionsStore {
  authStore = null;
  userStore = null;
  settingsStore = null;
  filesStore = null;
  peopleStore = null;
  treeFoldersStore = null;
  selectedFolderStore = null;
  pluginStore = null;
  isAboutDialogVisible = false;
  isDebugDialogVisible = false;
  isShowLiveChat = false;
  profileClicked = false;

  constructor(
    authStore,
    filesStore,
    peopleStore,
    treeFoldersStore,
    selectedFolderStore,
    pluginStore,
    userStore,
    settingsStore,
    currentTariffStatusStore,
  ) {
    this.authStore = authStore;
    this.filesStore = filesStore;
    this.peopleStore = peopleStore;
    this.treeFoldersStore = treeFoldersStore;
    this.selectedFolderStore = selectedFolderStore;
    this.pluginStore = pluginStore;
    this.userStore = userStore;
    this.settingsStore = settingsStore;
    this.currentTariffStatusStore = currentTariffStatusStore;

    this.isShowLiveChat = this.getStateLiveChat();

    makeAutoObservable(this);
  }

  getStateLiveChat = () => {
    const state = localStorage.getItem(LIVE_CHAT_LOCAL_STORAGE_KEY) === "true";

    if (!state) return false;

    return state;
  };

  setStateLiveChat = (state) => {
    if (typeof state !== "boolean") return;

    localStorage.setItem(LIVE_CHAT_LOCAL_STORAGE_KEY, state.toString());

    this.isShowLiveChat = state;
  };

  setIsAboutDialogVisible = (visible) => {
    this.isAboutDialogVisible = visible;
  };

  setIsDebugDialogVisible = (visible) => {
    this.isDebugDialogVisible = visible;
  };

  getUserRole = (user) => {
    let isModuleAdmin =
      user?.listAdminModules && user?.listAdminModules?.length;

    if (user.isOwner) return "owner";
    if (user.isAdmin || isModuleAdmin) return "admin";
    if (user.isVisitor) return "user";
    return "manager";
  };

  onProfileClick = (obj) => {
    const { isAdmin, isOwner } = this.userStore.user;
    const { isRoomAdmin } = this.authStore;

    const prefix = window.DocSpace.location.pathname.includes("portal-settings")
      ? "/portal-settings"
      : "";

    const profileUrl = `${prefix}${PROFILE_SELF_URL}`;

    if (openingNewTab(profileUrl, obj?.originalEvent)) return;

    this.profileClicked = true;

    if ((isAdmin || isOwner || isRoomAdmin) && !prefix) {
      this.selectedFolderStore.setSelectedFolder(null);
    }

    const state = {
      fromUrl: `${window.DocSpace.location.pathname}${window.DocSpace.location.search}`,
    };

    window.DocSpace.navigate(profileUrl, { state });
  };

  onSettingsClick = (settingsUrl, obj) => {
    if (openingNewTab(settingsUrl, obj.originalEvent)) return;

    this.selectedFolderStore.setSelectedFolder(null);
    window.DocSpace.navigate(settingsUrl);
  };

  onSpacesClick = () => {
    // this.selectedFolderStore.setSelectedFolder(null);
    window.open(SPACES_URL, "_blank");
  };

  onPaymentsClick = (obj) => {
    if (openingNewTab(PAYMENTS_URL, obj.originalEvent)) return;

    this.selectedFolderStore.setSelectedFolder(null);
    window.DocSpace.navigate(PAYMENTS_URL);
  };

  onHelpCenterClick = () => {
    const helpUrl = this.settingsStore.helpLink;

    window.open(helpUrl, "_blank");
  };

  onLiveChatClick = (t) => {
    const isShow = !this.isShowLiveChat;

    this.setStateLiveChat(isShow);

    zendeskAPI.addChanges("webWidget", isShow ? "show" : "hide");

    toastr.success(isShow ? t("LiveChatOn") : t("LiveChatOff"));
  };

  onSupportClick = () => {
    const supportUrl =
      this.settingsStore.additionalResourcesData?.feedbackAndSupportUrl;

    window.open(supportUrl, "_blank");
  };

  onBookTraining = () => {
    const trainingEmail = this.settingsStore?.bookTrainingEmail;

    trainingEmail && window.open(`mailto:${trainingEmail}`, "_blank");
  };

  //onVideoGuidesClick = () => {
  //  window.open(VIDEO_GUIDES_URL, "_blank");
  //};

  onHotkeysClick = () => {
    this.settingsStore.setHotkeyPanelVisible(true);
  };

  onAboutClick = () => {
    if (isDesktop() || isTablet()) {
      this.setIsAboutDialogVisible(true);
    } else {
      window.DocSpace.navigate(ABOUT_URL);
    }
  };

  onLogoutClick = async (t) => {
    try {
      const ssoLogoutUrl = await this.authStore.logout(false);

      window.location.replace(
        combineUrl(window.ClientConfig?.proxy?.url, ssoLogoutUrl || "/login"),
      );
    } catch (e) {
      console.error(e);
      toastr.error(t("Common:UnexpectedError"));
    }
  };

  onDebugClick = () => {
    this.setIsDebugDialogVisible(true);
  };

  getActions = (t) => {
    const {
      enablePlugins,
      standalone,
      portals,
      baseDomain,
      tenantAlias,
      limitedAccessSpace,
    } = this.settingsStore;
    const isAdmin = this.authStore.isAdmin;
    const isCommunity = this.currentTariffStatusStore.isCommunity;
    // const { isOwner } = this.userStore.user;

    // const settingsModule = modules.find((module) => module.id === "settings");
    // const peopleAvailable = modules.some((m) => m.appName === "people");
    //   settingsModule && combineUrl(PROXY_HOMEPAGE_URL, settingsModule.link);

    const {
      //currentProductId,
      debugInfo,
    } = this.settingsStore;

    const settings = isAdmin
      ? {
          key: "user-menu-settings",
          icon: CatalogSettingsReactSvgUrl,
          label: t("Common:Settings"),
          onClick: (obj) => this.onSettingsClick("/portal-settings", obj),
        }
      : null;

    const protocol = window?.location?.protocol;

    const managementItems = portals.map((portal) => {
      return {
        key: portal.tenantId,
        label: portal.domain,
        onClick: () => window.open(`${protocol}//${portal.domain}/`, "_self"),
        disabled: false,
        checked: tenantAlias === portal.portalName,
      };
    });

    const management =
      isAdmin && standalone && !limitedAccessSpace
        ? {
            key: "spaces-management-settings",
            id: "spaces",
            icon: SpacesReactSvgUrl,
            label: t("Common:Spaces"),
            onClick: this.onSpacesClick,
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

    let hotkeys = null;
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
        onClick: this.onHotkeysClick,
      };
    }
    // }

    let liveChat = null;

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

    let bookTraining = null;

    if (!isMobile && this.authStore.isTeamTrainingAlertAvailable) {
      bookTraining = {
        key: "user-menu-book-training",
        icon: BookTrainingReactSvgUrl,
        label: t("Common:BookTraining"),
        onClick: this.onBookTraining,
      };
    }

    const feedbackAndSupportEnabled =
      this.settingsStore.additionalResourcesData?.feedbackAndSupportEnabled;
    const videoGuidesEnabled =
      this.settingsStore.additionalResourcesData?.videoGuidesEnabled;
    const helpCenterEnabled =
      this.settingsStore.additionalResourcesData?.helpCenterEnabled;
    const showFrameSignOut =
      !this.settingsStore.isFrame ||
      this.settingsStore.frameConfig?.showSignOut;

    const actions = [
      {
        key: "user-menu-profile",
        icon: ProfileReactSvgUrl,
        label: t("Common:Profile"),
        onClick: (obj) => this.onProfileClick(obj),
      },
      settings,
      management,
      isAdmin &&
        !isCommunity && {
          key: "user-menu-payments",
          icon: PaymentsReactSvgUrl,
          label: t("Common:PaymentsTitle"),
          onClick: (obj) => this.onPaymentsClick(obj),
          additionalElement: <TariffBar />,
        },
      {
        isSeparator: true,
        key: "separator1",
      },
      helpCenterEnabled && {
        key: "user-menu-help-center",
        icon: HelpCenterReactSvgUrl,
        label: t("Common:HelpCenter"),
        onClick: this.onHelpCenterClick,
      },
      /*videoGuidesEnabled && {
        key: "user-menu-video",
        icon: VideoGuidesReactSvgUrl,
        label: "VideoGuides",
        onClick: this.onVideoGuidesClick,
      },*/
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
      },
      bookTraining,
      {
        key: "user-menu-about",
        icon: InfoOutlineReactSvgUrl,
        label: t("Common:AboutCompanyTitle"),
        onClick: this.onAboutClick,
      },
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

    if (this.pluginStore.profileMenuItemsList && enablePlugins) {
      this.pluginStore.profileMenuItemsList.forEach((option) => {
        actions.splice(option.value.position, 0, {
          key: option.key,
          ...option.value,
        });
      });
    }

    return actions;
  };
}

export default ProfileActionsStore;
