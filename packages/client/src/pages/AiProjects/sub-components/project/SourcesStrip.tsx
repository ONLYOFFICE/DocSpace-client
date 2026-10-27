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
import { useNavigate } from "react-router";

import { Tag } from "@onlyoffice/apps-ui-kit/components/tag";
import { iconSize32 } from "@docspace/shared/utils/image-helpers";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import styles from "./ProjectSources.module.scss";

type SourcesStripProps = {
  project: TAiProject;
};

/**
 * On a phone the sources column has no room: one scrolling row of the
 * linked rooms above the conversation, a tap opens the room.
 */
const SourcesStrip = ({ project }: SourcesStripProps) => {
  const navigate = useNavigate();
  const { instructionsRooms, knowledgeRooms } = project.aiProject;

  const items = [
    ...instructionsRooms.map((room) => ({ id: room.id, key: `i-${room.id}`, title: room.title, icon: "instructionsRoom.svg" })),
    ...knowledgeRooms.map((room) => ({ id: room.id, key: `k-${room.id}`, title: room.title, icon: "knowledgeRoom.svg" })),
  ];

  if (items.length === 0) return null;

  return (
    <div className={styles.strip} data-testid="ai-project-sources-strip">
      {items.map((item) => (
        <Tag
          key={item.key}
          tag={item.key}
          label={item.title}
          icon={iconSize32.get(item.icon) ?? ""}
          onClick={() => navigate(`/rooms/shared/${item.id}`)}
        />
      ))}
    </div>
  );
};

export default observer(SourcesStrip);
