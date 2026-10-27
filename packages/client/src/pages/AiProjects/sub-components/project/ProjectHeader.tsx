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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Navigation from "@onlyoffice/apps-ui-kit/components/navigation";
import { ChatToolbar } from "@onlyoffice/apps-ui-kit/ai-agent/chat-toolbar";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import type { DeviceType } from "@docspace/shared/enums";
import type { TAiProject } from "@docspace/shared/api/ai/projects";
import sectionStyles from "@docspace/shared/styles/SectionHeader.module.scss";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";
import { aiProjectToRoom } from "@docspace/shared/api/ai/projectsRouteMock";

import { useProjectContextMenu } from "../useProjectContextMenu";
import styles from "./ProjectSources.module.scss";

type ProjectHeaderProps = {
  store: AiProjectsStore;
  project: TAiProject;
  currentDeviceType: DeviceType;
  onBack: () => void;
};

const noop = () => {};
const noOptions = () => [];

/** The section header of an open project: back arrow, title, its menu, the chat toolbar and the info toggle. */
const ProjectHeader = ({ store, project, currentDeviceType, onBack }: ProjectHeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const isDesktop = useIsDesktop();
  const getContextModel = useProjectContextMenu(store);
  const infoPanelStore = useStore("infoPanelStore");
  const filesStore = useStore("filesStore");

  // The Files info panel shows the project as a room: put it into the
  // selection the panel reads and switch the panel.
  const showInfo = (visible: boolean) => {
    filesStore.setBufferSelection(aiProjectToRoom(project) as never);
    infoPanelStore.setIsVisible(visible);
  };

  return (
    <div className={sectionStyles.headerContainer}>
      <div className="header-container">
        <Navigation
          showText
          isRootFolder={false}
          canCreate={false}
          title={project.title}
          rootRoomTitle=""
          isDesktop={isDesktop}
          navigationItems={[{ id: "ai-projects", title: t("Common:AIProjects"), isRootRoom: false }]}
          getContextOptionsPlus={noOptions}
          getContextOptionsFolder={() => getContextModel(project)}
          onClickFolder={onBack}
          isTrashFolder={false}
          isEmptyPage={false}
          isEmptyFilesList={false}
          onBackToParentFolder={onBack}
          showRootFolderTitle={false}
          withMenu
          isContextButtonVisible
          currentDeviceType={currentDeviceType}
          titleIcon=""
          titleIconTooltip=""
          showNavigationButton={false}
          isCurrentFolderInfo={false}
          showTitle
          isRoom
          isInfoPanelVisible={infoPanelStore.isVisible}
          toggleInfoPanel={() => showInfo(!infoPanelStore.isVisible)}
          hideChatButton
          // The chat's own toolbar (history, new chat) after the project menu.
          analyzeResponsesButton={<ChatToolbar className={styles.chatToolbar} />}
          titles={{ infoPanel: t("Common:Info"), contextMenu: t("Common:Actions") }}
          withLogo=""
          burgerLogo=""
          onLogoClick={noop}
          clearTrash={noop}
          showFolderInfo={() => showInfo(true)}
        />
      </div>
    </div>
  );
};

export default observer(ProjectHeader);
