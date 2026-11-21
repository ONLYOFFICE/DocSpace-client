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
import { observer } from "mobx-react";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  getSkillNameByTitle,
  toSkillCommand,
} from "@docspace/shared/utils/skillFile";

import { useStore } from "SRC_DIR/store/useStore";

import styles from "./SkillTilePreview.module.scss";

type SkillTilePreviewProps = {
  /** The skill's file. */
  file: {
    id: number | string;
    title: string;
    version?: number;
    viewUrl?: string;
  };
};

/**
 * What a skill's tile shows in place of a thumbnail: the command that calls
 * the skill in the chat and what its description says, as the table and the
 * Info panel tell them. The description is in the file's text, read once
 * per version by the skills store; until it lands the command stands alone.
 */
const SkillTilePreview = ({ file }: SkillTilePreviewProps) => {
  const skillsStore = useStore("skillsStore");
  const { id, version, viewUrl, title } = file;

  const skill = skillsStore.get({ id, version });
  // A saved skill is dropped from the store and read again.
  const hasSkill = !!skill;
  React.useEffect(() => {
    if (!hasSkill) skillsStore.fetch({ id, version, viewUrl });
  }, [skillsStore, id, version, viewUrl, hasSkill]);

  const command = toSkillCommand(skill?.name || getSkillNameByTitle(title));
  const description = skill?.description ?? "";

  return (
    <div className={styles.preview} data-testid="skill-tile-preview">
      <Text
        fontSize="13px"
        fontWeight={600}
        className={styles.command}
        title={command}
        truncate
        dataTestId="skill-tile-command"
      >
        {command}
      </Text>
      {description ? (
        <Text
          fontSize="13px"
          className={styles.description}
          title={description}
          dataTestId="skill-tile-description"
        >
          {description}
        </Text>
      ) : null}
    </div>
  );
};

export default observer(SkillTilePreview);
