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
import { Navigate, useSearchParams } from "react-router";
import { useTranslation, Trans } from "react-i18next";

import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import { useAppsCatalog, type AppId } from "SRC_DIR/helpers/apps-catalog";

import { ModuleCard, type ModuleItem } from "./sub-components/ModuleCard";
import { ProfileCard } from "./sub-components/ProfileCard";
import { IntegrationsCard } from "./sub-components/IntegrationsCard";
import { DevToolsCard } from "./sub-components/DevToolsCard";
import { Header } from "./sub-components/Header";
import { useUploadToMyDocuments } from "./hooks/useUploadToMyDocuments";
import { useCreateActions } from "./hooks/useCreateActions";
import { useMyFolderId } from "./hooks/useMyFolderId";
import { useModuleLauncher } from "./hooks/useModuleLauncher";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  isGuest: boolean;
  isAppEnabled: (id: string) => boolean;
  activate: (id: string) => Promise<boolean>;
  enable: (id: string, enabled: boolean) => Promise<unknown>;
  ensureAppsLoaded: () => void;
}

const Dashboard = ({
  isGuest,
  isAppEnabled,
  activate,
  enable,
  ensureAppsLoaded,
}: DashboardProps) => {
  const { t } = useTranslation(["Common", "OAuth"]);
  useDocumentTitle("Common:Overview");
  const [searchParams] = useSearchParams();

  const myFolderId = useMyFolderId();
  const { openUploadDialog } = useUploadToMyDocuments(myFolderId);
  const createItems = useCreateActions(myFolderId);
  const { launchApp, dialogs } = useModuleLauncher({
    activate,
    enable,
    isAppEnabled,
  });

  const appsCatalog = useAppsCatalog();

  React.useEffect(() => {
    ensureAppsLoaded();
  }, [ensureAppsLoaded]);

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
    .filter((app) => !(isGuest && app.id === "ai-files"))
    .map((app) => ({
      id: app.id,
      icon: app.icon,
      title: app.title,
      description: app.description,
      installed: app.alwaysOn ? true : isAppEnabled(app.id),
      href: app.href,
    }))
    .filter((mod) => mod.installed);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        <Header />
        <ProfileCard />

        <section className={styles.section}>
          <Text fontSize="18px" fontWeight={700} lineHeight="24px">
            <Trans
              t={t}
              ns="Common"
              i18nKey="CreateNewOrUpload"
              components={{
                1: (
                  <Link
                    type={LinkType.action}
                    color="accent"
                    isHovered
                    fontSize="18px"
                    fontWeight={700}
                    lineHeight="24px"
                    onClick={openUploadDialog}
                  />
                ),
              }}
            />
          </Text>
          <QuickActions items={createItems} className={styles.quickActions} />
        </section>

        {moduleItems.length > 0 ? (
          <section className={styles.section}>
            <Text className={styles.sectionTitle}>{t("OAuth:Apps")}</Text>
            <div className={styles.modulesGrid}>
              {moduleItems.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  onClick={() => launchApp(mod.id as AppId, mod.href)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <IntegrationsCard />
        <DevToolsCard />
      </div>

      {dialogs}
    </div>
  );
};

const DashboardConnected = inject<TStore>(({ userStore, appsStore }) => ({
  isGuest: userStore.user?.isVisitor ?? false,
  isAppEnabled: appsStore.isEnabled,
  activate: appsStore.activate,
  enable: appsStore.enable,
  ensureAppsLoaded: appsStore.ensureLoaded,
}))(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;

