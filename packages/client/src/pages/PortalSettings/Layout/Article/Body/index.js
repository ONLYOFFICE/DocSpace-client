// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { DeviceType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import withLoading from "SRC_DIR/HOCs/withLoading";

import { ArticleItem } from "@docspace/shared/components/article-item/ArticleItemWrapper";
import { ArticleFolderLoader } from "@docspace/shared/skeletons/article";
import {
  // getKeyByLink,
  settingsTree,
  getSelectedLinkByKey,
  // selectKeyOfTreeElement,
  getCurrentSettingsCategory,
} from "../../../utils";

const ArticleBodyContent = (props) => {
  const {
    t,
    tReady,
    setIsLoadedArticleBody,
    toggleArticleOpen,
    showText,
    isNotPaidPeriod,
    isOwner,
    isLoadedArticleBody,
    standalone,
    isCommunity,
    currentDeviceType,
    isProfileLoading,
    currentColorScheme,
    baseDomain,
  } = props;

  const [selectedKeys, setSelectedKeys] = React.useState([]);

  const prevLocation = React.useRef(null);

  const location = useLocation();

  // React.useEffect(() => {
  //   // prevLocation.current = location;
  // }, [location]);

  React.useEffect(() => {
    const locationPathname = location.pathname;

    const resultPath = locationPathname;
    const arrayOfParams = resultPath.split("/");
    arrayOfParams.splice(0, 2);

    let link = "";
    const selectedItem = arrayOfParams[arrayOfParams.length - 1];
    if (
      selectedItem === "owner" ||
      selectedItem === "admins" ||
      selectedItem === "modules"
    ) {
      link = `/${resultPath}`;
    } else if (selectedItem === "accessrights") {
      link = `/${resultPath}/owner`;
    }

    const CurrentSettingsCategoryKey = getCurrentSettingsCategory(
      arrayOfParams,
      settingsTree,
    );

    if (link === "") {
      link = getSelectedLinkByKey(CurrentSettingsCategoryKey, settingsTree);
    }

    setSelectedKeys([CurrentSettingsCategoryKey]);
  }, []);

  React.useEffect(() => {
    if (tReady && !isProfileLoading) setIsLoadedArticleBody(true);

    if (
      !prevLocation.current ||
      prevLocation.current.pathname !== location.pathname
    ) {
      prevLocation.current = location;

      if (location.pathname.includes("customization")) {
        setSelectedKeys(["0-0"]);
      }

      if (location.pathname.includes("security")) {
        setSelectedKeys(["1-0"]);
      }

      if (location.pathname.includes("backup")) {
        setSelectedKeys(["2-0"]);
      }

      if (location.pathname.includes("restore")) {
        setSelectedKeys(["3-0"]);
      }

      if (location.pathname.includes("integration")) {
        setSelectedKeys(["4-0"]);
      }

      if (location.pathname.includes("data-import")) {
        setSelectedKeys(["5-0"]);
      }

      if (
        location.pathname.includes("management") &&
        !location.pathname.includes("profile")
      ) {
        setSelectedKeys(["6-0"]);
      }

      if (location.pathname.includes("ai-settings")) {
        setSelectedKeys(["7-0"]);
      }

      if (location.pathname.includes("developer")) {
        setSelectedKeys(["8-0"]);
      }

      if (location.pathname.includes("delete-data")) {
        setSelectedKeys(["9-0"]);
      }

      if (location.pathname.includes("payments")) {
        setSelectedKeys(["10-0"]);
      }

      if (
        location.pathname.includes("services") &&
        !location.pathname.includes("third-party-services")
      ) {
        setSelectedKeys(["11-0"]);
      }

      if (location.pathname.includes("bonus")) {
        setSelectedKeys(["12-0"]);
      }
    }
  }, [
    tReady,
    isProfileLoading,
    setIsLoadedArticleBody,
    location.pathname,
    selectedKeys,
  ]);

  const getLinkData = (value) => {
    const path = `/portal-settings${getSelectedLinkByKey(
      `${value}-0`,
      settingsTree,
    )}`;

    return { path, state: {} };
  };

  const onSelect = () => {
    if (currentDeviceType === DeviceType.mobile) {
      toggleArticleOpen();
    }
  };

  const mapKeys = (tKey) => {
    switch (tKey) {
      case "AccessRights":
        return t("Common:AccessRights");
      case "Customization":
        return t("Customization");
      case "SettingsGeneral":
        return t("SettingsGeneral");
      case "StudioTimeLanguageSettings":
        return t("StudioTimeLanguageSettings");
      case "CustomTitlesWelcome":
        return t("CustomTitlesWelcome");
      case "ManagementCategorySecurity":
        return t("ManagementCategorySecurity");
      case "PortalAccess":
        return t("PortalAccess", { productName: t("Common:ProductName") });
      case "TwoFactorAuth":
        return t("TwoFactorAuth");
      case "ManagementCategoryIntegration":
        return t("ManagementCategoryIntegration");
      case "ThirdPartyAuthorization":
        return t("ThirdPartyAuthorization");
      case "Migration":
        return t("Migration");
      case "Backup":
        return t("Common:Backup");
      case "Common:PaymentsTitle":
        return t("Common:PaymentsTitle");
      case "ManagementCategoryDataManagement":
        return t("ManagementCategoryDataManagement");
      case "LdapSettings":
        return t("Ldap:LdapSettings");
      case "LdapSyncTitle":
        return t("Ldap:LdapSyncTitle");
      case "Common:RestoreBackup":
        return t("Common:RestoreBackup");
      case "PortalDeletion":
        return t("PortalDeletion", { productName: t("Common:ProductName") });
      case "Common:DeveloperTools":
        return t("Common:DeveloperTools");
      case "Common:Bonus":
        return t("Common:Bonus");
      case "Common:FreeAccessToLicensedVersion":
        return "Common:FreeAccessToLicensedVersion";
      case "DataImport":
        return t("DataImport");
      case "StorageManagement":
        return t("StorageManagement");
      case "Services":
        return t("Services");
      case "AISettings":
        return t("Settings:AISettings");
      default:
        throw new Error("Unexpected translation key");
    }
  };

  const catalogItems = () => {
    const items = [];

    let resultTree = [...settingsTree];

    if (isNotPaidPeriod) {
      resultTree = [...settingsTree].filter((e) => {
        return (
          e.tKey === "Backup" ||
          e.tKey === "Common:PaymentsTitle" ||
          (isOwner && e.tKey === "PortalDeletion")
        );
      });
    }

    if (standalone) {
      const deletionTKey = isCommunity
        ? ["Common:PaymentsTitle", "Services"]
        : ["Common:Bonus", "Services"];

      deletionTKey.forEach((key) => {
        const index = resultTree.findIndex((el) => el.tKey === key);
        if (index !== -1) {
          resultTree.splice(index, 1);
        }
      });
    } else {
      const index = resultTree.findIndex((n) => n.tKey === "Common:Bonus");
      if (index !== -1) {
        resultTree.splice(index, 1);
      }
    }

    if (!isOwner || (baseDomain && baseDomain === "localhost")) {
      const index = resultTree.findIndex((n) => n.tKey === "PortalDeletion");
      if (index !== -1) {
        resultTree.splice(index, 1);
      }
    }

    if (selectedKeys.length === 0) return null;

    const resultTreeLength = resultTree.length;

    resultTree.forEach((item, index) => {
      const icon = getCatalogIconUrlByType(item.type, {
        isSettingsCatalog: true,
      });

      const isLastIndex = resultTreeLength - 1 === index;

      const patternSearching = selectedKeys[0].split("-");
      const selectedKey = patternSearching[0];
      const title = mapKeys(item.tKey);
      const linkData = getLinkData(item.key);

      const style = isLastIndex
        ? { margin: `${item.key.includes(9) ? "16px 0px" : "0"}` }
        : { marginTop: `${item.key.includes(9) ? "16px" : "0"}` };

      items.push(
        <ArticleItem
          key={item.key}
          id={item.key}
          title={title}
          icon={icon}
          showText={showText}
          text={title}
          value={item.link}
          isActive={item.key === selectedKey}
          onClick={(e) => onSelect(item.key, e)}
          linkData={linkData}
          folderId={item.id}
          style={style}
          $currentColorScheme={currentColorScheme}
          withAnimation
        />,
      );
    });

    return items;
  };

  const items = catalogItems();

  return !isLoadedArticleBody || isProfileLoading ? (
    <ArticleFolderLoader />
  ) : (
    items
  );
};

export default inject(
  ({
    settingsStore,
    common,
    clientLoadingStore,
    userStore,
    currentTariffStatusStore,
  }) => {
    const { isLoadedArticleBody, setIsLoadedArticleBody } = common;

    const { isNotPaidPeriod, isCommunity } = currentTariffStatusStore;
    const { user } = userStore;
    const { isOwner } = user;
    const {
      standalone,
      showText,
      toggleArticleOpen,
      currentDeviceType,
      limitedAccessSpace,
      currentColorScheme,
      baseDomain,
    } = settingsStore;

    const isProfileLoading =
      window.location.pathname.includes("profile") &&
      clientLoadingStore.showProfileLoader &&
      !isLoadedArticleBody;

    return {
      standalone,

      showText,
      toggleArticleOpen,
      isLoadedArticleBody,
      setIsLoadedArticleBody,
      isNotPaidPeriod,
      isOwner,
      isCommunity,
      currentDeviceType,
      isProfileLoading,
      limitedAccessSpace,
      currentColorScheme,
      baseDomain,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common", "Ldap"])(
      observer(ArticleBodyContent),
    ),
  ),
);
