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
import { useLocation, useNavigate } from "react-router";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { RoomsType } from "@docspace/shared/enums";
import {
  getAiTemplates,
  installAiTemplate,
  type TAiTemplate,
  type TAiTemplateCatalog,
} from "@docspace/shared/api/ai/templates";

import { useStore } from "SRC_DIR/store/useStore";
import {
  getAiWorkspaceListType,
  getAiWorkspaceTabUrl,
} from "SRC_DIR/helpers/aiWorkspace";

import styles from "./AiTemplatesCatalog.module.scss";

/** The templates of the catalog a list shows: those of its own room type. */
export const getListTemplates = (
  catalog: TAiTemplateCatalog,
  type: RoomsType,
): TAiTemplate[] => {
  switch (type) {
    case RoomsType.InstructionsRoom:
      return catalog.skillSets;
    case RoomsType.KnowledgeRoom:
      return catalog.knowledgeBases;
    default:
      return catalog.agents;
  }
};

/** What a card lists under the description: the linked templates of an agent, the files of the others. */
export const getTemplateDetails = (
  template: TAiTemplate,
  catalog: TAiTemplateCatalog,
): { key: "skills" | "knowledge" | "files"; values: string[] }[] => {
  if (template.kind !== "agent")
    return [{ key: "files", values: template.files }];

  const names = (
    ids: string[],
    sources: { id: string; name: string }[],
  ): string[] =>
    ids.map((id) => sources.find((source) => source.id === id)?.name ?? id);

  return [
    { key: "skills", values: names(template.skills, catalog.skillSets) },
    {
      key: "knowledge",
      values: names(template.knowledges, catalog.knowledgeBases),
    },
  ];
};

/**
 * The Templates tab of the AI Chat section's lists: the shipped templates of
 * the list's kind as cards, each installed into the portal by its button.
 * Installing an agent brings the skill sets and knowledge bases it is linked
 * to; the list is then shown again, with the new room in it.
 */
const AiTemplatesCatalog = () => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = useStore("userStore").user?.id;

  const [catalog, setCatalog] = React.useState<TAiTemplateCatalog | null>(
    null,
  );
  const [failed, setFailed] = React.useState(false);
  const [installingId, setInstallingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getAiTemplates()
      .then((data) => !cancelled && setCatalog(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const listType = getAiWorkspaceListType(location.search);

  const onInstall = async (template: TAiTemplate) => {
    setInstallingId(template.id);
    try {
      const installed = await installAiTemplate(template.id);
      toastr.success(
        t("Common:AiTemplateInstalled", { name: installed.title }),
      );
      navigate(getAiWorkspaceTabUrl(false, listType, userId));
    } catch (error) {
      toastr.error(error as Error);
      setInstallingId(null);
    }
  };

  if (failed)
    return (
      <Text className={styles.message} data-testid="ai-templates-error">
        {t("Common:SomethingWentWrong")}
      </Text>
    );

  if (!catalog) return null;

  const labels = {
    skills: t("Common:SkillSets"),
    knowledge: t("Common:AIProjectKnowledgeRooms"),
    files: t("Common:Files"),
  };

  return (
    <div className={styles.catalog} data-testid="ai-templates-catalog">
      {getListTemplates(catalog, listType).map((template) => (
        <div
          key={template.id}
          className={styles.card}
          data-testid="ai-template-card"
        >
          <Text fontSize="12px" className={styles.category} truncate>
            {template.category}
          </Text>
          <Text fontSize="16px" fontWeight={700} truncate title={template.name}>
            {template.name}
          </Text>
          <Text fontSize="13px" className={styles.description}>
            {template.description}
          </Text>
          <div className={styles.details}>
            {getTemplateDetails(template, catalog).map(({ key, values }) => (
              <React.Fragment key={key}>
                <Text fontSize="13px" className={styles.label} truncate>
                  {labels[key]}
                </Text>
                <Text
                  fontSize="13px"
                  fontWeight={600}
                  truncate
                  title={values.join(", ")}
                >
                  {values.join(", ")}
                </Text>
              </React.Fragment>
            ))}
          </div>
          <Button
            className={styles.install}
            size={ButtonSize.small}
            primary
            label={t("Common:Install")}
            isLoading={installingId === template.id}
            isDisabled={installingId !== null && installingId !== template.id}
            onClick={() => onInstall(template)}
            testId="ai-template-install"
          />
        </div>
      ))}
    </div>
  );
};

export default AiTemplatesCatalog;
