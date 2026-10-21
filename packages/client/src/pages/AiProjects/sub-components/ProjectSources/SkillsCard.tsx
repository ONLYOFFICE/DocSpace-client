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
import { useTranslation } from "react-i18next";

import { Card } from "@onlyoffice/apps-ui-kit/components/card";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import { SourceCardTitle } from "./SourceCardTitle";
import styles from "./ProjectSources.module.scss";

type SkillsCardProps = {
  onChangeRoom: (room: TAiPreset["contextRoom"]) => void;
};

/**
 * The project's skills room: its name, its skills with a switch each (a
 * switched-off skill is left out of the rounds), and a menu to connect
 * another Instructions room or disconnect it.
 */
export const SkillsCard = ({ onChangeRoom }: SkillsCardProps) => {
  const { t } = useTranslation(["Common"]);
  const { useCloudsStore } = useStores();

  const selected = useCloudsStore((s) => s.selectedContextFolder);
  const skills = useCloudsStore((s) => s.roomSkills);
  const disabledSkillIds = useCloudsStore((s) => s.disabledSkillIds);
  const setSkillEnabled = useCloudsStore((s) => s.setSkillEnabled);
  const contextFolders = useCloudsStore((s) => s.contextFolders);
  const fetchContextFolders = useCloudsStore((s) => s.fetchContextFolders);

  React.useEffect(() => {
    void fetchContextFolders();
  }, [fetchContextFolders]);

  const getData = React.useCallback((): ContextMenuModel[] => {
    const rooms = contextFolders.flatMap((folder) =>
      folder.rooms.map((room) => ({ cloud: folder.cloud, room })),
    );
    const model: ContextMenuModel[] = [];
    if (rooms.length > 0) {
      model.push({
        key: "change-skills-room",
        label: t("Common:AIProjectChangeSkills"),
        items: rooms.map(({ cloud, room }) => ({
          key: `skills-room-${room.id}`,
          label: room.name,
          checked: room.id === selected?.room.id,
          onClick: () =>
            onChangeRoom({ cloud, id: room.id, name: room.name }),
        })),
      });
    }
    if (selected) {
      model.push({
        key: "disconnect-skills-room",
        label: t("Common:Disconnect"),
        onClick: () => onChangeRoom(null),
      });
    }
    return model;
  }, [contextFolders, selected, onChangeRoom, t]);

  return (
    <Card
      className={styles.card}
      dataTestId="ai-project-skills"
      title={
        <SourceCardTitle
          icon={iconSize32.get("instructionsRoom.svg") ?? ""}
          label={t("Common:AIProjectSkills")}
          name={selected?.room.name ?? t("Common:AIProjectNotSet")}
        />
      }
      extra={
        <ContextMenuButton
          className={styles.menu}
          displayType={ContextMenuButtonDisplayType.dropdown}
          getData={getData}
          directionX="right"
          title={t("Common:AIProjectChangeSkills")}
        />
      }
    >
      {selected ? (
        skills.length > 0 ? (
          <ul className={styles.list}>
            {skills.map((skill) => (
              <li key={skill.id} className={styles.row}>
                <Text className={styles.rowName} truncate title={skill.description}>
                  {skill.name}
                </Text>
                {/* ToggleButton positions its switch absolutely inside a
                    zero-size wrapper, so the slot reserves the room. */}
                <span className={styles.toggle}>
                  <ToggleButton
                    isChecked={!disabledSkillIds.includes(skill.id)}
                    onChange={(e) => setSkillEnabled(skill.id, e.target.checked)}
                    dataTestId={`ai-project-skill-${skill.id}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Text className={styles.hint}>{t("Common:AIProjectSkillsEmpty")}</Text>
        )
      ) : null}
    </Card>
  );
};

export default SkillsCard;
