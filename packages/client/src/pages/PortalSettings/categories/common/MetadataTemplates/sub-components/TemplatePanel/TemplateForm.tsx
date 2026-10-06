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

import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  InputType,
  TextInput,
} from "@onlyoffice/apps-ui-kit/components/text-input";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { METADATA_NAME_MAX_LENGTH } from "@docspace/shared/utils/metadata";

import type { TTemplateDraft } from "../../types";
import FieldsList, { type FieldsListProps } from "./FieldsList";
import styles from "./TemplatePanel.module.scss";

type TemplateFormProps = Omit<FieldsListProps, "fields"> & {
  draft: TTemplateDraft;
  onChange: (patch: Partial<TTemplateDraft>) => void;
};

const TemplateForm = ({
  draft,
  onChange,
  ...fieldsListProps
}: TemplateFormProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  return (
    <div className={classNames(styles.form, styles.templateForm)}>
      <div className={styles.visibleBlock}>
        <div className={styles.visibleToggle}>
          <ToggleButton
            className={styles.toggle}
            isChecked={draft.visible}
            onChange={() => onChange({ visible: !draft.visible })}
            dataTestId="metadata_template_visible_toggle"
          />
        </div>
        <div className={styles.visibleText}>
          <Text fontWeight={600} lineHeight="20px">
            {t("Metadata:Visible")}
          </Text>
          <Text fontSize="12px" lineHeight="16px">
            {t("Metadata:HiddenTemplateHint")}
          </Text>
        </div>
      </div>

      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={t("Common:Name")}
      >
        <TextInput
          type={InputType.text}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t("Metadata:EnterTemplateName")}
          maxLength={METADATA_NAME_MAX_LENGTH}
          scale
          testId="metadata_template_name_input"
        />
      </FieldContainer>

      <FieldsList fields={draft.fields} {...fieldsListProps} />
    </div>
  );
};

export default TemplateForm;
