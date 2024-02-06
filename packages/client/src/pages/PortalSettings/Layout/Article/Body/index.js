import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { DeviceType } from "@docspace/common/constants";
import { getCatalogIconUrlByType } from "@docspace/common/utils/catalogIcon.helper";

import { isArrayEqual } from "@docspace/components/utils/array";

import withLoading from "SRC_DIR/HOCs/withLoading";

import {
  //getKeyByLink,
  settingsTree,
  getSelectedLinkByKey,
  //selectKeyOfTreeElement,
  getCurrentSettingsCategory,
} from "../../../utils";

import CatalogItem from "@docspace/components/catalog-item";
import LoaderArticleBody from "./loaderArticleBody";

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
    isEnterprise,
    isCommunity,
    currentDeviceType,
    isProfileLoading,
  } = props;

  const [selectedKeys, setSelectedKeys] = React.useState([]);

  const prevLocation = React.useRef(null);

  const navigate = useNavigate();
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
      settingsTree
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

      if (location.pathname.includes("developer")) {
        setSelectedKeys(["5-0"]);
      }

      if (location.pathname.includes("delete-data")) {
        setSelectedKeys(["6-0"]);
      }

      if (location.pathname.includes("payments")) {
        setSelectedKeys(["7-0"]);
      }
      if (location.pathname.includes("bonus")) {
        setSelectedKeys(["8-0"]);
      }
    }
  }, [
    tReady,
    isProfileLoading,
    setIsLoadedArticleBody,
    location.pathname,
    selectedKeys,
  ]);

  const onSelect = (value) => {
    if (isArrayEqual([value], selectedKeys)) {
      return;
    }

    // setSelectedKeys([value + "-0"]);

    if (currentDeviceType === DeviceType.mobile) {
      toggleArticleOpen();
    }

    const settingsPath = `/portal-settings${getSelectedLinkByKey(
      value + "-0",
      settingsTree
    )}`;

    if (settingsPath === location.pathname) return;

    navigate(`${settingsPath}`);
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
        return t("PortalAccess");
      case "TwoFactorAuth":
        return t("TwoFactorAuth");
      case "ManagementCategoryIntegration":
        return t("ManagementCategoryIntegration");
      case "ThirdPartyAuthorization":
        return t("ThirdPartyAuthorization");
      case "Migration":
        return t("Migration");
      case "Backup":
        return t("Backup");
      case "Common:PaymentsTitle":
        return t("Common:PaymentsTitle");
      case "ManagementCategoryDataManagement":
        return t("ManagementCategoryDataManagement");
      case "RestoreBackup":
        return t("RestoreBackup");
      case "PortalDeletion":
        return t("PortalDeletion");
      case "DeveloperTools":
        return t("DeveloperTools");
      case "Common:Bonus":
        return t("Common:Bonus");
      case "Common:FreeProFeatures":
        return "Common:FreeProFeatures";
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
        ? "Common:PaymentsTitle"
        : "Common:Bonus";

      const index = resultTree.findIndex((el) => el.tKey === deletionTKey);

      if (index !== -1) {
        resultTree.splice(index, 1);
      }
    } else {
      const index = resultTree.findIndex((n) => n.tKey === "Common:Bonus");
      if (index !== -1) {
        resultTree.splice(index, 1);
      }
    }

    if (!isOwner || standalone) {
      const index = resultTree.findIndex((n) => n.tKey === "PortalDeletion");
      if (index !== -1) {
        resultTree.splice(index, 1);
      }
    }

    if (selectedKeys.length === 0) return <></>;

    resultTree.map((item) => {
      const icon = getCatalogIconUrlByType(item.type, {
        isSettingsCatalog: true,
      });
      items.push(
        <CatalogItem
          key={item.key}
          id={item.key}
          icon={icon}
          showText={showText}
          text={mapKeys(item.tKey)}
          value={item.link}
          isActive={item.key === selectedKeys[0][0]}
          onClick={() => onSelect(item.key)}
          folderId={item.id}
          style={{
            marginTop: `${
              item.key.includes(7) || item.key.includes(8) ? "16px" : "0"
            }`,
          }}
        />
      );
    });

    return items;
  };

  const items = catalogItems();

  return !isLoadedArticleBody || isProfileLoading ? (
    <LoaderArticleBody />
  ) : (
    <>{items}</>
  );
};

export default inject(({ auth, common, clientLoadingStore }) => {
  const { isLoadedArticleBody, setIsLoadedArticleBody } = common;
  const {
    currentTariffStatusStore,
    userStore,
    isEnterprise,
    settingsStore,
    isCommunity,
  } = auth;
  const { isNotPaidPeriod } = currentTariffStatusStore;
  const { user } = userStore;
  const { isOwner } = user;
  const { standalone, showText, toggleArticleOpen, currentDeviceType } =
    settingsStore;

  const isProfileLoading =
    window.location.pathname.includes("profile") &&
    clientLoadingStore.showProfileLoader &&
    !isLoadedArticleBody;

  return {
    standalone,
    isEnterprise,
    showText,
    toggleArticleOpen,
    isLoadedArticleBody,
    setIsLoadedArticleBody,
    isNotPaidPeriod,
    isOwner,
    isCommunity,
    currentDeviceType,
    isProfileLoading,
  };
})(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(ArticleBodyContent))
  )
);
