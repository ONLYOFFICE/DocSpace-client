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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import Section from "@onlyoffice/apps-ui-kit/components/section";
import { EmptyView } from "@onlyoffice/apps-ui-kit/components/empty-view";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import {
  AiChatPanelBody,
  AiChatPanelHeaderContainer,
  useAiChatPanel,
} from "@onlyoffice/apps-ui-kit/ai-agent/ai-chat-panel";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";
import ChatPanelView from "@onlyoffice/apps-ui-kit/components/section/sub-components/ChatPanel";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import type { DeviceType } from "@docspace/shared/enums";
import EmptyProjectsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import EmptyProjectsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import EmptyFilterLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.light.svg";
import EmptyFilterDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.dark.svg";

import SectionWrapper from "SRC_DIR/components/Section";
import type AiPresetsStore from "SRC_DIR/store/AiPresetsStore";
import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import ProjectsHeader from "./sub-components/ProjectsHeader";
import ProjectsFilter from "./sub-components/ProjectsFilter";
import { ProjectCard } from "./sub-components/ProjectCard";
import { ProjectSources } from "./sub-components/ProjectSources";
import {
  DEFAULT_PROJECTS_QUERY,
  isProjectsQueryFiltered,
  queryProjects,
  type TProjectsQuery,
} from "./utils";
import styles from "./AiProjects.module.scss";

type AiProjectsProps = {
  aiPresetsStore: AiPresetsStore;
  currentDeviceType: DeviceType;
  userId: string;
};

/**
 * The AI Projects page: the chat setups the user saved, laid out like any
 * other section (Navigation header, FilterInput, a grid of cards). Opening a
 * project starts a fresh fullscreen chat on its model with its rooms
 * connected, and the page then shows the project's sources in a column
 * beside the chat instead of the list.
 */
const AiProjects = ({
  aiPresetsStore,
  currentDeviceType,
  userId,
}: AiProjectsProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const { isBase } = useTheme();
  const aiChatStore = useAiChatStore();
  const isAiChatAvailable = useIsAiChatAvailable();
  const aiChatPanel = useAiChatPanel(true);
  const isDesktop = useIsDesktop();
  const [query, setQuery] = React.useState<TProjectsQuery>(DEFAULT_PROJECTS_QUERY);

  useDocumentTitle("Common:AIProjects");

  // The page has nothing to load, so the sidebar item's progress animation
  // ends at once, as on the dashboard.
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
  }, [location.key]);

  const isAiChatFullscreen =
    isAiChatAvailable &&
    aiChatPanel.isChatPanelVisible &&
    (aiChatPanel.isChatPanelFullscreen || !isDesktop);
  const isProjectView =
    isDesktop && isAiChatFullscreen && !!aiPresetsStore.activePreset;

  // The sources column replaces the composer's chips while it is on screen.
  React.useEffect(() => {
    aiChatStore.setComposerContextHidden(isProjectView);
    return () => aiChatStore.setComposerContextHidden(false);
  }, [aiChatStore, isProjectView]);

  const openProject = (project: TAiPreset) => {
    aiPresetsStore.setActivePreset(project);
    aiChatStore.openPreset({
      profileId: project.profileId,
      profileName: project.profileName,
      contextRoom: project.contextRoom,
      knowledgeRoom: project.knowledgeRoom,
    });
  };

  // A new project starts as a plain chat: the user picks a model and rooms
  // there and saves it from the header's floppy. Opened as an empty project
  // so the conversation, the rooms and the model of the previous one go —
  // a bare "new chat" keeps the knowledge base and the context folder, and
  // the floppy would save them into the new project.
  const createProject = React.useCallback(() => {
    aiPresetsStore.setActivePreset(null);
    aiChatStore.openPreset({
      profileId: null,
      profileName: null,
      contextRoom: null,
      knowledgeRoom: null,
    });
  }, [aiPresetsStore, aiChatStore]);

  const hasProjects = aiPresetsStore.presets.length > 0;
  const projects = queryProjects(aiPresetsStore.presets, query);

  const renderBody = () => {
    if (!hasProjects) {
      return (
        <EmptyView
          className={styles.empty}
          icon={isBase ? <EmptyProjectsLightIcon /> : <EmptyProjectsDarkIcon />}
          title={t("Common:AIProjectsEmpty")}
          description={t("Common:AIProjectsEmptyDescription")}
          options={
            isAiChatAvailable
              ? [
                  {
                    key: "new-ai-project",
                    type: "button",
                    title: t("Common:NewAIProject"),
                    onClick: createProject,
                  },
                ]
              : null
          }
        />
      );
    }

    if (projects.length === 0 && isProjectsQueryFiltered(query)) {
      return (
        <EmptyView
          className={styles.empty}
          icon={isBase ? <EmptyFilterLightIcon /> : <EmptyFilterDarkIcon />}
          title={t("Common:NotFoundTitle")}
          description={t("Common:AIProjectsNotFound")}
          options={[
            {
              key: "clear-filter",
              type: "button",
              primary: false,
              title: t("Common:ClearFilter"),
              onClick: () => setQuery(DEFAULT_PROJECTS_QUERY),
            },
          ]}
        />
      );
    }

    return (
      <ul className={styles.grid} data-testid="ai-projects-list">
        {projects.map((project) => (
          <li key={project.id} className={styles.gridItem}>
            <ProjectCard
              project={project}
              onOpen={openProject}
              isDisabled={!isAiChatAvailable}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className={styles.layout}
      data-layout-mode={
        isProjectView ? "ai-project" : isAiChatFullscreen ? "ai-fullscreen" : undefined
      }
    >
      <div className={styles.page} inert={isAiChatFullscreen}>
        <SectionWrapper viewAs="settings" withBodyScroll settingsStudio={false}>
          <Section.SectionHeader>
            <ProjectsHeader currentDeviceType={currentDeviceType} />
          </Section.SectionHeader>
          {hasProjects ? (
            <Section.SectionFilter>
              <ProjectsFilter
                query={query}
                onChange={setQuery}
                onCreate={createProject}
                canCreate={isAiChatAvailable}
                userId={userId}
                currentDeviceType={currentDeviceType}
                isDesktop={isDesktop}
              />
            </Section.SectionFilter>
          ) : null}
          <Section.SectionBody>{renderBody()}</Section.SectionBody>
        </SectionWrapper>
      </div>

      {isAiChatAvailable ? (
        <ChatPanelView
          isVisible={aiChatPanel.isChatPanelVisible}
          setIsVisible={(visible) => {
            if (!visible) aiChatPanel.closeChatPanel();
          }}
          currentDeviceType={currentDeviceType}
          isResizable
          isFullscreen={isAiChatFullscreen}
          width={aiChatPanel.chatPanelWidth}
          onResize={aiChatPanel.setChatPanelWidth}
          onRequestFullscreen={aiChatPanel.setChatPanelFullscreen}
          onExitFullscreen={aiChatPanel.unsetChatPanelFullscreen}
        >
          {/* The panel's own content, laid out here so a project's sources
              can sit under the header, beside the conversation. The body
              keeps its place in the tree whether or not the column shows,
              so opening or leaving the project view never remounts the
              chat. */}
          <AiChatPanelHeaderContainer />
          <div className={styles.panelBody}>
            {isProjectView ? (
              <ProjectSources aiPresetsStore={aiPresetsStore} />
            ) : null}
            <div className={styles.panelChat}>
              <AiChatPanelBody />
            </div>
          </div>
        </ChatPanelView>
      ) : null}
    </div>
  );
};

const AiProjectsConnected = inject(
  ({ aiPresetsStore, settingsStore, userStore }: TStore) => ({
    aiPresetsStore,
    currentDeviceType: settingsStore.currentDeviceType,
    userId: userStore.user?.id ?? "",
  }),
)(observer(AiProjects));

export { AiProjectsConnected as AiProjects };
export default AiProjectsConnected;
