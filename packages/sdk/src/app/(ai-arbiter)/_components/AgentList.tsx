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

"use client";

import React from "react";
import { observer } from "mobx-react";

import type { AgentSummary } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";

const AVATAR_COLORS = [
  "rgb(78, 157, 245)",
  "rgb(82, 196, 26)",
  "rgb(250, 140, 22)",
  "rgb(114, 46, 209)",
  "rgb(235, 47, 150)",
  "rgb(19, 194, 194)",
  "rgb(245, 34, 45)",
  "rgb(9, 109, 217)",
];

function agentColor(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = title.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function agentInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
}

type AgentListProps = {
  experts: AgentSummary[];
  arbiter: AgentSummary;
};

export const AgentList = observer(({ experts, arbiter }: AgentListProps) => {
  return (
    <div className={styles.pickerBar}>
      <span className={styles.pickerLabel}>Experts:</span>

      {experts.map((a) => (
        <span key={a.id} className={styles.agentTag}>
          <span
            className={styles.agentAvatar}
            style={{ background: agentColor(a.title) }}
          >
            {agentInitials(a.title)}
          </span>
          {a.title}
        </span>
      ))}

      <span className={styles.pickerLabel} style={{ marginLeft: 8 }}>
        Arbiter:
      </span>

      <span className={styles.agentTagArbiter}>
        <span
          className={styles.agentAvatar}
          style={{ background: agentColor(arbiter.title) }}
        >
          {agentInitials(arbiter.title)}
        </span>
        {arbiter.title}
      </span>
    </div>
  );
});
