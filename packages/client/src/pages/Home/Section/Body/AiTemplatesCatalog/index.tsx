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
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import classNames from "classnames";

import { ReactSVG } from "react-svg";

import { SearchInput } from "@onlyoffice/apps-ui-kit/components/search-input";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { ContextMenuButton } from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { EmptyView } from "@docspace/shared/components/empty-view";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getBrandName } from "@docspace/shared/constants/brands";
import type {
  TAiTemplate,
  TAiTemplateCatalog,
} from "@docspace/shared/api/ai/templates";

import { useStore } from "SRC_DIR/store/useStore";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import {
  getAiWorkspaceListType,
  getAiWorkspaceTitle,
} from "SRC_DIR/helpers/aiWorkspace";
import { showInfoPanel } from "SRC_DIR/helpers/info-panel";

import ProjectLogo from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";
import AiCategoryTabs from "SRC_DIR/components/AiCategoryTabs";

import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import SkillSetReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import KnowledgeReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import VerifiedReactSvgUrl from "PUBLIC_DIR/images/icons/16/verified.react.svg?url";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import EmptyFilterAIAgentsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.light.svg";
import EmptyFilterAIAgentsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.dark.svg";

import {
  getInstallLabel,
  useCanInstallAiTemplates,
} from "./useInstallAiTemplate";
import AiTemplateInstallDialog from "./AiTemplateInstallDialog";
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
 * the list's kind as cards, each installed into the portal by its button,
 * once the user confirmed it. Installing an agent brings the skill sets and
 * knowledge bases it is linked to; the list is then shown again, with the new
 * room in it. While an installation runs, no install control can start
 * another. A card is selected by a click, and the Info panel shows the
 * selected template. Only those who may create an agent are offered to
 * install one.
 */
const AiTemplatesCatalog = () => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const userId = useStore("userStore").user?.id;
  const aiTemplatesStore = useStore("aiTemplatesStore");
  const { isAiHubFolder } = useStore("treeFoldersStore");
  const { fetchRooms } = useStore("filesStore");
  const canInstall = useCanInstallAiTemplates();
  const { isBase } = useTheme();

  const { catalog, failed, selectedId, isInstalling, requestInstall } =
    aiTemplatesStore;

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);

  React.useEffect(() => {
    void aiTemplatesStore.fetchCatalog();
    // A template stays selected, and its confirmation open, while the tab
    // is shown.
    return () => {
      aiTemplatesStore.select(null);
      aiTemplatesStore.closeInstallConfirmation();
    };
  }, [aiTemplatesStore]);

  const listType = getAiWorkspaceListType(location.search);

  // The tab draws no list, so nothing else reads the section for it, nor
  // titles the browser tab. Reached from a room of the section (an opened
  // skill set, then the tab's address), the header would go on showing that
  // room: the section's root is read, as the list would read it.
  React.useEffect(() => {
    setDocumentTitle(getAiWorkspaceTitle(t, location.search));
  }, [t, location.search]);

  React.useEffect(() => {
    if (isAiHubFolder) return;
    const filter = RoomsFilter.getDefault(userId, RoomSearchArea.AiHub);
    filter.searchArea = RoomSearchArea.AiHub;
    filter.type = [String(listType)];
    fetchRooms(null, filter).catch(() => {
      // The header stays as it was; the catalog does not need the list.
    });
  }, [isAiHubFolder, fetchRooms, userId, listType]);

  const listTemplates = catalog ? getListTemplates(catalog, listType) : [];
  const categories = getTemplateCategories(listTemplates);
  // A category the list does not have (the list changed) shows them all.
  const activeCategory =
    category !== null && categories.includes(category) ? category : null;
  const shown = filterTemplates(listTemplates, search, activeCategory);

  // A template the search or the category hides is no longer selected.
  const isSelectionHidden =
    selectedId !== null && !shown.some(({ id }) => id === selectedId);
  React.useEffect(() => {
    if (isSelectionHidden) aiTemplatesStore.select(null);
  }, [isSelectionHidden, aiTemplatesStore]);

  if (failed)
    return (
      <Text className={styles.message} data-testid="ai-templates-error">
        {t("Common:SomethingWentWrong")}
      </Text>
    );

  if (!catalog) return null;

  // The empty search shows the lists' "no findings" view; clearing its
  // filter drops the search and the category, so all the templates show.
  const onClearFilter = (event: React.MouseEvent) => {
    event.preventDefault();
    setSearch("");
    setCategory(null);
  };

  const labels = {
    skills: t("Common:SkillSets"),
    knowledge: t("Common:AIProjectKnowledgeRooms"),
    files: t("Common:Files"),
  };
  const installLabel = t("Common:Install");

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

  const getMenu = (template: TAiTemplate): ContextMenuModel[] => [
    ...(canInstall
      ? [
          {
            key: "install",
            label: getInstallLabel(t, template),
            icon: CreateRoomReactSvgUrl,
            disabled: isInstalling,
            onClick: () => requestInstall(template),
          },
        ]
      : []),
    {
      key: "info",
      label: t("Common:Info"),
      icon: InfoOutlineReactSvgUrl,
      onClick: () => {
        aiTemplatesStore.select(template.id);
        showInfoPanel();
      },
    },
  ];

  const card = (template: TAiTemplate) => (
    <div
      key={template.id}
      className={classNames(styles.card, {
        [styles.selected]: selectedId === template.id,
      })}
      onClick={() => aiTemplatesStore.select(template.id)}
      data-selected={selectedId === template.id}
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
          <div className={styles.name}>
            <Text fontSize="16px" fontWeight={700} truncate title={template.name}>
              {template.name}
            </Text>
            <ReactSVG
              src={VerifiedReactSvgUrl}
              className={styles.verified}
              data-testid="ai-template-verified"
            />
          </div>
          <Text
            fontSize="13px"
            className={styles.description}
            title={template.description}
          >
            {template.description}
          </Text>
        </div>
        <div className={styles.actions}>
          {canInstall ? (
            <IconButton
              iconName={CreateRoomReactSvgUrl}
              size={16}
              isFill
              isClickable
              isDisabled={isInstalling}
              title={installLabel}
              onClick={() => requestInstall(template)}
              dataTestId="ai-template-install"
            />
          ) : null}
          <ContextMenuButton
            getData={() => getMenu(template)}
            directionX="right"
            testId="ai-template-menu"
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
      <AiCategoryTabs
        categories={categories}
        selected={activeCategory}
        onSelect={setCategory}
        ariaLabel={t("Common:Category")}
        dataTestId="ai-templates-categories"
        itemTestId="ai-templates-category"
      />
      {shown.length === 0 ? (
        <div data-testid="ai-templates-empty">
          <EmptyView
            icon={
              isBase ? (
                <EmptyFilterAIAgentsLightIcon />
              ) : (
                <EmptyFilterAIAgentsDarkIcon />
              )
            }
            title={t("Common:NoFindingsFound")}
            description={t("Common:EmptyFilterAIAgentsDescription")}
            options={[
              {
                key: "empty-view-filter",
                to: "",
                description: t("Common:ClearFilter"),
                icon: <ClearEmptyFilterSvg />,
                onClick: onClearFilter,
              },
            ]}
          />
        </div>
      ) : (
        <div
          className={styles.catalog}
          // A click between the cards selects none of them.
          onClick={(e) => {
            if (e.target === e.currentTarget) aiTemplatesStore.select(null);
          }}
        >
          {shown.map(card)}
        </div>
      )}
      <AiTemplateInstallDialog />
    </div>
  );
};

export default observer(AiTemplatesCatalog);
