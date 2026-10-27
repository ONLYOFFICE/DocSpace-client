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

import type { ReactNode } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { TEntryMetadata } from "@docspace/shared/api/metadata/types";
import type { TMetadataInput } from "@docspace/shared/utils/metadata";

import TemplateForm from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/sub-components/TemplatePanel/TemplateForm";
import type { TTemplateForm } from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/types";

import SavedMetadata from "./SavedMetadata";
import styles from "../MetadataAIPanel.module.scss";

type FillFormsProps = {
  metadata: TEntryMetadata | null;
  forms: TTemplateForm[];
  customFields: ReactNode;
  isAnalyzing: boolean;
  isReadOnly: boolean;
  onChange: (templateId: number, fieldId: number, input: TMetadataInput) => void;
};

const SectionTitle = ({ children }: { children: string }) => (
  <Text
    className={styles.templateName}
    fontSize="14px"
    fontWeight={600}
    lineHeight="16px"
    truncate
  >
    {children}
  </Text>
);

const FillForms = ({
  metadata,
  forms,
  customFields,
  isAnalyzing,
  isReadOnly,
  onChange,
}: FillFormsProps) => {
  const { t } = useTranslation(["Metadata"]);

  const withTitles = forms.length > 1 || !!customFields;

  const getContent = () => {
    if (isReadOnly) {
      return metadata ? <SavedMetadata metadata={metadata} /> : null;
    }

    return (
      <>
        {forms.map((form) => (
          <div key={form.template.id}>
            {withTitles ? <SectionTitle>{form.template.name}</SectionTitle> : null}
            <TemplateForm
              form={form}
              onChange={(fieldId, input) =>
                onChange(form.template.id, fieldId, input)
              }
            />
          </div>
        ))}
        {customFields ? (
          <div>
            {forms.length ? (
              <SectionTitle>{t("Metadata:CustomFields")}</SectionTitle>
            ) : null}
            {customFields}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className={styles.forms}>
      <div className={classNames({ [styles.disabled]: isAnalyzing })}>
        {getContent()}
      </div>
      {isAnalyzing ? (
        <div className={styles.overlay} data-testid="metadata_ai_analyzing">
          <Loader type={LoaderTypes.track} size="64px" />
        </div>
      ) : null}
    </div>
  );
};

export default FillForms;
