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

import PlusReactSvg from "PUBLIC_DIR/images/plus.react.svg";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import { DropDown } from "@onlyoffice/apps-ui-kit/components/drop-down";
import { Tag } from "@onlyoffice/apps-ui-kit/components/tag";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import type { TChoiceInputProps } from "../../types";
import { getSelectedOptions, toggleOption } from "../../utils";
import styles from "../Panel.module.scss";

const MultiChoiceInput = ({ options, value, onChange }: TChoiceInputProps) => {
  const { t } = useTranslation(["Common"]);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const onClickOutside = (e: Event) => {
    if (!anchorRef.current?.contains(e.target as Node)) setIsOpen(false);
  };

  return (
    <div className={styles.multiChoice}>
      <div ref={anchorRef} className={styles.multiChoiceAnchor}>
        <button
          type="button"
          className={styles.addOptionButton}
          title={t("Common:SelectAction")}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          data-testid="metadata_multi_choice_button"
        >
          <PlusReactSvg />
        </button>

        <DropDown
          className={styles.choiceDropdown}
          open={isOpen}
          isDefaultMode={false}
          withBackdrop={false}
          eventTypes="click"
          clickOutsideAction={onClickOutside}
          dataTestId="metadata_multi_choice_dropdown"
        >
          {options.map((option) => (
            <DropDownItem
              key={option.id}
              className={styles.choiceOption}
              onClick={() => onChange(toggleOption(value, option.id))}
            >
              <Checkbox isChecked={value.includes(option.id)} />
              <Tag tag={option.value} label={option.value} />
            </DropDownItem>
          ))}
        </DropDown>
      </div>

      {getSelectedOptions(options, value).map((option) => (
        <Tag key={option.id} tag={option.value} label={option.value} />
      ))}
    </div>
  );
};

export default MultiChoiceInput;
