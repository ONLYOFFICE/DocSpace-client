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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type {
  NavMenuGroup,
  NavMenuItem,
} from "@docspace/ui-kit/components/nav-menu";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import { getBrandName } from "@docspace/shared/constants/brands";

import {
  settingsTree,
  getSelectedLinkByKey,
} from "SRC_DIR/pages/PortalSettings/utils";
import AppsSidebar from "SRC_DIR/components/AppsSidebar";

type PortalSettingsSidebarProps = {
  isNotPaidPeriod: boolean;
  isOwner: boolean;
  standalone: boolean;
  isCommunity: boolean;
  baseDomain?: string;
  aiServicesEnabled: boolean;
  setIsLoadedArticleBody: (value: boolean) => void;
  showPortalSettingsLoader?: boolean;
  showProfileLoader?: boolean;
};

const PortalSettingsSidebar = ({
  isNotPaidPeriod,
  isOwner,
  standalone,
  isCommunity,
  baseDomain,
  aiServicesEnabled,
  setIsLoadedArticleBody,
  showPortalSettingsLoader,
  showProfileLoader,
}: PortalSettingsSidebarProps) => {
  const { t, ready } = useTranslation(["Settings", "Ldap", "OAuth", "Common"]);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (ready) setIsLoadedArticleBody(true);
  }, [ready, setIsLoadedArticleBody]);

  const mapLabel = (tKey: string): string => {
    switch (tKey) {
      case "Customization":
        return t("Settings:Customization");
      case "ManagementCategorySecurity":
        return t("Settings:ManagementCategorySecurity");
      case "Common:Backup":
        return t("Common:Backup");
      case "Common:RestoreBackup":
        return t("Common:RestoreBackup");
      case "ManagementCategoryIntegration":
        return t("Settings:ManagementCategoryIntegration");
      case "DataImport":
        return t("Settings:DataImport");
      case "StorageManagement":
        return t("Settings:StorageManagement");
      case "Services":
        return t("Settings:Services");
      case "AISettings":
        return t("Settings:AISettings");
      case "PortalDeletion":
        return t("Settings:PortalDeletion", {
          productName: getBrandName("ProductName"),
        });
      case "Common:PaymentsTitle":
        return standalone ? t("Common:PaymentsTitle") : t("Common:Billing");
      case "Common:Bonus":
        return t("Common:Bonus");
      default:
        return tKey;
    }
  };

  const activeId = React.useMemo(() => {
    const { pathname } = location;
    if (pathname.includes("customization")) return "0";
    if (pathname.includes("security")) return "1";
    if (pathname.includes("restore")) return "3";
    if (pathname.includes("backup")) return "2";
    if (pathname.includes("integration")) return "4";
    if (pathname.includes("data-import")) return "5";
    if (pathname.includes("storage-management")) return "6-1";
    if (pathname.includes("management")) return "6";
    if (pathname.includes("ai-settings")) return "7";
    if (pathname.includes("delete-data")) return "9";
    if (pathname.includes("payments")) return "10";
    if (pathname.includes("bonus")) return "11";
    return undefined;
  }, [location]);

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    let resultTree = [...settingsTree];

    if (!aiServicesEnabled) {
      resultTree = resultTree.filter((e) => e.tKey !== "AISettings");
    }

    if (isNotPaidPeriod) {
      resultTree = resultTree.filter(
        (e) =>
          e.tKey === "Common:Backup" ||
          e.tKey === "Common:PaymentsTitle" ||
          (isOwner && e.tKey === "PortalDeletion"),
      );
    }

    if (standalone) {
      const toRemove = isCommunity
        ? ["Common:PaymentsTitle", "Services"]
        : ["Common:Bonus", "Services"];
      toRemove.forEach((key) => {
        const idx = resultTree.findIndex((e) => e.tKey === key);
        if (idx !== -1) resultTree.splice(idx, 1);
      });
    } else {
      const idx = resultTree.findIndex((e) => e.tKey === "Common:Bonus");
      if (idx !== -1) resultTree.splice(idx, 1);
    }

    if (!isOwner || (baseDomain && baseDomain === "localhost")) {
      const idx = resultTree.findIndex((e) => e.tKey === "PortalDeletion");
      if (idx !== -1) resultTree.splice(idx, 1);
    }

    const items: NavMenuItem[] = resultTree.map((item) => {
      // SaaS billing lives under its own /billing article; standalone keeps
      // the enterprise payments page under /portal-settings/payments.
      const path =
        item.tKey === "Common:PaymentsTitle" && !standalone
          ? "/billing"
          : `/portal-settings${getSelectedLinkByKey(`${item.key}-0`, settingsTree)}`;
      return {
        id: String(item.key),
        label: mapLabel(item.tKey),
        icon: getCatalogIconUrlByType(item.type, { isSettingsCatalog: true }),
        onClick: () => navigate(path),
      };
    });

    return [{ id: "portal-settings", items }];
  }, [
    t,
    navigate,
    isNotPaidPeriod,
    isOwner,
    standalone,
    isCommunity,
    baseDomain,
    aiServicesEnabled,
  ]);

  const isNavLoading = location.pathname.includes("/profile")
    ? showProfileLoader
    : showPortalSettingsLoader;

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      variant="secondary"
      isNavLoading={isNavLoading}
      hideBack={isNotPaidPeriod}
    />
  );
};

export default inject<TStore>(
  ({
    settingsStore,
    userStore,
    currentTariffStatusStore,
    common,
    clientLoadingStore,
  }) => ({
    isNotPaidPeriod: currentTariffStatusStore.isNotPaidPeriod,
    isCommunity: currentTariffStatusStore.isCommunity,
    isOwner: userStore.user?.isOwner ?? false,
    standalone: settingsStore.standalone,
    baseDomain: settingsStore.baseDomain,
    aiServicesEnabled: settingsStore.aiServicesEnabled,
    setIsLoadedArticleBody: common.setIsLoadedArticleBody,
    showPortalSettingsLoader: clientLoadingStore.showPortalSettingsLoader,
    showProfileLoader: clientLoadingStore.showProfileLoader,
  }),
)(observer(PortalSettingsSidebar));

