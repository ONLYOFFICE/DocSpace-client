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

import { Text } from "@docspace/ui-kit/components/text";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import styles from "../ClientForm.styled.module.scss";

interface SelectGroupProps {
  label: string;
  selectLabel: string;

  value: string;

  description: string;

  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;

  dataTestId?: string;
}

const SelectGroup = ({
  label,
  selectLabel,

  value,

  description,

  onSelect,
  dataTestId,
}: SelectGroupProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";

      inputRef.current.files = null;
    }
  };

  return (
    <div className={styles.styledInputGroup} data-testid={dataTestId}>
      <div className="label">
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          tag=""
          as="p"
          color=""
        >
          {label}{" "}
          <span style={{ color: globalColors.lightErrorStatus }}> *</span>
        </Text>
      </div>
      <div className="select">
        <img
          className="client-logo"
          style={{ display: value ? "block" : "none" }}
          alt="img"
          src={value}
        />
        <AddButton onClick={onClick} label={selectLabel} />
      </div>
      <Text
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        tag=""
        as="p"
        color=""
        className="description"
      >
        {description}
      </Text>
      <input
        ref={inputRef}
        id="customFileInput"
        className="custom-file-input"
        multiple
        type="file"
        onChange={onSelect}
        onClick={onInputClick}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/svg+xml"
      />
    </div>
  );
};

export default SelectGroup;
