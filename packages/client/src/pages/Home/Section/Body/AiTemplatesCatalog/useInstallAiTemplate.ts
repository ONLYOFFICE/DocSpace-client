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

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type {
  TAiInstalledTemplate,
  TAiTemplate,
} from "@docspace/shared/api/ai/templates";

import { useStore } from "SRC_DIR/store/useStore";
import {
  getAgentPageUrl,
  getAiWorkspaceListType,
  getAiWorkspaceTabUrl,
} from "SRC_DIR/helpers/aiWorkspace";
import { canManageProjects } from "SRC_DIR/pages/AiProjects/utils";

/** The label of a template's install action: an agent is added to the user's agents. */
export const getInstallLabel = (
  t: (key: string) => string,
  template: TAiTemplate,
) =>
  template.kind === "agent" ? t("Common:AddToMyAgents") : t("Common:Install");

/**
 * The steps an installation skipped (`warnings` of the install answer), each
 * told in a sentence naming the new room: the agent's instructions, which the
 * portal has no route to store yet, and its model, which the portal could not
 * give it. Warnings the client does not know are left out.
 */
export const getInstallWarnings = (
  t: (key: string, options?: Record<string, unknown>) => string,
  installed: Pick<TAiInstalledTemplate, "title" | "warnings">,
) => {
  const name = installed.title;
  const warnings = installed.warnings ?? [];
  const messages: string[] = [];
  if (warnings.includes("instructionsNotSaved"))
    messages.push(t("Common:AiTemplateInstructionsNotSaved", { name }));
  if (warnings.includes("modelNotSaved"))
    messages.push(t("Common:AiTemplateModelNotSaved", { name }));
  return messages;
};

/**
 * Who may install a template: whoever may create an agent (the portal owner,
 * DocSpace admins and room admins), as installing one creates an agent.
 */
export const useCanInstallAiTemplates = () =>
  canManageProjects(useStore("userStore").user);

/**
 * Installs a template once the user confirmed it (AiTemplateInstallDialog,
 * opened by the card's Install, its menu and the Info panel's "Add to my
 * agents"): the user is told, or warned of what the installation skipped
 * (the agent's instructions or model). A new agent opens on its own page;
 * for a skill set or a knowledge base the user is returned to the list,
 * where the new room is. A refusal is shown and the
 * catalog stays. Nothing is installed while another installation runs, so a
 * second click does not install the template again.
 */
export const useInstallAiTemplate = () => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useStore("userStore").user?.id;
  const aiPresetsStore = useStore("aiPresetsStore");
  const aiTemplatesStore = useStore("aiTemplatesStore");

  return async (template: TAiTemplate) => {
    if (aiTemplatesStore.isInstalling) return;
    try {
      const installed = await aiTemplatesStore.install(template);
      // An installation that skipped a step is reported by what it
      // skipped instead of the plain confirmation.
      const warnings = getInstallWarnings(t, installed);
      if (warnings.length) toastr.warning(warnings.join(" "));
      else
        toastr.success(
          t("Common:AiTemplateInstalled", { name: installed.title }),
        );
      // A new agent shows in the sidebar and the chat's agents menu, and
      // opens, as an agent made in the create form does.
      if (installed.kind === "agent") {
        void aiPresetsStore.fetchPresets();
        navigate(getAgentPageUrl(installed.id));
        return;
      }
      navigate(
        getAiWorkspaceTabUrl(
          false,
          getAiWorkspaceListType(location.search),
          userId,
        ),
      );
    } catch (error) {
      toastr.error(error as Error);
    }
  };
};
