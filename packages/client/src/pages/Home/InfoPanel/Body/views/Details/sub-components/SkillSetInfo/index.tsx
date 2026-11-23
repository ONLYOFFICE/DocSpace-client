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

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getFolder } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import { RoomsType } from "@docspace/shared/enums";
import {
  getSkillNameByTitle,
  SKILL_EXTENSION,
  toSkillCommand,
} from "@docspace/shared/utils/skillFile";

import SkillIcon from "SRC_DIR/components/SkillIcon";

import commonStyles from "../../../../helpers/Common.module.scss";

import styles from "./SkillSetInfo.module.scss";

type SkillSetInfoProps = {
  selection: unknown;
};

type TSkillSetRoom = {
  id: number;
  isRoom?: boolean;
  roomType?: RoomsType;
  filesCount?: number;
};

const SKILLS_LIMIT = 100;

const isSkillTitle = (title: string) =>
  title.toLowerCase().endsWith(SKILL_EXTENSION);

/**
 * The skills of a skill set selected in the list: each by its icon, its name
 * and the command that calls it in the chat. They are the Markdown files of the
 * room, read when the set is selected and again when their number changes.
 */
export const SkillSetInfo = ({ selection }: SkillSetInfoProps) => {
  const { t } = useTranslation(["Common"]);
  const room = selection as TSkillSetRoom;
  const isSkillSet =
    !!selection &&
    !Array.isArray(selection) &&
    !!room.isRoom &&
    room.roomType === RoomsType.InstructionsRoom;
  const id = isSkillSet ? room.id : null;
  const filesCount = isSkillSet ? room.filesCount : null;

  const [skills, setSkills] = React.useState<Pick<TFile, "id" | "title">[]>(
    [],
  );

  React.useEffect(() => {
    setSkills([]);
    if (id === null) return undefined;
    let cancelled = false;
    getFolder(id, FilesFilter.getDefault({ pageCount: SKILLS_LIMIT }))
      .then(({ files }) => {
        if (cancelled) return;
        setSkills(files.filter((file) => isSkillTitle(file.title)));
      })
      // A set that cannot be read is shown without its skills.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id, filesCount]);

  if (!isSkillSet || skills.length === 0) return null;

  return (
    <>
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Common:Skills")}
        </Text>
      </div>
      <ul className={styles.list} data-testid="skill-set-info-skills">
        {skills.map((skill) => (
          <li key={skill.id} className={styles.item}>
            <SkillIcon kind="skill" size={32} />
            <Text fontSize="13px" truncate className={styles.name}>
              {skill.title.slice(0, -SKILL_EXTENSION.length)}
            </Text>
            <Text fontSize="11px" lineHeight="16px" className={styles.command}>
              {toSkillCommand(getSkillNameByTitle(skill.title))}
            </Text>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SkillSetInfo;
