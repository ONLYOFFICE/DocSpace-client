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

import PortalLogo from "@docspace/ui-kit/components/portal-logo/PortalLogo";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getPersonalFolderTree } from "@docspace/shared/api/files";

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
import { getGreeting, makeCreateUrl } from "./utils";
import styles from "./Dashboard.module.scss";

const getCreateItems = (parentId: number | null): QuickActionItem[] => [
  {
    id: "document",
    icon: <CreateDocumentIcon />,
    label: "Document",
    onClick: () =>
      window.open(makeCreateUrl("New document.docx", parentId), "_blank"),
  },
  {
    id: "spreadsheet",
    icon: <CreateSpreadsheetIcon />,
    label: "Spreadsheet",
    onClick: () =>
      window.open(makeCreateUrl("New spreadsheet.xlsx", parentId), "_blank"),
  },
  {
    id: "presentation",
    icon: <CreatePresentationIcon />,
    label: "Presentation",
    onClick: () =>
      window.open(makeCreateUrl("New presentation.pptx", parentId), "_blank"),
  },
  {
    id: "pdf",
    icon: <BlankPdfIcon />,
    label: "PDF",
    onClick: () =>
      window.open(makeCreateUrl("New PDF form.pdf", parentId), "_blank"),
  },
];

const MODULE_ITEMS: ModuleItem[] = [
  {
    icon: <CatalogFolderIcon />,
    title: "AI Files",
    description:
      "Store, organize, and share files across teams  in a structured workspace.",
    installed: true,
    href: "/sdk/personal-files",
  },
  {
    icon: <CatalogRoomsIcon />,
    title: "AI Rooms",
    description:
      "Create secure collaboration spaces for  projects, customers, or departments.",
    installed: false,
  },
  {
    icon: <CatalogDocumentsIcon />,
    title: "AI Forms",
    description:
      "Build forms, collect responses, and manage structured data — all in one place.",
    installed: true,
    href: "/sdk/forms",
  },
  {
    icon: <AiAgentsIcon />,
    title: "AI Chat & Agents",
    description:
      "Bring AI assistants and agents directly  into your workspace.",
    installed: false,
  },
];

interface DashboardProps {
  firstName?: string;
}

const Dashboard = ({ firstName }: DashboardProps) => {
  const [myFolderId, setMyFolderId] = React.useState<number | null>(null);

  React.useEffect(() => {
    getPersonalFolderTree()
      .then(([folder]) => setMyFolderId(folder.id as number))
      .catch(() => {});
  }, []);

  const handleInstall = () => {
    toastr.info("This module is currently under development.");
  };

  return (
    <div className={styles.dashboard}>
      <PortalLogo className={styles.logo} />

      <Text as="h1" className={styles.greeting}>
        {getGreeting(firstName)}
      </Text>

      <section className={styles.section}>
        <Text as="h2" className={styles.sectionTitle}>
          Create new
        </Text>
        <QuickActions
          items={getCreateItems(myFolderId)}
          className={styles.quickActions}
        />
      </section>

      <section className={styles.section}>
        <Text as="h2" className={styles.sectionTitle}>
          Modules
        </Text>
        <Text as="p" className={styles.sectionSubtitle}>
          Expand your DocSpace with premium modules
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
              Each app is licensed separately — install only what fits your
              workflow
            </Text>
            <div className={styles.modulesBannerTags}>
              <Text as="span" className={styles.modulesBannerTag}>
                No bundles required
              </Text>
              <Text as="span" className={styles.modulesBannerTag}>
                Add or remove anytime
              </Text>
              <Text as="span" className={styles.modulesBannerTag}>
                Pay per module
              </Text>
            </div>
          </div>
          <Button
            className={styles.modulesPricingBtn}
            label="See pricing"
            size={ButtonSize.small}
          />
        </div>

        <div className={styles.modulesGrid}>
          {MODULE_ITEMS.map((mod) => (
            <ModuleCard key={mod.title} mod={mod} onInstall={handleInstall} />
          ))}
        </div>
      </section>
    </div>
  );
};

const DashboardConnected = inject(
  ({ userStore }: { userStore: { user: { firstName?: string } | null } }) => ({
    firstName: userStore.user?.firstName,
  }),
)(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;

