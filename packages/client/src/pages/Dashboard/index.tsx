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
import { useTranslation, Trans } from "react-i18next";

import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getPersonalFolderTree } from "@docspace/shared/api/files";
import { getConstName } from "@docspace/shared/constants/consts";

import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import { useAppsCatalog, type AppId } from "SRC_DIR/helpers/apps-catalog";

import { ModuleCard, type ModuleItem } from "./sub-components/ModuleCard";
import { ProfileCard } from "./sub-components/ProfileCard";
import { IntegrationsCard } from "./sub-components/IntegrationsCard";
import { DevToolsCard } from "./sub-components/DevToolsCard";
import { Header } from "./sub-components/Header";
import { useUploadToMyDocuments } from "./sub-components/useUploadToMyDocuments";
import { makeCreateUrl, NEW_FILE_NAMES } from "./utils";
import {
  InstallAiFormsDialog,
  InstallDocsCloudDialog,
} from "./InstallModuleDialog";
import { InstallAiArbiterDialog } from "./InstallAiArbiterDialog";
import { EnableAiRoomsDialog } from "./EnableAiRoomsDialog";
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [myFolderId, setMyFolderId] = React.useState<number | null>(null);
  const [installDialogVisible, setInstallDialogVisible] = React.useState(false);
  const [arbiterDialogVisible, setArbiterDialogVisible] = React.useState(false);
  const [docsCloudDialogVisible, setDocsCloudDialogVisible] =
    React.useState(false);
  const [enableAiRoomsVisible, setEnableAiRoomsVisible] = React.useState(false);
  const [enableAiRoomsLoading, setEnableAiRoomsLoading] = React.useState(false);

  const { openUploadDialog } = useUploadToMyDocuments(myFolderId);

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

  const handleAppClick = async (
    modId: AppId,
    installed: boolean,
    href?: string,
  ) => {
    if (installed && href) {
      navigate(href);
      return;
    }

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
    if (modId === "ai-arbiter") {
      try {
        const activated = await activate("ai-arbiter");
        if (activated) {
          navigate("/ai-arbiter");
        } else {
          setArbiterDialogVisible(true);
        }
      } catch (err) {
        console.error("Failed to activate ai-arbiter", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
      return;
    }

    if (modId === "ai-agents") {
      try {
        const activated = await activate("ai-agents");
        if (activated) {
          navigate("/agents");
        } else {
          toastr.error(t("Common:SomethingWentWrong"));
        }
      } catch (err) {
        console.error("Failed to activate ai-agents", err);
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

    if (modId === "ai-rooms") {
      setEnableAiRoomsVisible(true);
      return;
    }

    toastr.info(t("Common:UnderDevelopment"));
  };

  const handleConfirmEnableAiRooms = async () => {
    setEnableAiRoomsLoading(true);
    try {
      await enable("ai-rooms", true);
      setEnableAiRoomsVisible(false);
      navigate("/ai-rooms");
    } catch (err) {
      console.error("Failed to enable ai-rooms", err);
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      setEnableAiRoomsLoading(false);
    }
  };

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
            <Text as="h2" className={styles.sectionTitle} isBold>
              {t("OAuth:Apps")}
            </Text>
            <div className={styles.modulesGrid}>
              {moduleItems.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  onClick={() =>
                    handleAppClick(mod.id as AppId, mod.installed, mod.href)
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        <IntegrationsCard />
        <DevToolsCard />
      </div>

      <InstallAiFormsDialog
        visible={installDialogVisible}
        onClose={() => setInstallDialogVisible(false)}
        onInstalled={() => {
          setInstallDialogVisible(false);
          navigate("/ai-forms");
        }}
      />
      <InstallAiArbiterDialog
        visible={arbiterDialogVisible}
        onClose={() => setArbiterDialogVisible(false)}
        onInstalled={() => {
          setArbiterDialogVisible(false);
          navigate("/ai-arbiter");
        }}
      />
      <InstallDocsCloudDialog
        visible={docsCloudDialogVisible}
        onClose={() => setDocsCloudDialogVisible(false)}
        onInstalled={() => {
          setDocsCloudDialogVisible(false);
          navigate("/docs-cloud");
        }}
      />
      <EnableAiRoomsDialog
        visible={enableAiRoomsVisible}
        isLoading={enableAiRoomsLoading}
        onClose={() => setEnableAiRoomsVisible(false)}
        onConfirm={handleConfirmEnableAiRooms}
      />
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

