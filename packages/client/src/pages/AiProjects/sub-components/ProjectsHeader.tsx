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

import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import Navigation from "@onlyoffice/apps-ui-kit/components/navigation";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import type { DeviceType } from "@docspace/shared/enums";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";

type ProjectsHeaderProps = {
  currentDeviceType: DeviceType;
};

const noop = () => {};
const noOptions = () => [];

/**
 * The section header of the AI Projects page: the same Navigation every
 * section renders, with the page title and the AI Chat toggle. A flat page,
 * so no breadcrumbs, no "+" menu and no info panel toggle.
 */
const ProjectsHeader = ({ currentDeviceType }: ProjectsHeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const aiChatStore = useAiChatStore();
  const isAiChatAvailable = useIsAiChatAvailable();
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.headerContainer}>
      <div className="header-container">
        <Navigation
          showText
          isRootFolder
          canCreate={false}
          title={t("Common:AIProjects")}
          rootRoomTitle=""
          isDesktop={isDesktop}
          navigationItems={[]}
          getContextOptionsPlus={noOptions}
          getContextOptionsFolder={noOptions}
          onClickFolder={noop}
          isTrashFolder={false}
          isEmptyPage={false}
          isEmptyFilesList={false}
          onBackToParentFolder={noop}
          showRootFolderTitle={false}
          withMenu={false}
          isContextButtonVisible={false}
          currentDeviceType={currentDeviceType}
          titleIcon=""
          titleIconTooltip=""
          showNavigationButton={false}
          isCurrentFolderInfo={false}
          showTitle
          isRoom={false}
          isInfoPanelVisible={false}
          toggleInfoPanel={noop}
          // A flag despite its type: truthy hides the info panel toggle.
          hideInfoPanel={noop}
          toggleChatPanel={aiChatStore.toggle}
          isChatPanelVisible={aiChatStore.isVisible}
          hideChatButton={!isAiChatAvailable}
          titles={{ aiChat: t("Common:AIChatButton") }}
          withLogo=""
          burgerLogo=""
          onLogoClick={noop}
          clearTrash={noop}
          showFolderInfo={noop}
        />
      </div>
    </div>
  );
};

export default observer(ProjectsHeader);
