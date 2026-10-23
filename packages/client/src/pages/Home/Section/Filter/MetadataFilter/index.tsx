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

import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import {
  Heading,
  HeadingLevel,
  HeadingSize,
} from "@onlyoffice/apps-ui-kit/components/heading";
import { SelectedItem } from "@onlyoffice/apps-ui-kit/components/selected-item";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { CustomItemRenderProps } from "@onlyoffice/apps-ui-kit/components/filter/Filter.types";
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";

import ConditionsPanel from "./sub-components/ConditionsPanel";
import type { TMetadataFilterState } from "./types";
import {
  getMetadataSelectedItem,
  isFilterableTemplate,
  parseMetadataFilter,
  removeMetadataChip,
  serializeMetadataFilter,
  TEMPLATE_CHIP_KEY,
} from "./utils";
import styles from "./MetadataFilter.module.scss";

type MetadataFilterSectionProps = Omit<CustomItemRenderProps, "group"> & {
  templates: TMetadataTemplate[];
};

const MetadataFilterSection = ({
  value,
  onChange,
  openPanel,
  closePanel,
  closeFilter,
  templates,
}: MetadataFilterSectionProps) => {
  const { t, i18n } = useTranslation(["Metadata", "Common"]);

  const state = parseMetadataFilter(value?.key);
  const template = templates.find(({ id }) => id === state?.templateId);
  const chips = state
    ? getMetadataSelectedItem(t, state, template, i18n.language).chips
    : [];
  const isTemplateOnly = chips[0]?.key === TEMPLATE_CHIP_KEY;
  const conditionCount = isTemplateOnly ? 0 : chips.length;

  const setState = (next: TMetadataFilterState | null) =>
    onChange(
      next
        ? {
            key: serializeMetadataFilter(next),
            label: templates.find(({ id }) => id === next.templateId)?.name,
          }
        : null,
    );

  const openConditions = () =>
    openPanel(() => (
      <ConditionsPanel
        templates={templates.filter(
          (template) =>
            isFilterableTemplate(template) || template.id === state?.templateId,
        )}
        state={state}
        onApply={(next) => {
          setState(next);
          closePanel();
        }}
        onBack={closePanel}
        onClose={closeFilter}
      />
    ));

  return (
    <div className={styles.section} data-testid="metadata_filter_section">
      <div className={styles.header}>
        <Heading size={HeadingSize.xsmall} level={HeadingLevel.h1}>
          {!conditionCount
            ? t("Common:SubmenuMetadata")
            : conditionCount === 1
              ? t("Metadata:ConditionsCount_one", { count: 1 })
              : t("Metadata:ConditionsCount_other", { count: conditionCount })}
        </Heading>
      </div>

      {isTemplateOnly ? null : (
        <Text className={styles.hint} fontSize="13px" lineHeight="20px">
          {state
            ? t("Metadata:TemplateValue", {
                template: template?.name ?? state.templateId,
              })
            : t("Metadata:FilterByMetadataDescription")}
        </Text>
      )}

      {state
        ? chips.map((chip) => (
            <SelectedItem
              key={chip.key}
              propKey={chip.key}
              label={chip.label}
              title={chip.label}
              className={styles.chip}
              isInline
              onClose={() => setState(removeMetadataChip(state, chip.key))}
              dataTestId={`metadata_filter_chip_${chip.key}`}
            />
          ))
        : null}

      <AddButton
        label={t("Metadata:AddCondition")}
        onClick={openConditions}
        testId="metadata_filter_add_condition"
      />
    </div>
  );
};

export default MetadataFilterSection;
