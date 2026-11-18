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
import { ReactSVG } from "react-svg";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getSkillNameByTitle } from "@docspace/shared/utils/skillFile";
import type {
  TAiTemplate,
  TAiTemplateCatalog,
} from "@docspace/shared/api/ai/templates";

import { useStore } from "SRC_DIR/store/useStore";
import type { InfoPanelViewType } from "SRC_DIR/store/InfoPanelStore";
import { InfoPanelView } from "SRC_DIR/helpers/info-panel";
import SkillIcon from "SRC_DIR/components/SkillIcon";
import ProjectLogo from "SRC_DIR/pages/AiProjects/sub-components/list/ProjectLogo";
import { getTemplateLogo } from "SRC_DIR/pages/Home/Section/Body/AiTemplatesCatalog";
import {
  getInstallLabel,
  useCanInstallAiTemplates,
} from "SRC_DIR/pages/Home/Section/Body/AiTemplatesCatalog/useInstallAiTemplate";

import VerifiedReactSvgUrl from "PUBLIC_DIR/images/icons/16/verified.react.svg?url";

import commonStyles from "../../helpers/Common.module.scss";

import styles from "./AiTemplate.module.scss";

/** The templates of the catalog an agent template names, in its order; a name it cannot find is left out. */
export const getTemplateSources = (
  template: TAiTemplate,
  catalog: TAiTemplateCatalog,
) => {
  if (template.kind !== "agent") return { skillSets: [], knowledgeBases: [] };
  const pick = <T extends { id: string }>(ids: string[], sources: T[]) =>
    ids.flatMap((id) => sources.filter((source) => source.id === id));
  return {
    skillSets: pick(template.skills, catalog.skillSets),
    knowledgeBases: pick(template.knowledges, catalog.knowledgeBases),
  };
};

type AiTemplateProps = {
  /** The tab of the panel: Details or Context. */
  view: InfoPanelViewType;
};

/**
 * The Info panel of a template selected on the Agents list's Templates tab.
 * A template is not a room: the panel is built from its catalog entry.
 * Details tells what it is - its description, the organization that ships
 * it, its type and category - and ends with "Add to my agents", which
 * installs it as the card's Install does, once the user confirmed it, for
 * those who may create agents.
 * Context lists the skill sets, with their skills, and the knowledge bases
 * the agent brings.
 */
const AiTemplate = ({ view }: AiTemplateProps) => {
  const { t } = useTranslation(["Common", "Files"]);
  const aiTemplatesStore = useStore("aiTemplatesStore");
  const canInstall = useCanInstallAiTemplates();

  const {
    selected: template,
    catalog,
    isInstalling,
    installingId,
    requestInstall,
  } = aiTemplatesStore;

  if (!template || !catalog) return null;

  const logo = getTemplateLogo(template, aiTemplatesStore.covers);
  const organization = getBrandName("OrganizationName");

  const verified = (
    <ReactSVG
      src={VerifiedReactSvgUrl}
      className={styles.verified}
      data-testid="info_panel_ai_template_verified"
    />
  );

  const property = (
    title: string,
    content: React.ReactNode,
    testId: string,
  ) => (
    <div className="property" data-testid={`info_panel_ai_template_${testId}`}>
      <Text className="property-title">{title}</Text>
      <div className={styles.propertyContent}>{content}</div>
    </div>
  );

  const value = (text: string) => (
    <Text className="property-content" title={text} truncate>
      {text}
    </Text>
  );

  const details = (
    <>
      <div className={styles.logo}>
        <ProjectLogo
          project={{ title: template.name, logo }}
          size="96px"
          radius="16px"
        />
      </div>
      {template.description ? (
        <>
          <div className={commonStyles.subtitle}>
            <Text fontWeight="600" fontSize="14px">
              {t("Common:DescriptionLabel")}
            </Text>
          </div>
          <Text
            fontSize="13px"
            className={styles.description}
            dataTestId="info_panel_ai_template_description"
          >
            {template.description}
          </Text>
        </>
      ) : null}
      <div className={commonStyles.subtitle}>
        <Text fontWeight="600" fontSize="14px">
          {t("Common:Properties")}
        </Text>
      </div>
      <div className={commonStyles.properties}>
        {property(
          t("Common:Owner"),
          <>
            {value(organization)}
            {verified}
          </>,
          "owner",
        )}
        {property(t("Common:Type"), value(t("Files:Template")), "type")}
        {property(t("Common:Category"), value(template.category), "category")}
      </div>
      {canInstall ? (
        <Button
          label={getInstallLabel(t, template)}
          size={ButtonSize.small}
          scale
          primary
          isDisabled={isInstalling}
          isLoading={installingId === template.id}
          onClick={() => requestInstall(template)}
          testId="info_panel_ai_template_install"
        />
      ) : null}
    </>
  );

  const { skillSets, knowledgeBases } = getTemplateSources(template, catalog);

  const section = (
    testId: string,
    label: string,
    rows: React.ReactNode[],
  ) => (
    <section className={styles.section} data-testid={testId}>
      <Text as="h4" fontSize="12px" fontWeight={600} className={styles.heading}>
        {label}
      </Text>
      {rows.length > 0 ? (
        rows
      ) : (
        <Text fontSize="13px" className={styles.empty}>
          {"—"}
        </Text>
      )}
    </section>
  );

  const source = (kind: "set" | "knowledge", name: string) => (
    <div className={styles.source}>
      <SkillIcon kind={kind} size={24} />
      <Text fontSize="13px" fontWeight={600} truncate title={name}>
        {name}
      </Text>
    </div>
  );

  const context = (
    <div className={styles.context} data-testid="info_panel_ai_template_context">
      {section(
        "info_panel_ai_template_skills",
        t("Common:SkillSets"),
        skillSets.map((set) => (
          <div key={set.id}>
            {source("set", set.name)}
            {set.files.length > 0 ? (
              <ul className={styles.skills}>
                {set.files.map((file) => (
                  <li key={file}>
                    <Text fontSize="13px" className={styles.skill} truncate>
                      {getSkillNameByTitle(file)}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )),
      )}
      {section(
        "info_panel_ai_template_knowledge",
        t("Common:AIProjectKnowledgeRooms"),
        knowledgeBases.map((base) => (
          <React.Fragment key={base.id}>
            {source("knowledge", base.name)}
          </React.Fragment>
        )),
      )}
    </div>
  );

  return (
    <div data-testid="info_panel_ai_template">
      <div className={commonStyles.title}>
        <ProjectLogo project={{ title: template.name, logo }} />
        <Text
          fontWeight={600}
          fontSize="16px"
          className="info-panel_header-text"
          title={template.name}
          truncate
        >
          {template.name}
        </Text>
        {verified}
      </div>
      {view === InfoPanelView.infoContext ? context : details}
    </div>
  );
};

export default observer(AiTemplate);
