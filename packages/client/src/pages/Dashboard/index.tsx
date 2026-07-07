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
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useTranslation, Trans } from "react-i18next";

import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { FloatingButton } from "@docspace/ui-kit/components/floating-button";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import CatalogRoomsIcon from "@docspace/ui-kit/assets/icons/16/catalog.rooms.react.svg";
import CatalogFolderIcon from "@docspace/ui-kit/assets/icons/16/catalog.folder.react.svg";
import CatalogDocumentsIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import AiAgentsIcon from "@docspace/ui-kit/assets/icons/16/ai-agents.svg";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";
import { useAppPromo } from "SRC_DIR/components/dialogs/AppPromoDialog";
import type { AppId } from "SRC_DIR/helpers/apps-catalog";

import { ModuleCard, type ModuleItem } from "./sub-components/ModuleCard";
import { ProfileCard } from "./sub-components/ProfileCard";
import { IntegrationsCard } from "./sub-components/IntegrationsCard";
import { DevToolsCard } from "./sub-components/DevToolsCard";
import { Header } from "./sub-components/Header";
import { DashboardLoader } from "./sub-components/DashboardLoader";
import { useUploadToMyDocuments } from "./hooks/useUploadToMyDocuments";
import { useCreateActions } from "./hooks/useCreateActions";
import { useMyFolderId } from "./hooks/useMyFolderId";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  isGuest: boolean;
  showLoader: boolean;
}

const Dashboard = ({ isGuest, showLoader }: DashboardProps) => {
  const { t } = useTranslation(["Common", "OAuth"]);
  useDocumentTitle("Common:Overview");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const myFolderId = useMyFolderId();
  const openFiles = React.useCallback(() => {
    navigate("/rooms/personal/filter");
  }, [navigate]);
  const { openUploadDialog, progress, clearProgress } = useUploadToMyDocuments(
    myFolderId,
    openFiles,
  );
  const createItems = useCreateActions(myFolderId);

  // First-run "introduce this app" promo. The clicked card's href is stashed in
  // a ref so the promo's confirm callback can navigate to it after the user
  // sees the promo. Apps without promo content fall straight through to navigate.
  const promoHrefRef = React.useRef<string | undefined>(undefined);
  const { maybeShowPromo, promoDialog } = useAppPromo(() => {
    if (promoHrefRef.current) navigate(promoHrefRef.current);
  });

  // The dashboard renders its own content (no SDK iframe). Tell the
  // persistent host to drop the previous app's frame so it doesn't linger
  // behind the dashboard.
  useSdkFrame({ appId: "dashboard", enabled: false });

  // The dashboard has no async content to load, so finish the sidebar's
  // Overview item progress animation immediately (other pages dispatch this
  // once their content is ready).
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
  }, []);

  const design = searchParams.get("design");
  if (design === "old") {
    localStorage.setItem("useDocSpace", "old");
    return <Navigate to="/" replace />;
  }
  if (design === "new") {
    localStorage.setItem("useDocSpace", "new");
    return <Navigate to="/dashboard" replace />;
  }

  // On first app load the sidebar shows its nav skeleton until initFiles
  // resolves; render the matching body skeleton so the Overview doesn't pop in
  // ahead of the navigation it sits next to.
  if (showLoader) return <DashboardLoader />;

  const moduleItems: ModuleItem[] = [
    {
      id: "ai-files",
      icon: <CatalogFolderIcon />,
      title: t("Common:DashboardFilesTitle"),
      description: t("Common:DashboardFilesDescription"),
      installed: !isGuest,
      href: "/rooms/personal/filter",
    },
    {
      id: "ai-rooms",
      icon: <CatalogRoomsIcon />,
      title: t("Common:DashboardRoomsTitle"),
      description: t("Common:DashboardRoomsDescription"),
      installed: true,
      href: "/rooms/shared/filter",
    },
    {
      id: "ai-forms",
      icon: <CatalogDocumentsIcon />,
      title: t("Common:DashboardFormsTitle"),
      description: t("Common:DashboardFormsDescription"),
      installed: true,
      href: "/forms/filter",
    },
    {
      id: "ai-agents",
      icon: <AiAgentsIcon />,
      title: t("Common:DashboardAIChatAgentsTitle"),
      description: t("Common:DashboardAIChatAgentsDescription"),
      installed: true,
      href: "/ai-agents/filter",
    },
  ].filter((mod) => mod.installed);

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
                  onClick={() => {
                    promoHrefRef.current = mod.href;
                    // Show the app's promo on first open; it navigates on
                    // confirm. Already-seen / no-promo apps navigate directly.
                    if (maybeShowPromo(mod.id as AppId)) return;
                    if (mod.href) navigate(mod.href);
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        <IntegrationsCard />
        <DevToolsCard />
      </div>

      {progress.isUploading ? (
        <FloatingButton
          icon="upload"
          percent={progress.percent}
          completed={progress.completed}
          alert={progress.alert}
          showCancelButton={progress.completed || progress.alert}
          clearUploadedFilesHistory={clearProgress}
        />
      ) : null}

      {promoDialog}
    </div>
  );
};

const DashboardConnected = inject<TStore>(
  ({ userStore, clientLoadingStore }) => ({
    isGuest: userStore.user?.isVisitor ?? false,
    showLoader: clientLoadingStore.showArticleLoader,
  }),
)(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;

