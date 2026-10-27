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

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { EmptyView } from "@onlyoffice/apps-ui-kit/components/empty-view";
import type { EmptyViewOptionsType } from "@onlyoffice/apps-ui-kit/components/empty-view";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";

import EmptyProjectsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import EmptyProjectsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import EmptyFilterLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.light.svg";
import EmptyFilterDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.dark.svg";
import CreateProjectIcon from "PUBLIC_DIR/images/emptyview/create.ai-agent.svg";
import GoToRoomsIcon from "PUBLIC_DIR/images/emptyview/create.room.svg";

import {
  getAIAgentsAIDisabledDescription,
  getAIAgentsAIDisabledTitle,
} from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/EmptyViewContainer.utils";

import styles from "../AiProjects.module.scss";

type EmptyProjectsProps = {
  /** `filter`: nothing matches; `ai-off`: AI is not configured; `empty`: no projects. */
  kind: "empty" | "filter" | "ai-off";
  canManage: boolean;
  isAdmin: boolean;
  onCreate: () => void;
  onClearFilter: () => void;
  /** `ai-off` only: the agents' activation flow (useChatNoAccess). */
  standalone?: boolean;
  isCardLinkedToPortal?: boolean;
  isActivating?: boolean;
  onActivateAI?: () => void;
  onTopUpAndActivateAI?: () => void;
  onGoToAISettings?: () => void;
};

/**
 * The empty states of the list, one per user type: an admin or room admin
 * can create a project and is pointed to Rooms for the sources, a user or
 * guest only waits for an invitation, and with AI off the view is the one
 * of the agents root (settings on standalone, activation on SaaS).
 */
export const EmptyProjects = ({
  kind,
  canManage,
  isAdmin,
  onCreate,
  onClearFilter,
  standalone = false,
  isCardLinkedToPortal = false,
  isActivating = false,
  onActivateAI,
  onTopUpAndActivateAI,
  onGoToAISettings,
}: EmptyProjectsProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const navigate = useNavigate();

  if (kind === "filter") {
    return (
      <EmptyView
        className={styles.empty}
        icon={isBase ? <EmptyFilterLightIcon /> : <EmptyFilterDarkIcon />}
        title={t("Common:NotFoundTitle")}
        description={t("Common:AIProjectsNotFound")}
        options={[
          { key: "clear-filter", type: "button", primary: false, title: t("Common:ClearFilter"), onClick: onClearFilter },
        ]}
      />
    );
  }

  if (kind === "ai-off") {
    // The agents root's "AI is not active" view: a standalone admin is sent
    // to the AI provider settings, a SaaS admin activates (or tops up and
    // activates) the service, a user is told to contact an admin.
    let options: EmptyViewOptionsType | null = null;
    if (isAdmin && standalone) {
      options = [
        { key: "go-to-ai-provider-settings", type: "button", title: t("Common:GoToSettings"), onClick: onGoToAISettings },
      ];
    } else if (isAdmin) {
      options = isCardLinkedToPortal
        ? [{ key: "activate-ai", type: "button", title: t("Common:Activate"), onClick: onActivateAI, isLoading: isActivating }]
        : [
            {
              key: "top-up-and-activate-ai",
              type: "button",
              title: t("Common:TopUpAndActivate"),
              onClick: onTopUpAndActivateAI,
              isLoading: isActivating,
            },
          ];
    }
    return (
      <EmptyView
        className={styles.empty}
        icon={isBase ? <EmptyProjectsLightIcon /> : <EmptyProjectsDarkIcon />}
        title={getAIAgentsAIDisabledTitle(t, standalone, isAdmin)}
        description={getAIAgentsAIDisabledDescription(t, standalone, isAdmin)}
        options={options}
      />
    );
  }

  const options: EmptyViewOptionsType = canManage
    ? [
        {
          key: "create-project",
          title: t("Common:AIProjectCreate"),
          description: t("Common:AIProjectCreateDescription"),
          icon: <CreateProjectIcon />,
          onClick: onCreate,
        },
        {
          key: "go-to-rooms",
          title: t("Common:AIProjectsGoToRooms"),
          description: t("Common:AIProjectsGoToRoomsDescription"),
          icon: <GoToRoomsIcon />,
          onClick: () => navigate("/rooms/shared"),
        },
      ]
    : [
        {
          key: "go-to-rooms",
          title: t("Common:AIProjectsGoToRooms"),
          description: t("Common:AIProjectsGoToRoomsUserDescription"),
          icon: <GoToRoomsIcon />,
          onClick: () => navigate("/rooms/shared"),
        },
      ];

  return (
    <EmptyView
      className={styles.empty}
      icon={isBase ? <EmptyProjectsLightIcon /> : <EmptyProjectsDarkIcon />}
      title={canManage ? t("Common:AIProjectsEmpty") : t("Common:AIProjectsEmptyUser")}
      description={canManage ? t("Common:AIProjectsEmptyDescription") : t("Common:AIProjectsEmptyUserDescription")}
      options={options}
    />
  );
};

export default EmptyProjects;
