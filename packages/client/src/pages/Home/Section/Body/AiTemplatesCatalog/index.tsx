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

import { ReactSVG } from "react-svg";

import { SelectedItem } from "@onlyoffice/apps-ui-kit/components/selected-item";
import { SearchInput } from "@onlyoffice/apps-ui-kit/components/search-input";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { RoomsType } from "@docspace/shared/enums";
import { getBrandName } from "@docspace/shared/constants/brands";
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

import ProjectLogo from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";

import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import SkillSetReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import KnowledgeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import VerifiedReactSvgUrl from "PUBLIC_DIR/images/icons/16/verified.react.svg?url";

import styles from "./AiTemplatesCatalog.module.scss";

/**
 * A template has no logo of its own: its initials, as a room without a
 * cover shows them, on one of the room logo colours. The colour is picked by
 * the template's id, so a template keeps it between visits.
 */
export const getTemplateLogo = (id: string) => {
  const { logoColors } = globalColors;
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return { color: logoColors[hash % logoColors.length] };
};

const DETAIL_ICONS = {
  skills: SkillSetReactSvgUrl,
  knowledge: KnowledgeReactSvgUrl,
  files: undefined,
};

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

/** The categories of the templates, in the order they first appear. */
export const getTemplateCategories = (templates: TAiTemplate[]): string[] =>
  Array.from(new Set(templates.map(({ category }) => category)));

/**
 * The templates of a category (all of them for `null`) whose name,
 * description or category holds the search text.
 */
export const filterTemplates = (
  templates: TAiTemplate[],
  search: string,
  category: string | null,
): TAiTemplate[] => {
  const query = search.trim().toLowerCase();
  return templates.filter(
    (template) =>
      (category === null || template.category === category) &&
      (!query ||
        [template.name, template.description, template.category].some((text) =>
          text.toLowerCase().includes(query),
        )),
  );
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
  const aiPresetsStore = useStore("aiPresetsStore");

  const [catalog, setCatalog] = React.useState<TAiTemplateCatalog | null>(
    null,
  );
  const [failed, setFailed] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
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
      // The agent is installed without the template's model: it runs on the
      // workspace's own until one is chosen. (Skipped instructions are not
      // shown: the agent form does not edit them.)
      if (installed.warnings?.includes("modelNotSaved"))
        toastr.warning(
          t("Common:AiTemplateModelNotSaved", { name: installed.title }),
        );
      // A new agent shows in the sidebar and the chat's agents menu.
      if (installed.kind === "agent") void aiPresetsStore.fetchPresets();
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
  const installLabel = t("Common:Install");
  const isBusy = installingId !== null;

  const row = (label: string, value: React.ReactNode, key: string) => (
    <React.Fragment key={key}>
      <Text fontSize="13px" className={styles.label} truncate>
        {label}
      </Text>
      <div className={styles.value} data-testid={`ai-template-${key}`}>
        {value}
      </div>
    </React.Fragment>
  );

  const text = (value: string) => (
    <Text fontSize="13px" fontWeight={600} truncate title={value}>
      {value}
    </Text>
  );

  const listTemplates = getListTemplates(catalog, listType);
  const categories = getTemplateCategories(listTemplates);
  // A category the list does not have (the list changed) shows them all.
  const activeCategory =
    category !== null && categories.includes(category) ? category : null;
  const shown = filterTemplates(listTemplates, search, activeCategory);

  const tab = (value: string | null, label: string) => (
    <SelectedItem
      key={value ?? "all"}
      propKey={value ?? "all"}
      label={label}
      onClick={() => setCategory(value)}
      onClose={() => {}}
      hideCross
      clickable
      isActive={activeCategory === value}
      className={styles.tab}
      dataTestId="ai-templates-category"
    />
  );

  const card = (template: TAiTemplate) => (
        <div
          key={template.id}
          className={styles.card}
          data-testid="ai-template-card"
        >
          <div className={styles.head}>
            <ProjectLogo
              project={{
                title: template.name,
                logo: getTemplateLogo(template.id),
              }}
              className={styles.logo}
            />
            <div className={styles.title}>
              <Text
                fontSize="16px"
                fontWeight={700}
                truncate
                title={template.name}
              >
                {template.name}
              </Text>
              <Text
                fontSize="13px"
                className={styles.description}
                title={template.description}
              >
                {template.description}
              </Text>
            </div>
            <div className={styles.actions}>
              <IconButton
                iconName={CreateRoomReactSvgUrl}
                size={16}
                isFill
                isClickable
                isDisabled={isBusy}
                title={installLabel}
                onClick={() => onInstall(template)}
                dataTestId="ai-template-install"
              />
            </div>
          </div>
          <div className={styles.details}>
            {row(t("Common:Category"), text(template.category), "category")}
            {getTemplateDetails(template, catalog).map(({ key, values }) =>
              row(
                labels[key],
                <>
                  {DETAIL_ICONS[key] ? (
                    <ReactSVG src={DETAIL_ICONS[key]} className={styles.icon} />
                  ) : null}
                  {text(values.join(", "))}
                </>,
                key,
              ),
            )}
            {row(
              t("Common:Owner"),
              <>
                {text(getBrandName("OrganizationName"))}
                <ReactSVG src={VerifiedReactSvgUrl} className={styles.verified} />
              </>,
              "owner",
            )}
          </div>
        </div>
  );

  return (
    <div className={styles.wrapper} data-testid="ai-templates-catalog">
      <SearchInput
        className={styles.search}
        scale
        size={InputSize.base}
        placeholder={t("Common:Search")}
        value={search}
        onChange={setSearch}
        onClearSearch={() => setSearch("")}
      />
      <div className={styles.tabs} data-testid="ai-templates-categories">
        {tab(null, t("Common:All"))}
        {categories.map((value) => tab(value, value))}
      </div>
      {shown.length === 0 ? (
        <Text className={styles.message} data-testid="ai-templates-empty">
          {t("Common:NotFoundTitle")}
        </Text>
      ) : (
        <div className={styles.catalog}>{shown.map(card)}</div>
      )}
    </div>
  );
};

export default AiTemplatesCatalog;
