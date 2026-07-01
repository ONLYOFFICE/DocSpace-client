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

import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";

import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { TableGroupMenu } from "@docspace/ui-kit/components/table";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { isMobile } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { DeviceType } from "@docspace/shared/enums";

import TariffBar from "SRC_DIR/components/TariffBar";
import { IMPORT_HEADER_CONST } from "SRC_DIR/pages/PortalSettings/utils/settingsTree";

import Warning from "../../WarningComponent";
import {
  getKeyByLink,
  settingsTree,
  getTKeyByKey,
  checkPropertyByLink,
} from "../../../utils";
import LoaderSectionHeader from "../loaderSectionHeader";
import { getBrandName } from "@docspace/shared/constants/brands";

import classNames from "classnames";

import {
  getDocsConnectDaysLeft,
  isDocsConnectTrialExpired,
  isDocsConnectPaid,
} from "SRC_DIR/pages/PortalSettings/categories/developer-tools/DocsConnect/utils";

import styles from "./Header.module.scss";

export const HeaderContainer = ({ children, className = "", ...props }) => (
  <div className={classNames(styles.headerContainer, className)} {...props}>
    {children}
  </div>
);

export const StyledContainer = ({ children, className = "" }) => (
  <div className={classNames(styles.styledContainer, className)}>
    {children}
  </div>
);

const SectionHeaderContent = (props) => {
  const {
    isCustomizationAvailable,
    isRestoreAndAutoBackupAvailable,
    tReady,
    setIsLoadedSectionHeader,
    isSSOAvailable,
    workspace,
    standalone,
    getHeaderMenuItems,
    setSelections,
    selectorIsOpen,
    toggleSelector,
    removeAdmins,
    deviceType,
    isNotPaidPeriod,
    isBackupPaid,
    isFreeTariff,
    docsConnectInfo,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { isBase } = useTheme();

  const isOAuth = location.pathname.includes("oauth");

  const [state, setState] = React.useState({
    header: "",
    isCategoryOrHeader: false,
    showSelector: false,
    isHeaderVisible: false,
  });

  const getArrayOfParams = useCallback(() => {
    const path = location.pathname;
    const arrayPath = path.split("/");
    const arrayOfParams = arrayPath.filter((param) => {
      return param && param !== "filter" && param !== "portal-settings";
    });

    return arrayOfParams;
  }, [location.pathname]);

  const isAvailableSettings = useCallback(
    (key) => {
      switch (key) {
        case "PortalRenaming":
          return isCustomizationAvailable;
        case "DNSSettings":
          return isCustomizationAvailable;
        case "Common:RestoreBackup":
          return isRestoreAndAutoBackupAvailable;
        case "Common:BrandName":
          return isCustomizationAvailable || standalone;
        case "Common:WhiteLabel":
          return isCustomizationAvailable || standalone;
        case "CompanyInfoSettings":
          return isCustomizationAvailable || standalone;
        case "AdditionalResources":
          return isCustomizationAvailable || standalone;
        case "SingleSignOn:ServiceProviderSettings":
        case "SingleSignOn:SpMetadata":
          return isSSOAvailable;
        case "Backup":
          if (isNotPaidPeriod) return true;
          return !isBackupPaid;
        default:
          return true;
      }
    },
    [
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
      standalone,
      isNotPaidPeriod,
      isBackupPaid,
    ],
  );

  React.useEffect(() => {
    if (tReady) setIsLoadedSectionHeader(true);

    const arrayOfParams = getArrayOfParams();

    const serviceSubPageHeaders = {
      backup: isFreeTariff ? "Common:Backup" : t("Common:AdditionalBackup"),
      "ai-services": "Common:AIFeatures",
      "disk-storage": "Common:AdditionalDiskStorage",
      "docs-connect": "DocsConnect:DocsConnect",
    };

    let number = 1;
    if (
      window.location.href.includes("disk-storage") ||
      window.location.href.includes("docs-connect")
    )
      number = 2;
    const serviceSubPageHeader = serviceSubPageHeaders[arrayOfParams[number]];

    if (serviceSubPageHeader) {
      const header = serviceSubPageHeader;
      const isCategoryOrHeader = false;

      setState((val) => {
        if (
          val.header === header &&
          val.isCategoryOrHeader === isCategoryOrHeader
        )
          return val;
        return { ...val, header, isCategoryOrHeader };
      });
      return;
    }

    const key = getKeyByLink(arrayOfParams, settingsTree);

    const keysCollection = key.split("-");

    const currKey = keysCollection.length >= 3 ? key : keysCollection[0];

    const header = getTKeyByKey(currKey, settingsTree);
    const isCategory = checkPropertyByLink(
      arrayOfParams,
      settingsTree,
      "isCategory",
    );
    const isHeader = checkPropertyByLink(
      arrayOfParams,
      settingsTree,
      "isHeader",
    );

    const isCategoryOrHeader = isCategory || isHeader;

    const isNeedPaidIcon = !isAvailableSettings(header);

    setState((val) => {
      if (
        val.header === header &&
        val.isCategoryOrHeader === isCategoryOrHeader &&
        val.isNeedPaidIcon === isNeedPaidIcon
      )
        return val;
      return { ...val, header, isCategoryOrHeader, isNeedPaidIcon };
    });
  }, [
    tReady,
    setIsLoadedSectionHeader,
    getArrayOfParams,
    isAvailableSettings,
    location.pathname,
    isFreeTariff,
  ]);

  const onBackToParent = () => {
    const isServicesSubPage =
      location.pathname.includes("/services/disk-storage") ||
      location.pathname.includes("/services/backup") ||
      location.pathname.includes("/services/ai-services") ||
      location.pathname.includes("/services/docs-connect");

    if (isServicesSubPage && location.key === "default") {
      navigate("/portal-settings/payments/services");
      return;
    }

    navigate(-1);
  };

  const onToggleSelector = (isOpen = !selectorIsOpen) => {
    toggleSelector(isOpen);
  };

  const onCheck = (checked) => {
    if (isOAuth) {
      setSelections(checked);
      return;
    }

    const { setSelected } = props;
    setSelected(checked ? "all" : "close");
  };

  const onSelectAll = () => {
    const { setSelected } = props;
    setSelected("all");
  };

  const onClick = () => {
    if (!removeAdmins) return;
    removeAdmins();
  };

  const {
    t,
    isLoadedSectionHeader,

    isHeaderIndeterminate,
    isHeaderChecked,
    isHeaderVisible,
    selection,
    addUsers,
    logoText,
  } = props;

  const { header, isCategoryOrHeader, isNeedPaidIcon } = state;
  const arrayOfParams = getArrayOfParams();

  const menuItems = (
    <DropDownItem
      key="all"
      label={t("Common:SelectAll")}
      data-index={1}
      onClick={onSelectAll}
    />
  );

  const headerMenu = isOAuth
    ? getHeaderMenuItems(t, true)
    : [
        {
          label: t("Common:Delete"),
          disabled: !selection || !selection.length > 0,
          onClick,
          iconUrl: DeleteReactSvgUrl,
        },
      ];

  const isPaymentPage =
    location.pathname.includes("portal-settings/payments/") &&
    !location.pathname.includes("portal-settings/payments/services/");

  const translatedHeader =
    header === IMPORT_HEADER_CONST
      ? workspace === "GoogleWorkspace"
        ? t("ImportFromGoogle")
        : workspace === "Nextcloud"
          ? t("ImportFromNextcloud")
          : workspace === "Workspace"
            ? t("ImportFromPortal", {
                organizationName: logoText,
              })
            : t("DataImport")
      : !standalone && isPaymentPage
        ? t("Common:Billing")
        : // biome-ignore lint/plugin/no-dynamic-i18n-key: header is passed from route config; underlying keys are declared as literals at callsites
          t(header, {
            organizationName: logoText,
            license: t("Common:EnterpriseLicense"),
            productName: getBrandName("ProductName"),
            aiServices: t("Common:AIServices"),
          });

  const isDocsConnectServicePage = location.pathname.includes(
    "/services/docs-connect",
  );
  const docsConnectEndDate = docsConnectInfo?.tenant?.endDate ?? "";
  const docsConnectPaid = docsConnectInfo
    ? isDocsConnectPaid(docsConnectInfo)
    : false;
  const docsConnectExpired = isDocsConnectTrialExpired(docsConnectEndDate);
  const docsConnectDaysLeft = getDocsConnectDaysLeft(docsConnectEndDate);
  const docsConnectTrialLow = !docsConnectExpired && docsConnectDaysLeft <= 14;

  return (
    <StyledContainer>
      {isHeaderVisible ? (
        <TableGroupMenu
          checkboxOptions={menuItems}
          onChange={onCheck}
          isChecked={isHeaderChecked}
          isIndeterminate={isHeaderIndeterminate}
          headerMenu={headerMenu}
          withComboBox={false}
          withoutInfoPanelToggler
          isMobileView={false}
        />
      ) : !isLoadedSectionHeader ? (
        <LoaderSectionHeader />
      ) : (
        <HeaderContainer>
          {!isCategoryOrHeader &&
          arrayOfParams[0] &&
          (isMobile() ||
            window.location.href.indexOf("/javascript-sdk/") > -1 ||
            window.location.href.indexOf("/ai-services") > -1 ||
            window.location.href.indexOf("/services/backup") > -1 ||
            window.location.href.indexOf("/services/docs-connect") > -1 ||
            window.location.href.indexOf("disk-storage") > -1) ? (
            <IconButton
              iconName={ArrowPathReactSvgUrl}
              size="17"
              isFill
              onClick={onBackToParent}
              className="arrow-button"
              dataTestId="back_parent_icon_button"
            />
          ) : null}
          <Heading type="content" truncate>
            <div className="settings-section_header">
              <div className="header">{translatedHeader}</div>
              {isDocsConnectServicePage &&
              docsConnectEndDate &&
              !docsConnectPaid ? (
                <span
                  className={classNames(styles.docsConnectTrialBadge, {
                    [styles.docsConnectTrialBadgeWarning]: docsConnectTrialLow,
                    [styles.docsConnectTrialBadgeExpired]: docsConnectExpired,
                  })}
                >
                  {docsConnectExpired
                    ? t("Common:TrialExpired")
                    : t("Common:FreeDaysLeft", { count: docsConnectDaysLeft })}
                </span>
              ) : null}
              {isNeedPaidIcon ? (
                <Badge
                  backgroundColor={
                    isBase
                      ? globalColors.favoritesStatus
                      : globalColors.favoriteStatusDark
                  }
                  label={t("Common:Paid")}
                  fontWeight="700"
                  className="settings-section_badge"
                  isPaidBadge
                />
              ) : (
                ""
              )}
            </div>
          </Heading>
          {deviceType === DeviceType.desktop ? (
            <div className="settings-section_warning">
              <Warning />
            </div>
          ) : null}
          {arrayOfParams[0] !== "payments" && arrayOfParams.length < 3 ? (
            <div className="tariff-bar">
              <TariffBar />
            </div>
          ) : null}
          {addUsers ? (
            <div className="action-wrapper">
              <IconButton
                iconName={ActionsHeaderTouchReactSvgUrl}
                size="17"
                isFill
                onClick={onToggleSelector}
                className="action-button"
              />
            </div>
          ) : null}
        </HeaderContainer>
      )}
    </StyledContainer>
  );
};

export default inject(
  ({
    currentQuotaStore,
    setup,
    common,
    importAccountsStore,
    settingsStore,
    oauthStore,
    currentTariffStatusStore,
    docsConnectStore,
  }) => {
    const {
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
      isBackupPaid,
      isFreeTariff,
    } = currentQuotaStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { addUsers, removeAdmins } = setup.headerAction;
    const { toggleSelector } = setup;
    const {
      selected,
      setSelected,
      isHeaderIndeterminate,
      isHeaderChecked,
      isHeaderVisible,
      deselectUser,
      selectAll,
      selection,
    } = setup.selectionStore;
    const { admins, selectorIsOpen } = setup.security.accessRight;
    const { isLoadedSectionHeader, setIsLoadedSectionHeader } = common;

    const { workspace } = importAccountsStore;
    const { standalone, logoText, deviceType } = settingsStore;

    const { getHeaderMenuItems } = oauthStore;
    return {
      addUsers,
      removeAdmins,
      selected,
      setSelected,
      admins,
      isHeaderIndeterminate:
        isHeaderIndeterminate || oauthStore.isHeaderIndeterminate,
      isHeaderChecked: isHeaderChecked || oauthStore.isHeaderChecked,
      isHeaderVisible: isHeaderVisible || oauthStore.isHeaderVisible,
      deselectUser,
      selectAll,
      toggleSelector,
      selectorIsOpen,
      selection,
      isLoadedSectionHeader,
      setIsLoadedSectionHeader,
      isCustomizationAvailable,
      isRestoreAndAutoBackupAvailable,
      isSSOAvailable,
      workspace,
      standalone,
      getHeaderMenuItems,
      setSelections: oauthStore.setSelections,
      logoText,
      deviceType,
      isNotPaidPeriod,
      isBackupPaid,
      isFreeTariff,
      docsConnectInfo: docsConnectStore?.info,
    };
  },
)(
  withLoading(
    withTranslation([
      "Settings",
      "SingleSignOn",
      "Common",
      "JavascriptSdk",
      "OAuth",
      "Ldap",
      "Payments",
    ])(observer(SectionHeaderContent)),
  ),
);

