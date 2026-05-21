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
import { inject, observer } from "mobx-react";

import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import StyledInputWrapper from "../styled-containers/StyledInputWrapper";

const SsoComboBox = (props) => {
  const {
    labelText,
    name,
    options,
    tabIndex,
    value,
    setComboBox,
    enableSso,
    isLoadingXml,
    isDisabled,
    dataTestId,
  } = props;

  const currentOption =
    options.find((option) => option.key === value) || options[0];

  const onSelect = (option) => {
    setComboBox(option, name);
  };

  return (
    <FieldContainer isVertical labelVisible labelText={labelText}>
      <StyledInputWrapper>
        <ComboBox
          id={name}
          isDisabled={!enableSso || isLoadingXml || isDisabled}
          onSelect={onSelect}
          options={options}
          scaled
          scaledOptions
          selectedOption={currentOption}
          showDisabledItems
          tabIndex={tabIndex}
          size="content"
          dropDownMaxHeight={364}
          manualWidth="100%"
          directionY="both"
          textOverflow
          dataTestId={dataTestId}
          dropDownTestId={dataTestId ? `${dataTestId}_dropdown` : undefined}
        />
      </StyledInputWrapper>
    </FieldContainer>
  );
};

export default inject(({ ssoStore }) => {
  const { setComboBox, enableSso, isLoadingXml } = ssoStore;

  return {
    setComboBox,
    enableSso,
    isLoadingXml,
  };
})(observer(SsoComboBox));
