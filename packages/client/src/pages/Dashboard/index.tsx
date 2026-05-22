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
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import PortalLogo from "@docspace/ui-kit/components/portal-logo/PortalLogo";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TwoStateToggle } from "@docspace/ui-kit/components/two-state-toggle";
import { getPersonalFolderTree } from "@docspace/shared/api/files";
import { getConstName } from "@docspace/shared/constants/consts";
import { getBrandName } from "@docspace/shared/constants/brands";

import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import BgPatternGreenUrl from "PUBLIC_DIR/images/background.pattern.green.react.svg?url";

import { useAppsCatalog, type AppId } from "SRC_DIR/helpers/apps-catalog";

import { ModuleCard, type ModuleItem } from "./ModuleCard";
import { getGreetingKey, makeCreateUrl, NEW_FILE_NAMES } from "./utils";
import { InstallAiFormsDialog, InstallDocsCloudDialog } from "./InstallModuleDialog";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  firstName?: string;
  pricingUrl?: string;
  isAdminOrOwner: boolean;
  isAppEnabled: (id: string) => boolean;
  activate: (id: string) => Promise<boolean>;
  ensureAppsLoaded: () => void;
}

const Dashboard = ({
  firstName,
  pricingUrl,
  isAdminOrOwner,
  isAppEnabled,
  activate,
  ensureAppsLoaded,
}: DashboardProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [myFolderId, setMyFolderId] = React.useState<number | null>(null);
  const [installDialogVisible, setInstallDialogVisible] = React.useState(false);
  const [docsCloudDialogVisible, setDocsCloudDialogVisible] = React.useState(false);

  React.useEffect(() => {
    ensureAppsLoaded();
  }, [ensureAppsLoaded]);

  React.useEffect(() => {
    getPersonalFolderTree()
      .then(([folder]) => setMyFolderId(folder.id as number))
      .catch((err) => {
        console.error("Failed to load personal folder tree", err);
      });
  }, []);

  const createItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "document",
        icon: <CreateDocumentIcon />,
        label: t("Common:Document"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.document, myFolderId),
            "_blank",
          ),
      },
      {
        id: "spreadsheet",
        icon: <CreateSpreadsheetIcon />,
        label: t("Common:Spreadsheet"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.spreadsheet, myFolderId),
            "_blank",
          ),
      },
      {
        id: "presentation",
        icon: <CreatePresentationIcon />,
        label: t("Common:Presentation"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.presentation, myFolderId),
            "_blank",
          ),
      },
      {
        id: "pdf",
        icon: <BlankPdfIcon />,
        label: getConstName("PDF"),
        onClick: () =>
          window.open(makeCreateUrl(NEW_FILE_NAMES.pdf, myFolderId), "_blank"),
      },
    ],
    [t, myFolderId],
  );

  const appsCatalog = useAppsCatalog();

  const handleInstall = async (modId: AppId) => {
    if (modId === "ai-forms") {
      try {
        const activated = await activate("ai-forms");
        if (activated) {
          navigate("/ai-forms");
        } else {
          setInstallDialogVisible(true);
        }
      } catch (err) {
        console.error("Failed to activate ai-forms", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
      return;
    }

    if (modId === "docs-cloud") {
      if (isAppEnabled("docs-cloud")) {
        navigate("/docs-cloud");
      } else {
        setDocsCloudDialogVisible(true);
      }
      return;
    }

    toastr.info(t("Common:UnderDevelopment"));
  };

  const handleInstalled = () => {
    setInstallDialogVisible(false);
    navigate("/ai-forms");
  };

  const handleDocsCloudInstalled = () => {
    setDocsCloudDialogVisible(false);
    navigate("/docs-cloud");
  };

  const greetingName = firstName ? `, ${firstName}` : "";
  const greetingKey = getGreetingKey();
  const greeting =
    greetingKey === "GoodMorning"
      ? t("Common:GoodMorning", { name: greetingName })
      : greetingKey === "GoodAfternoon"
        ? t("Common:GoodAfternoon", { name: greetingName })
        : t("Common:GoodEvening", { name: greetingName });

  const design = searchParams.get("design");
  if (design === "old") {
    localStorage.setItem("useDocSpace", "old");
    return <Navigate to="/" replace />;
  }
  if (design === "new") {
    localStorage.setItem("useDocSpace", "new");
    return <Navigate to="/dashboard" replace />;
  }

  const moduleItems: ModuleItem[] = appsCatalog
    .map((app) => ({
      id: app.id,
      icon: app.icon,
      title: app.title,
      description: app.description,
      installed: app.alwaysOn ? true : isAppEnabled(app.id),
      href: app.href,
    }))
    .filter((mod) => isAdminOrOwner || mod.installed);

  return (
    <div className={styles.dashboard}>
      <TwoStateToggle
        className={styles.viewToggle}
        onNavigate={(url) => navigate(url)}
      />
      <PortalLogo className={styles.logo} />

      <Text as="h1" className={styles.greeting}>
        {greeting}
      </Text>

      <section className={styles.section}>
        <Text as="h2" className={styles.sectionTitle}>
          {t("Common:CreateNew")}
        </Text>
        <QuickActions items={createItems} className={styles.quickActions} />
      </section>

      <section className={styles.section}>
        <Text as="h2" className={styles.sectionTitle}>
          {t("Common:Modules")}
        </Text>
        {isAdminOrOwner && (
          <Text as="p" className={styles.sectionSubtitle}>
            {t("Common:DashboardModulesSubtitle", {
              productName: getBrandName("ProductName"),
            })}
          </Text>
        )}

        {isAdminOrOwner && (
          <div
            className={styles.modulesBanner}
            style={
              {
                "--modules-banner-bg": `url('${BgPatternGreenUrl}')`,
              } as React.CSSProperties
            }
          >
            <div className={styles.modulesBannerText}>
              <Text as="p" className={styles.modulesBannerTitle}>
                {t("Common:DashboardModulesBannerText")}
              </Text>
              <div className={styles.modulesBannerTags}>
                <Text as="span" className={styles.modulesBannerTag}>
                  {t("Common:NoBundlesRequired")}
                </Text>
                <Text as="span" className={styles.modulesBannerTag}>
                  {t("Common:AddOrRemoveAnytime")}
                </Text>
                <Text as="span" className={styles.modulesBannerTag}>
                  {t("Common:PayPerModule")}
                </Text>
              </div>
            </div>
            <Button
              className={styles.modulesPricingBtn}
              label={t("Common:SeePricing")}
              size={ButtonSize.small}
              isDisabled={!pricingUrl}
              onClick={() => {
                if (pricingUrl) window.open(pricingUrl, "_blank");
              }}
            />
          </div>
        )}

        <div className={styles.modulesGrid}>
          {moduleItems.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              onInstall={() => handleInstall(mod.id as AppId)}
            />
          ))}
        </div>
      </section>

      <InstallAiFormsDialog
        visible={installDialogVisible}
        onClose={() => setInstallDialogVisible(false)}
        onInstalled={handleInstalled}
      />

      <InstallDocsCloudDialog
        visible={docsCloudDialogVisible}
        onClose={() => setDocsCloudDialogVisible(false)}
        onInstalled={handleDocsCloudInstalled}
      />
    </div>
  );
};

const DashboardConnected = inject<TStore>(
  ({ userStore, settingsStore, appsStore }) => ({
    firstName: userStore.user?.firstName,
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
    pricingUrl: settingsStore.docspacePricesUrl,
    isAppEnabled: appsStore.isEnabled,
    activate: appsStore.activate,
    ensureAppsLoaded: appsStore.ensureLoaded,
  }),
)(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;
