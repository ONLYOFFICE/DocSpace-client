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

import { Scrollbar } from "@onlyoffice/apps-ui-kit/components/scrollbar";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import type AiPresetsStore from "SRC_DIR/store/AiPresetsStore";
import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import { SkillsCard } from "./SkillsCard";
import { KnowledgeCard } from "./KnowledgeCard";
import { ContextCard } from "./ContextCard";
import styles from "./ProjectSources.module.scss";

type ProjectSourcesProps = {
  aiPresetsStore: AiPresetsStore;
};

/**
 * The column beside a project's fullscreen chat: the sources every round of
 * the project uses, in place of the composer's chips. A skills room or a
 * knowledge base changed here is saved into the project; the context folder
 * stays a choice of this conversation.
 */
export const ProjectSources = observer(({ aiPresetsStore }: ProjectSourcesProps) => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();

  const onChangeSkillsRoom = (room: TAiPreset["contextRoom"]) => {
    // The host hands the project's skills room to the chat as its context
    // room (see Shell), so saving it is what connects it.
    aiPresetsStore.updateActiveProject({ contextRoom: room });
  };

  const onChangeKnowledgeRoom = (room: TAiPreset["knowledgeRoom"]) => {
    aiPresetsStore.updateActiveProject({ knowledgeRoom: room });
    const clouds = useCloudsStore.getState();
    if (room) clouds.selectKnowledgeFolder(room.cloud, { id: room.id, name: room.name });
    else clouds.clearKnowledgeFolder();
  };

  return (
    <aside className={styles.column} aria-label={t("Common:AIProjectSources")}>
      <Scrollbar className={styles.scroll}>
        <div className={styles.cards}>
          <SkillsCard onChangeRoom={onChangeSkillsRoom} />
          <KnowledgeCard onChangeRoom={onChangeKnowledgeRoom} />
          <ContextCard />
        </div>
      </Scrollbar>
    </aside>
  );
});

export default ProjectSources;
