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

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { useTranslation } from "react-i18next";

import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  InputType,
  TextInput,
} from "@onlyoffice/apps-ui-kit/components/text-input";
import { METADATA_NAME_MAX_LENGTH } from "@docspace/shared/utils/metadata";

import type { TFieldOptionDraft } from "../../types";
import styles from "./TemplatePanel.module.scss";

type OptionsListProps = {
  options: TFieldOptionDraft[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
};

const OptionsList = ({
  options,
  onAdd,
  onChange,
  onRemove,
}: OptionsListProps) => {
  const { t } = useTranslation(["Metadata"]);

  return (
    <div className={styles.section}>
      <Text fontSize="15px" fontWeight={600} lineHeight="16px">
        {t("Metadata:Options")}
      </Text>
      <AddButton
        iconName={PlusReactSvgUrl}
        label={t("Metadata:AddOption")}
        onClick={onAdd}
        testId="metadata_add_option_button"
      />
      {options.length ? (
        <div className={styles.optionList}>
          {options.map((option, index) => (
            <div className={styles.optionRow} key={option.id ?? index}>
              <TextInput
                type={InputType.text}
                value={option.value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={t("Metadata:OptionValue")}
                maxLength={METADATA_NAME_MAX_LENGTH}
                scale
              />
              <IconButton
                iconName={CatalogTrashReactSvgUrl}
                size={16}
                isClickable
                onClick={() => onRemove(index)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default OptionsList;
