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

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AsideHeader } from "@onlyoffice/apps-ui-kit/components/aside";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ComboBox } from "@onlyoffice/apps-ui-kit/components/combobox";
import { Scrollbar } from "@onlyoffice/apps-ui-kit/components/scrollbar";
import {
  Heading,
  HeadingLevel,
  HeadingSize,
} from "@onlyoffice/apps-ui-kit/components/heading";
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";

import { isValidFieldInput } from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/utils";

import type { TConditionDraft, TMetadataFilterState } from "../types";
import { getDrafts, toFilterState } from "../utils";
import ConditionRow from "./ConditionRow";
import FilterField from "./FilterField";
import styles from "../MetadataFilter.module.scss";

type ConditionsPanelProps = {
  templates: TMetadataTemplate[];
  state: TMetadataFilterState | null;
  onApply: (state: TMetadataFilterState) => void;
  onBack: () => void;
  onClose: () => void;
};

const ConditionsPanel = ({
  templates,
  state,
  onApply,
  onBack,
  onClose,
}: ConditionsPanelProps) => {
  const { t } = useTranslation(["Metadata", "Files", "Common"]);

  const [template, setTemplate] = useState(
    () => templates.find(({ id }) => id === state?.templateId) ?? null,
  );
  const [drafts, setDrafts] = useState<Record<number, TConditionDraft>>(() =>
    template ? getDrafts(template, state) : {},
  );

  const templateOptions = templates.map(({ id, name }) => ({
    key: id,
    label: name,
  }));

  const selectTemplate = (templateId: string | number) => {
    const next = templates.find(({ id }) => id === templateId);
    if (!next) return;

    setTemplate(next);
    setDrafts(getDrafts(next, state));
  };

  const isValid =
    !!template &&
    (template.fields ?? []).every(
      (field) =>
        !drafts[field.id] || isValidFieldInput(field, drafts[field.id].input),
    );

  const changeDraft = (fieldId: number, draft: TConditionDraft) =>
    setDrafts((current) => ({ ...current, [fieldId]: draft }));

  return (
    <div className={styles.panel} data-testid="metadata_filter_panel">
      <AsideHeader
        header={t("Common:Filter")}
        isBackButton
        onBackClick={onBack}
        isCloseable
        onCloseClick={onClose}
      />

      <Scrollbar className={styles.panelScroll} paddingInlineEnd="0">
        <div className={styles.panelBody}>
          <div className={styles.title}>
            <Heading size={HeadingSize.xsmall} level={HeadingLevel.h3}>
              {t("Common:SubmenuMetadata")}
            </Heading>
          </div>

          <FilterField label={t("Files:Template")}>
            <ComboBox
              options={templateOptions}
              selectedOption={
                templateOptions.find(({ key }) => key === template?.id) ?? {
                  key: "",
                  label: t("Metadata:SelectMetadataTemplate"),
                }
              }
              onSelect={({ key }) => selectTemplate(key)}
              displaySelectedOption
              scaled
              scaledOptions
              dataTestId="metadata_filter_template"
            />
          </FilterField>

          {template?.fields?.map((field) =>
            drafts[field.id] ? (
              <ConditionRow
                key={field.id}
                field={field}
                draft={drafts[field.id]}
                onChange={(draft) => changeDraft(field.id, draft)}
              />
            ) : null,
          )}
        </div>
      </Scrollbar>

      <div className={styles.panelFooter}>
        <Button
          size={ButtonSize.normal}
          primary
          scale
          label={t("Metadata:ApplyFilter")}
          isDisabled={!isValid}
          onClick={() => template && onApply(toFilterState(template, drafts))}
          testId="metadata_filter_apply"
        />
        <Button
          size={ButtonSize.normal}
          scale
          label={t("Common:CancelButton")}
          onClick={onBack}
          testId="metadata_filter_cancel"
        />
      </div>
    </div>
  );
};

export default ConditionsPanel;
