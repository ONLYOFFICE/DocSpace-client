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
import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
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
import type { TAiProject, TAiProjectLogo } from "@docspace/shared/api/ai/projects";


import config from "PACKAGE_FILE";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import { useStore } from "SRC_DIR/store/useStore";

import { isManager } from "../../utils";
import RoomItem from "./RoomItem";
import styles from "./ProjectSources.module.scss";

type SectionProps = {
  title: string;
  /** Without it the section has no menu. */
  menu?: ContextMenuModel[];
  menuTitle: string;
  children: React.ReactNode;
  note?: string;
  testId: string;
};

/** One source of the project, as the mockup draws it: a bordered card with its title, one menu and the rooms below. */
const Section = ({ title, menu, menuTitle, children, note, testId }: SectionProps) => (
  <section className={styles.section} data-testid={testId}>
    <div className={styles.sectionHead}>
      <Text fontSize="13px" lineHeight="20px" fontWeight={700} truncate noSelect>
        {title}
      </Text>
      {menu ? (
        <ContextMenuButton
          className={styles.sectionMenu}
          displayType={ContextMenuButtonDisplayType.dropdown}
          getData={() => menu}
          directionX="right"
          title={menuTitle}
        />
      ) : null}
    </div>
    {/* The rooms scroll inside the card, so the three cards always fit the column. */}
    <div className={styles.cards}>{children}</div>
    {note ? <Text className={styles.note}>{note}</Text> : null}
  </section>
);

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
};

/** A file of a linked room (a skill or a knowledge file): it opens in the editor in a new tab. */
const FileRow = ({ id, title, fileExst, getIcon, hint }: FileRowProps) => (
  <li>
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
  </li>
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
};

/** A linked room as the folder tree draws one: logo, name, a click opens it. */
const RoomCard = ({ id, name, logo, icon, hint, onClick, isExpanded, onToggle, children }: RoomCardProps) => (
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
    />
    {isExpanded ? children : null}
  </div>
);

type ProjectSourcesProps = {
  store: AiProjectsStore;
  project: TAiProject;
};

/**
 * The three sources of a project, each with one menu: Instructions rooms
 * (skills), Knowledge rooms (search) and the user's own context folder.
 */
export const ProjectSources = observer(({ store, project }: ProjectSourcesProps) => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();
  const folderContext = useCloudsStore((s) => s.selectedFolderContext);
  const clearFolderContext = useCloudsStore((s) => s.clearFolderContext);
  const [isPickerVisible, setIsPickerVisible] = React.useState(false);
  const [contextPath, setContextPath] = React.useState("");
  const [contextFolder, setContextFolder] = React.useState<TFolder | null>(null);
  const filesSettingsStore = useStore("filesSettingsStore");
  const filesActionsStore = useStore("filesActionsStore");
  // Rooms start collapsed; each opens to its skills or its files on demand.
  const [expanded, setExpanded] = React.useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
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
  const { instructionsRooms, knowledgeRooms } = project.aiProject;

  // Only a chosen folder has a menu; an empty Context is its add button.
  const contextMenu: ContextMenuModel[] | undefined = folderContext
    ? [
        { key: "change-folder", label: t("Common:AIProjectChangeContext"), onClick: () => setIsPickerVisible(true) },
        { key: "disconnect", label: t("Common:Disconnect"), onClick: clearFolderContext },
      ]
    : undefined;

  const body = (
    <div className={styles.sections}>
      <Section
        title={t("Common:AIProjectInstructions")}
        menuTitle={t("Common:AIProjectInstructions")}
        testId="ai-project-instructions"
      >
        {instructionsRooms.length === 0 ? (
          <Text className={styles.note}>{t("Common:AIProjectNoRooms")}</Text>
        ) : (
          instructionsRooms.map((room) => {
            const skills = store.skills.find((loaded) => loaded.id === room.id)?.skills ?? [];
            return (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.title}
                logo={room.logo}
                icon="instructionsRoom.svg"
                isExpanded={expanded.has(`i-${room.id}`)}
                onToggle={() => toggle(`i-${room.id}`)}
              >
                {skills.length === 0 ? (
                  <Text className={classNames(styles.note, styles.nested)}>{t("Common:AIProjectSkillsEmpty")}</Text>
                ) : (
                  <ul className={classNames(styles.list, styles.nested)}>
                    {skills.map((skill) => (
                      // A skill is the room's Markdown file.
                      <FileRow
                        key={skill.id}
                        id={skill.id}
                        title={skill.title}
                        fileExst={skill.title.slice(skill.title.lastIndexOf(".")) || ".md"}
                        getIcon={filesSettingsStore.getIcon}
                        hint={skill.description}
                      />
                    ))}
                  </ul>
                )}
              </RoomCard>
            );
          })
        )}
      </Section>
      <Section
        title={t("Common:Knowledge")}
        menuTitle={t("Common:Knowledge")}
        testId="ai-project-knowledge"
      >
        {knowledgeRooms.length === 0 ? (
          <Text className={styles.note}>{t("Common:AIProjectNoRooms")}</Text>
        ) : (
          knowledgeRooms.map((room) => {
            // Only vectorized files are searched, so only they are listed.
            const files = (store.knowledge.find((loaded) => loaded.id === room.id)?.files ?? []).filter(
              (file) => file.indexed,
            );
            return (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.title}
                logo={room.logo}
                icon="knowledgeRoom.svg"
                isExpanded={expanded.has(`k-${room.id}`)}
                onToggle={() => toggle(`k-${room.id}`)}
              >
                <ul className={classNames(styles.list, styles.nested)}>
                  {files.map((file) => (
                    <FileRow
                      key={file.id}
                      id={file.id}
                      title={file.title}
                      fileExst={file.fileExst}
                      getIcon={filesSettingsStore.getIcon}
                    />
                  ))}
                </ul>
              </RoomCard>
            );
          })
        )}
      </Section>
      <Section
        title={t("Common:AIProjectContext")}
        menu={contextMenu}
        menuTitle={t("Common:AIProjectContext")}
        note={canEdit ? undefined : t("Common:AIProjectContextNote")}
        testId="ai-project-context"
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
              label={t("Common:AIProjectAddRoom")}
              titleText={t("Common:AIProjectAddRoom")}
              onClick={() => setIsPickerVisible(true)}
              noSelect
              testId="ai-project-context-add"
            />
            <Text className={styles.note}>{t("Common:AIProjectContextHint")}</Text>
          </>
        )}
      </Section>
    </div>
  );

  return (
    <>
      <aside className={styles.column} aria-label={t("Common:AIProjectSources")}>
        {body}
      </aside>
      {isPickerVisible ? <ContextFolderDialog onClose={() => setIsPickerVisible(false)} /> : null}
    </>
  );
});

export default ProjectSources;
