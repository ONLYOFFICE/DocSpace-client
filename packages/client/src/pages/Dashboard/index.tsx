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

import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import CatalogFolderIcon from "@docspace/ui-kit/assets/icons/16/catalog.folder.react.svg";
import CatalogRoomsIcon from "@docspace/ui-kit/assets/icons/16/catalog.rooms.react.svg";
import CatalogDocumentsIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import AiAgentsIcon from "@docspace/ui-kit/assets/icons/16/ai-agents.svg";

import BgPatternGreenUrl from "PUBLIC_DIR/images/background.pattern.green.react.svg?url";

import { ModuleCard, type ModuleItem } from "./ModuleCard";
import {
  getGreetingKey,
  isModuleInstalled,
  makeCreateUrl,
  NEW_FILE_NAMES,
} from "./utils";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  firstName?: string;
  pricingUrl?: string;
}

const Dashboard = ({ firstName, pricingUrl }: DashboardProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [myFolderId, setMyFolderId] = React.useState<number | null>(null);

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

  const handleInstall = () => {
    toastr.info(t("Common:UnderDevelopment"));
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

  const moduleItems: ModuleItem[] = [
    {
      id: "ai-files",
      icon: <CatalogFolderIcon />,
      title: t("Common:DashboardAIFilesTitle"),
      description: t("Common:DashboardAIFilesDescription"),
      installed: isModuleInstalled("ai-files"),
      href: "/sdk/personal-files",
    },
    {
      id: "ai-rooms",
      icon: <CatalogRoomsIcon />,
      title: t("Common:DashboardAIRoomsTitle"),
      description: t("Common:DashboardAIRoomsDescription"),
      installed: isModuleInstalled("ai-rooms"),
    },
    {
      id: "ai-forms",
      icon: <CatalogDocumentsIcon />,
      title: t("Common:DashboardAIFormsTitle"),
      description: t("Common:DashboardAIFormsDescription"),
      installed: isModuleInstalled("ai-forms"),
      href: "/sdk/forms",
    },
    {
      id: "ai-agents",
      icon: <AiAgentsIcon />,
      title: t("Common:DashboardAIChatAgentsTitle"),
      description: t("Common:DashboardAIChatAgentsDescription"),
      installed: isModuleInstalled("ai-agents"),
    },
  ];

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
        <Text as="p" className={styles.sectionSubtitle}>
          {t("Common:DashboardModulesSubtitle")}
        </Text>

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

        <div className={styles.modulesGrid}>
          {moduleItems.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} onInstall={handleInstall} />
          ))}
        </div>
      </section>
    </div>
  );
};

const DashboardConnected = inject(
  ({
    userStore,
    settingsStore,
  }: {
    userStore: { user: { firstName?: string } | null };
    settingsStore: { docspacePricesUrl?: string };
  }) => ({
    firstName: userStore.user?.firstName,
    pricingUrl: settingsStore.docspacePricesUrl,
  }),
)(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;

