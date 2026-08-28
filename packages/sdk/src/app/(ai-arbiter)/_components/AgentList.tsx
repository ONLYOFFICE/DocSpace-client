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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers/theme";
import CrossIcon from "@docspace/ui-kit/assets/icons/12/cross.react.svg";

import type { AgentSummary } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";

const fallbackLogoColor = (title: string): string => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  const palette = globalColors.logoColors;
  return palette[Math.abs(hash) % palette.length].replace("#", "");
};

type AgentListProps = {
  experts: AgentSummary[];
  arbiter: AgentSummary;
  isRunning?: boolean;
  onRemoveExpert?: (id: number) => void;
  onAddExpert?: () => void;
};

type AgentItemProps = {
  agent: AgentSummary;
  isArbiter?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
};

const AgentItem = ({
  agent,
  isArbiter = false,
  onRemove,
  removeLabel,
}: AgentItemProps) => (
  <div className={isArbiter ? styles.agentItemArbiter : styles.agentItem}>
    <RoomIcon
      title={agent.title}
      color={agent.logoColor ?? fallbackLogoColor(agent.title)}
      size="24px"
      radius="6px"
      showDefault
    />
    <Text fontSize="13px" truncate title={agent.title} noSelect>
      {agent.title}
    </Text>
    {onRemove ? (
      <IconButton
        iconNode={<CrossIcon />}
        size={12}
        isClickable
        isFill
        title={removeLabel}
        onClick={onRemove}
      />
    ) : null}
  </div>
);

export const AgentList = observer(
  ({
    experts,
    arbiter,
    isRunning = false,
    onRemoveExpert,
    onAddExpert,
  }: AgentListProps) => {
    const { t } = useTranslation(["Common"]);
    const canEdit = !isRunning;

    return (
      <div className={styles.pickerBar}>
        <Text
          className={styles.pickerLabel}
          fontSize="12px"
          fontWeight={600}
          color="var(--arbiter-muted)"
          noSelect
        >
          {t("Common:ArbiterExpertsLabel")}
        </Text>

        {experts.map((a) => (
          <AgentItem
            key={a.id}
            agent={a}
            onRemove={
              onRemoveExpert && canEdit ? () => onRemoveExpert(a.id) : undefined
            }
            removeLabel={t("Common:ArbiterRemoveExpert", { name: a.title })}
          />
        ))}

        {onAddExpert && canEdit ? (
          <Link
            type={LinkType.action}
            fontSize="13px"
            isHovered
            onClick={onAddExpert}
          >
            {t("Common:ArbiterAddExpert")}
          </Link>
        ) : null}

        <Text
          className={styles.pickerLabel}
          fontSize="12px"
          fontWeight={600}
          color="var(--arbiter-muted)"
          noSelect
        >
          {t("Common:ArbiterLabel")}
        </Text>

        <AgentItem agent={arbiter} isArbiter />
      </div>
    );
  },
);
