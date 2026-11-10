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
import classNames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";


import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { RectangleSkeleton } from "@onlyoffice/apps-ui-kit/components/rectangle";
import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Backdrop } from "@onlyoffice/apps-ui-kit/components/backdrop";
import { Aside } from "@onlyoffice/apps-ui-kit/components/aside";
import RoomSelector from "@onlyoffice/apps-ui-kit/selectors/Room";
import type { TSelectorItem } from "@onlyoffice/apps-ui-kit/components/selector";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { Tabs, TabsTypes, type TTabItem } from "@onlyoffice/apps-ui-kit/components/tabs";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { ContextFolderDialog } from "@onlyoffice/apps-ui-kit/ai-agent/providers/files";
import { getFolderInfo, getFolderPath } from "@docspace/shared/api/files";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import {
  AI_PROJECT_MAX_ROOMS_PER_TYPE,
  INSTRUCTIONS_ROOM_TYPE,
  KNOWLEDGE_ROOM_TYPE,
} from "@docspace/shared/api/ai/projects";
import type {
  TAiProject,
  TAiProjectCover,
  TAiProjectKnowledgeFile,
  TAiProjectLogo,
  TAiProjectSource,
} from "@docspace/shared/api/ai/projects";
import { RoomSearchArea, VectorizationStatus } from "@docspace/shared/enums";
import { FailedVectorizationBadge } from "@docspace/shared/components/failed-vectorization-badge";


import config from "PACKAGE_FILE";
import LampReactSvgUrl from "PUBLIC_DIR/images/lamp.react.svg?url";
import BookTrainingReactSvgUrl from "PUBLIC_DIR/images/book.training.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { isManager } from "../../utils";
import RoomItem, { SourceRoomLogo } from "./RoomItem";
import styles from "./ProjectSources.module.scss";

type SectionProps = {
  title: string;
  /** Without it the section has no menu. */
  menu?: ContextMenuModel[];
  menuTitle: string;
  children: React.ReactNode;
  note?: string;
  testId: string;
  /** Under the phone and tablet tabs, which already name it: no title, the menu beside the rooms. */
  headless?: boolean;
};

/** One source of the project, as the mockup draws it: a bordered card with its title, one menu and the rooms below. */
const Section = ({ title, menu, menuTitle, children, note, testId, headless = false }: SectionProps) => {
  const menuButton = menu ? (
    <ContextMenuButton
      className={headless ? styles.sectionMenuFloating : styles.sectionMenu}
      displayType={ContextMenuButtonDisplayType.dropdown}
      getData={() => menu}
      directionX="right"
      title={menuTitle}
    />
  ) : null;

  return (
    <section className={classNames(styles.section, { [styles.headless]: headless })} data-testid={testId}>
      {headless ? (
        menuButton
      ) : (
        <div className={styles.sectionHead}>
          <Text fontSize="13px" lineHeight="20px" fontWeight={700} truncate noSelect>
            {title}
          </Text>
          {menuButton}
        </div>
      )}
      {/* The rooms scroll inside the card, so the three cards always fit the column. */}
      <div className={styles.cards}>{children}</div>
      {note ? <Text className={styles.note}>{note}</Text> : null}
    </section>
  );
};

/** The editor's address for a file, as Files builds it (`openDocEditor`). */
const editorUrl = (fileId: number) =>
  combineUrl(window.ClientConfig?.proxy?.url, config.homepage, `/doceditor?fileId=${fileId}`);

type FileRowProps = {
  id: number;
  title: string;
  /** The extension, with its dot, the icon is picked by. */
  fileExst: string;
  getIcon: (size: number, fileExst: string) => string;
  /** Tooltip of the name; the title itself when unset. */
  hint?: string;
  /** Drawn at the end of the row: the file's vectorization state. */
  trailing?: React.ReactNode;
};

/** A file of a linked room (a skill or a knowledge file): it opens in the editor in a new tab. */
const FileRow = ({ id, title, fileExst, getIcon, hint, trailing }: FileRowProps) => (
  <li className={styles.row} data-testid={`ai-project-file-row-${id}`}>
    <a
      className={classNames(styles.row, styles.fileLink)}
      href={editorUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`ai-project-file-${id}`}
    >
      <img className={styles.fileIcon} src={getIcon(24, fileExst)} alt="" aria-hidden="true" />
      <Text className={classNames(styles.rowName, "file-title")} fontSize="13px" truncate title={hint ?? title}>
        {title}
      </Text>
    </a>
    {trailing}
  </li>
);

type KnowledgeFileStateProps = {
  file: TAiProjectKnowledgeFile;
  onRetry: () => void;
};

/**
 * A knowledge file's vectorization state at the end of its row: nothing when
 * it is indexed, "In progress" while it is queued, and the failed badge with
 * "Try again" for a caller who may queue it once more.
 */
const KnowledgeFileState = ({ file, onRetry }: KnowledgeFileStateProps) => {
  const { t } = useTranslation(["Common"]);
  switch (file.vectorizationStatus) {
    case VectorizationStatus.InProgress:
      return (
        <Text className={styles.fileState} fontSize="12px" lineHeight="16px" noSelect>
          {t("Common:InProgress")}
        </Text>
      );
    case VectorizationStatus.Failed:
      return (
        <FailedVectorizationBadge
          className={styles.fileBadge}
          withRetryVectorization={file.security?.Vectorization === true}
          onRetryVectorization={onRetry}
          dataTestId={`ai-project-file-failed-${file.id}`}
        />
      );
    default:
      return null;
  }
};

/**
 * What an expanded room shows while its list is on its way: one row-sized
 * bar across the card, under the room row. The store turns the flag on only
 * for a read that takes a while (`createLoader`), so a fast answer skips it.
 */
const RoomContentSkeleton = ({ testId }: { testId: string }) => (
  <div className={classNames(styles.nested, styles.skeleton)} data-testid={testId}>
    <RectangleSkeleton width="100%" height="32px" borderRadius="6px" />
  </div>
);

type RoomCardProps = {
  id: number | string;
  name: string;
  logo?: TAiProjectLogo;
  icon: "instructionsRoom.svg" | "knowledgeRoom.svg" | "folder.svg";
  hint?: string;
  onClick?: () => void;
  /** With `onToggle`, the room expands to its `children` (skills or files). */
  isExpanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
  /** Drawn at the end of the room row, e.g. a warning badge. */
  trailing?: React.ReactNode;
};

/** A linked room as the folder tree draws one: logo, name, a click opens it. */
const RoomCard = ({ id, name, logo, icon, hint, onClick, isExpanded, onToggle, children, trailing }: RoomCardProps) => (
  <div className={styles.roomCard}>
    <RoomItem
      id={id}
      title={name}
      logo={logo}
      icon={icon}
      hint={hint}
      onClick={onClick}
      isExpanded={isExpanded}
      onToggle={onToggle}
      trailing={trailing}
    />
    {isExpanded ? children : null}
  </div>
);

type ProjectSourcesProps = {
  store: AiProjectsStore;
  project: TAiProject;
  /**
   * Phone and tablet: no room for the column, so the cards sit behind a row
   * of tabs above the conversation; a tap opens one under them, a tap on the
   * open one's tab closes it.
   */
  compact?: boolean;
};

type SectionKey = "instructions" | "knowledge" | "context";

/** The kind of rooms the selector opened from a card's add button lists. */
type RoomsKind = "instructions" | "knowledge";

const COLLAPSED_KEY = "aiProjectSourcesCollapsed";

// The column stays collapsed or expanded as the user left it, in this
// browser. Without storage (a private window) it opens expanded.
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

const writeCollapsed = (collapsed: boolean) => {
  try {
    if (collapsed) localStorage.setItem(COLLAPSED_KEY, "true");
    else localStorage.removeItem(COLLAPSED_KEY);
  } catch {
    // Nothing to remember without storage.
  }
};

/**
 * The three sources of a project, each with one menu: Instructions rooms
 * (skills), Knowledge rooms (search) and the user's own context folder.
 */
export const ProjectSources = observer(({ store, project, compact = false }: ProjectSourcesProps) => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();
  const folderContext = useCloudsStore((s) => s.selectedFolderContext);
  const clearFolderContext = useCloudsStore((s) => s.clearFolderContext);
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [contextPath, setContextPath] = React.useState("");
  const [contextFolder, setContextFolder] = React.useState<TFolder | null>(null);
  const [openSection, setOpenSection] = React.useState<SectionKey | null>(null);
  const [collapsed, setCollapsed] = React.useState(readCollapsed);
  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      writeCollapsed(!prev);
      return !prev;
    });
  // The kind whose rooms are being picked from its card; null while closed.
  const [roomsPicker, setRoomsPicker] = React.useState<RoomsKind | null>(null);
  const settingsStore = useStore("settingsStore");
  const vectorizationEnabled = settingsStore.aiConfig?.vectorizationEnabled !== false;
  const filesSettingsStore = useStore("filesSettingsStore");
  const filesActionsStore = useStore("filesActionsStore");
  // Rooms start collapsed; each opens to its skills or its files on demand.
  // The list is read from the server when the row opens and stays as read
  // while it is open: the next expand reads it again.
  const [expanded, setExpanded] = React.useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string, onExpand: () => void) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) {
        next.add(key);
        onExpand();
      }
      return next;
    });

  // The context is drawn like the linked rooms: a room with its own logo, a
  // folder with the folder icon, its path as the name's tooltip.
  const folderId = folderContext?.room.id;
  React.useEffect(() => {
    setContextPath("");
    setContextFolder(null);
    if (!folderId) return undefined;
    let disposed = false;
    getFolderPath(Number(folderId))
      .then((parts) => {
        if (!disposed) setContextPath(parts.map((part) => part.title).join(" / "));
      })
      .catch(() => {});
    getFolderInfo(folderId)
      .then((folder) => {
        if (!disposed) setContextFolder(folder);
      })
      .catch(() => {});
    return () => {
      disposed = true;
    };
  }, [folderId]);

  const contextLogo = contextFolder ? (contextFolder as Partial<TRoom>).logo : undefined;

  const canEdit = isManager(project);
  // A linked room the caller can no longer read is not connected to the chat
  // and not drawn in the intro, so the cards leave it out as well.
  const instructionsRooms = project.aiProject.instructionsRooms.filter((room) => room.available);
  const knowledgeRooms = project.aiProject.knowledgeRooms.filter((room) => room.available);

  // The rooms of a kind are picked as in the project form: the linked ones
  // come ticked, and what is submitted replaces them. A room the caller can
  // no longer read stays among them, so picking does not unlink it.
  const pickedRooms =
    roomsPicker === "instructions" ? project.aiProject.instructionsRooms : project.aiProject.knowledgeRooms;

  const onRoomsLimitReached = () =>
    toastr.warning(
      roomsPicker === "instructions"
        ? t("Common:AIProjectInstructionsRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE })
        : t("Common:AIProjectKnowledgeRoomsLimit", { limit: AI_PROJECT_MAX_ROOMS_PER_TYPE }),
    );

  const onRoomsSelected = (items: TSelectorItem[]) => {
    if (!roomsPicker) return;
    const roomType = roomsPicker === "instructions" ? INSTRUCTIONS_ROOM_TYPE : KNOWLEDGE_ROOM_TYPE;
    // The logo the selector read with the room, so the cards show the new
    // rooms without reading them back.
    const rooms: TAiProjectSource[] = items.map((item) => {
      const linked = pickedRooms.find((room) => room.id === Number(item.id));
      if (linked) return linked;
      const room = item as { color?: string; cover?: TAiProjectCover; icon?: string; iconOriginal?: string };
      return {
        id: Number(item.id),
        title: item.label,
        roomType,
        available: true,
        archived: false,
        logo: {
          color: room.color ? `#${room.color.replace("#", "")}` : "",
          cover: room.cover ?? null,
          medium: typeof room.icon === "string" ? room.icon : undefined,
          original: room.iconOriginal,
        },
      };
    });
    void store.setActiveRooms(roomsPicker, rooms);
    setRoomsPicker(null);
  };

  // A manager adds rooms of a kind from its card, as the folder is added
  // from the Folder card.
  const addRooms = (kind: RoomsKind, label: string) =>
    canEdit ? (
      <AddButton
        className={styles.addRoom}
        label={label}
        titleText={label}
        onClick={() => setRoomsPicker(kind)}
        noSelect
        testId={`ai-project-${kind}-add`}
      />
    ) : null;

  // Only a chosen folder has a menu; an empty Context is its add button.
  const contextMenu: ContextMenuModel[] | undefined = folderContext
    ? [
        { key: "change-folder", label: t("Common:AIProjectChangeContext"), onClick: () => setIsPickerVisible(true) },
        { key: "disconnect", label: t("Common:Disconnect"), onClick: clearFolderContext },
      ]
    : undefined;

  // The same on the collapsed column's rail: a plus under the kind's logos.
  const railAdd = (kind: RoomsKind, title: string) =>
    canEdit ? (
      <AddButton
        className={styles.addRoom}
        titleText={title}
        onClick={() => setRoomsPicker(kind)}
        testId={`ai-project-rail-${kind}-add`}
      />
    ) : null;
  // A kind is on the rail when it has rooms or the caller can add them.
  const hasInstructionsGroup = instructionsRooms.length > 0 || canEdit;
  const hasKnowledgeGroup = knowledgeRooms.length > 0 || canEdit;

  // For a member a kind with no available linked room has no card and no
  // tab: only a manager links rooms, and an empty card would only say so.
  const instructionsSection = instructionsRooms.length === 0 && !canEdit ? null : (
    <Section
      title={t("Common:Skills")}
      menuTitle={t("Common:Skills")}
      testId="ai-project-instructions"
      headless={compact}
    >
      {instructionsRooms.map((room) => {
          const loaded = store.skills.find((item) => item.id === room.id);
          const skills = loaded?.skills ?? [];
          return (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.title}
              logo={room.logo}
              icon="instructionsRoom.svg"
              isExpanded={expanded.has(`i-${room.id}`)}
              onToggle={() => toggle(`i-${room.id}`, () => void store.fetchSkills(project.id))}
            >
              {!loaded && store.skillsLoading ? (
                <RoomContentSkeleton testId={`ai-project-skills-loading-${room.id}`} />
              ) : !loaded && store.skillsPending ? null : skills.length === 0 ? (
                <Text className={classNames(styles.note, styles.nested)}>{t("Common:AIProjectSkillsEmpty")}</Text>
              ) : (
                <ul className={classNames(styles.list, styles.nested)}>
                  {skills.map((skill) => (
                    // A skill is the room's Markdown file, shown by its frontmatter name.
                    <FileRow
                      key={skill.id}
                      id={Number(skill.id)}
                      title={skill.name}
                      fileExst=".md"
                      getIcon={filesSettingsStore.getIcon}
                      hint={skill.description}
                    />
                  ))}
                </ul>
              )}
            </RoomCard>
          );
        })}
      {addRooms("instructions", t("Common:AIProjectAddSkills"))}
    </Section>
  );

  const knowledgeSection = knowledgeRooms.length === 0 && !canEdit ? null : (
    <Section
      title={t("Common:AiWorkspaceKnowledge")}
      menuTitle={t("Common:AiWorkspaceKnowledge")}
      testId="ai-project-knowledge"
      headless={compact}
    >
      {knowledgeRooms.map((room) => {
          // The room's files are read when it is expanded, each with its
          // vectorization state: the chat searches the indexed ones, the
          // rest show why they are not there.
          const loaded = store.knowledge[room.id];
          const files = loaded ?? [];
          // Until the files are read, the room's own count from the project.
          const failedFiles = loaded
            ? files.filter((file) => file.vectorizationStatus === VectorizationStatus.Failed).length
            : (room.failedFiles ?? 0);
          return (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.title}
              logo={room.logo}
              icon="knowledgeRoom.svg"
              isExpanded={expanded.has(`k-${room.id}`)}
              onToggle={() => toggle(`k-${room.id}`, () => void store.fetchKnowledgeFiles(room.id))}
              trailing={
                failedFiles > 0 ? (
                  <FailedVectorizationBadge
                    className={styles.roomBadge}
                    title={t("Common:AIProjectKnowledgeFailedFiles")}
                    info={t("Common:AIProjectKnowledgeFailedFilesInfo")}
                    dataTestId={`ai-project-room-warning-${room.id}`}
                  />
                ) : null
              }
            >
              {!loaded && store.knowledgeLoading[room.id] ? (
                <RoomContentSkeleton testId={`ai-project-knowledge-loading-${room.id}`} />
              ) : !loaded && store.knowledgePending[room.id] ? null : loaded && files.length === 0 ? (
                <Text className={classNames(styles.note, styles.nested)}>{t("Common:NoItemsHereYet")}</Text>
              ) : (
              <ul className={classNames(styles.list, styles.nested)}>
                {files.map((file) => (
                  <FileRow
                    key={file.id}
                    id={file.id}
                    title={file.title}
                    fileExst={file.fileExst}
                    getIcon={filesSettingsStore.getIcon}
                    trailing={
                      <KnowledgeFileState file={file} onRetry={() => void store.retryKnowledgeFile(room.id, file.id)} />
                    }
                  />
                ))}
              </ul>
              )}
            </RoomCard>
          );
        })}
      {addRooms("knowledge", t("Common:AIProjectAddKnowledge"))}
    </Section>
  );

  const contextSection = (
    <Section
      title={t("Common:Folder")}
      menu={contextMenu}
      menuTitle={t("Common:Folder")}
      note={canEdit ? undefined : t("Common:AIProjectContextNote")}
      testId="ai-project-context"
      headless={compact}
    >
      {folderContext ? (
        <RoomCard
          id={folderContext.room.id}
          name={folderContext.room.name}
          logo={contextFolder?.isRoom && contextLogo ? { ...contextLogo, color: contextLogo.color ?? "" } : undefined}
          icon="folder.svg"
          hint={contextPath || undefined}
          onClick={
            contextFolder
              ? () => filesActionsStore.openItemAction({ ...contextFolder, isFolder: true } as never)
              : undefined
          }
        />
      ) : (
        <>
          <AddButton
            className={styles.addRoom}
            label={t("Common:AIProjectAddFolder")}
            titleText={t("Common:AIProjectAddFolder")}
            onClick={() => setIsPickerVisible(true)}
            noSelect
            testId="ai-project-context-add"
          />
          <Text className={styles.note}>{t("Common:AIProjectContextHint")}</Text>
        </>
      )}
    </Section>
  );

  // The cards are drawn under the tabs by us, not as the tabs' content, so
  // they take the full width and nothing has to be selected.
  const tabs: TTabItem[] = [
    ...(instructionsSection
      ? [{ id: "instructions", name: t("Common:Skills"), iconName: LampReactSvgUrl, content: null }]
      : []),
    ...(knowledgeSection
      ? [{ id: "knowledge", name: t("Common:AiWorkspaceKnowledge"), iconName: BookTrainingReactSvgUrl, content: null }]
      : []),
    { id: "context", name: t("Common:Folder"), iconName: FolderReactSvgUrl, content: null },
  ];
  const openedCard = { instructions: instructionsSection, knowledge: knowledgeSection, context: contextSection };

  // Tabs ignore a click on the selected tab, so closing it is caught here,
  // once the click has bubbled past the tab. Not in the capture phase: React
  // commits a capture-phase update before the bubble phase, so the tab would
  // see itself unselected and open again.
  const onTabsClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!openSection) return;
    const tab = event.currentTarget.querySelector<HTMLElement>(`[data-testid='${openSection}_subtab']`);
    if (tab && event.target instanceof Node && tab.contains(event.target)) setOpenSection(null);
  };

  return (
    <>
      {compact ? (
        <div className={styles.compact} aria-label={t("Common:AIProjectSources")} data-testid="ai-project-sources-strip">
          <div onClick={onTabsClick}>
            <Tabs
              type={TabsTypes.Secondary}
              items={tabs}
              // An id no tab has selects none; an empty one would select the first.
              selectedItemId={openSection ?? "none"}
              onSelect={(tab) => setOpenSection(tab.id as SectionKey)}
              // The three share the width, which centres them and widens each tap target.
              scaled
              // Tabs that do not fit scroll, without the arrow buttons.
              withoutArrows
              withoutStickyIntend
            />
          </div>
          {openSection ? <div className={styles.compactCard}>{openedCard[openSection]}</div> : null}
        </div>
      ) : collapsed ? (
        // Collapsed, the column is a narrow rail of what is connected: the
        // logos of the Skills rooms, of the Knowledge rooms and the folder,
        // each kind with its add button. A logo brings the cards back, as
        // the button under them does.
        <aside
          className={classNames(styles.column, styles.rail)}
          aria-label={t("Common:AIProjectSources")}
          data-testid="ai-project-sources-rail"
        >
          <div className={styles.railRooms}>
            {instructionsRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={styles.railRoom}
                title={room.title}
                onClick={toggleCollapsed}
                data-testid={`ai-project-rail-room-${room.id}`}
              >
                <SourceRoomLogo title={room.title} logo={room.logo} icon="instructionsRoom.svg" size="32px" />
              </button>
            ))}
            {railAdd("instructions", t("Common:AIProjectAddSkills"))}
            {hasInstructionsGroup && hasKnowledgeGroup ? <span className={styles.railDivider} /> : null}
            {knowledgeRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={styles.railRoom}
                title={room.title}
                onClick={toggleCollapsed}
                data-testid={`ai-project-rail-room-${room.id}`}
              >
                <SourceRoomLogo title={room.title} logo={room.logo} icon="knowledgeRoom.svg" size="32px" />
              </button>
            ))}
            {railAdd("knowledge", t("Common:AIProjectAddKnowledge"))}
            {hasInstructionsGroup || hasKnowledgeGroup ? <span className={styles.railDivider} /> : null}
            {folderContext ? (
              <button
                type="button"
                className={styles.railRoom}
                title={contextPath || folderContext.room.name}
                onClick={toggleCollapsed}
                data-testid="ai-project-rail-folder"
              >
                <SourceRoomLogo
                  title={folderContext.room.name}
                  logo={
                    contextFolder?.isRoom && contextLogo ? { ...contextLogo, color: contextLogo.color ?? "" } : undefined
                  }
                  icon="folder.svg"
                  size="32px"
                />
              </button>
            ) : (
              <AddButton
                className={styles.addRoom}
                titleText={t("Common:AIProjectAddFolder")}
                onClick={() => setIsPickerVisible(true)}
                testId="ai-project-rail-folder-add"
              />
            )}
          </div>
          <div className={styles.railExpand}>
            <IconButton
              iconName={PanelReactSvgUrl}
              size={16}
              onClick={toggleCollapsed}
              title={t("Common:Show")}
              dataTestId="ai-project-sources-expand"
            />
          </div>
        </aside>
      ) : (
        <aside className={styles.column} aria-label={t("Common:AIProjectSources")}>
          <div className={styles.columnHead}>
            <Text fontSize="15px" lineHeight="20px" fontWeight={700} truncate noSelect>
              {t("Common:AIProjectSources")}
            </Text>
            <IconButton
              iconName={PanelReactSvgUrl}
              size={16}
              onClick={toggleCollapsed}
              title={t("Common:Hide")}
              dataTestId="ai-project-sources-collapse"
            />
          </div>
          <div className={styles.sections}>
            {instructionsSection}
            {knowledgeSection}
            {contextSection}
          </div>
        </aside>
      )}
      {isPickerVisible ? <ContextFolderDialog onClose={() => setIsPickerVisible(false)} /> : null}
      {roomsPicker ? (
        <>
          <Backdrop visible isAside withBackground zIndex={309} onClick={() => setRoomsPicker(null)} />
          <Aside visible withoutBodyScroll zIndex={310} onClose={() => setRoomsPicker(null)} withoutHeader>
            <RoomSelector
              onClose={() => setRoomsPicker(null)}
              isMultiSelect
              // Room rows come with `disableMultiSelect`; this overrules it,
              // as the project form does.
              forceIsMultiSelect
              maxSelectedItems={AI_PROJECT_MAX_ROOMS_PER_TYPE}
              onSelectLimitReached={onRoomsLimitReached}
              roomType={roomsPicker === "instructions" ? INSTRUCTIONS_ROOM_TYPE : KNOWLEDGE_ROOM_TYPE}
              // Instructions and Knowledge rooms live under the AI root, not in Rooms.
              searchArea={RoomSearchArea.AiHub}
              isRoomDisabled={() => roomsPicker === "knowledge" && !vectorizationEnabled}
              getRoomDisabledText={() =>
                roomsPicker === "knowledge" && !vectorizationEnabled
                  ? t("Common:KnowledgeRoomsNeedVectorization")
                  : undefined
              }
              withSearch
              withHeader
              headerProps={{
                headerLabel: roomsPicker === "instructions" ? t("Common:Skills") : t("Common:AiWorkspaceKnowledge"),
                onCloseClick: () => setRoomsPicker(null),
                onBackClick: () => setRoomsPicker(null),
                withoutBackButton: false,
                withoutBorder: false,
              }}
              withCancelButton
              cancelButtonLabel={t("Common:CancelButton")}
              onCancel={() => setRoomsPicker(null)}
              submitButtonLabel={t("Common:SelectAction")}
              selectedItems={
                pickedRooms.map((room) => ({ id: room.id, label: room.title })) as unknown as TSelectorItem[]
              }
              sortSelectedFirst
              onSubmit={onRoomsSelected}
            />
          </Aside>
        </>
      ) : null}
    </>
  );
});

export default ProjectSources;
