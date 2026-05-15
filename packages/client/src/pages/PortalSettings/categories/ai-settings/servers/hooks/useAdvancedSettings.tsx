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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import equal from "fast-deep-equal/react";

import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import addEditStyles from "../styles/AddEditDialog.module.scss";
import baseParamsStyles from "./useBaseParams.module.scss";

export const useAdvancedSettings = (
  initialValues?: Record<string, string>,
  needReset?: boolean,
) => {
  const { t } = useTranslation(["Common", "AISettings", "SingleSignOn"]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(
    !!initialValues || needReset,
  );

  const [headerCounts, setHeaderCounts] = React.useState(
    initialValues ? Object.keys(initialValues).length : 1,
  );
  const [headerNames, setHeaderNames] = React.useState<Record<string, string>>(
    () => {
      if (needReset) return { "": "" };

      if (!initialValues) return {};

      const names: Record<string, string> = {};
      Object.keys(initialValues).map((key, index) => (names[index] = key));
      return names;
    },
  );
  const [headerValues, setHeaderValues] = React.useState<
    Record<string, string>
  >(() => {
    if (needReset) return { "": "" };
    if (!initialValues) return {};

    const values: Record<string, string> = {};
    Object.values(initialValues).map((value, index) => (values[index] = value));
    return values;
  });

  const initFormData = React.useRef({
    headerNames,
    headerValues,
  });

  const hasChanges = !equal(initFormData.current, {
    headerNames,
    headerValues,
  });

  const onChangeHeaderName = (index: number, value: string) => {
    setHeaderNames((val) => ({ ...val, [index]: value }));
  };

  const onChangeHeaderValue = (index: number, value: string) => {
    setHeaderValues((val) => ({ ...val, [index]: value }));
  };

  const onAddNewHeader = () => {
    setHeaderCounts((val) => val + 1);
  };

  const getAPIHeaders = () => {
    const headers: Record<string, string> = {};

    Object.entries(headerNames).forEach(([index, name]) => {
      if (!name) return;
      headers[name] = headerValues[index];
    });

    return headers;
  };

  const headersComponent = (
    <>
      <div>
        <div className={addEditStyles.advancedSettings}>
          <Text fontSize="16px" lineHeight="22px" fontWeight={700}>
            {t("SingleSignOn:AdvancedSettings")}
          </Text>
          <Link
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            type={LinkType.action}
            isHovered
            data-testid="mcp-headers-block-toggle"
          >
            {showAdvancedSettings
              ? t("SingleSignOn:Hide")
              : t("SingleSignOn:Show")}
          </Link>
        </div>
        {showAdvancedSettings ? (
          <Text className={baseParamsStyles.fieldHint}>
            {t("AISettings:MCPServerAdvancedSettingsHint")}
          </Text>
        ) : null}
      </div>
      {showAdvancedSettings ? (
        <div>
          <div className={addEditStyles.headersContainer}>
            {Array.from({ length: headerCounts }).map((_, index) => (
              <React.Fragment key={`header-${index * 2}`}>
                <FieldContainer
                  labelText={t("AISettings:HeaderName")}
                  isVertical
                  removeMargin
                  labelVisible
                >
                  <TextInput
                    type={InputType.text}
                    size={InputSize.base}
                    value={headerNames[index]}
                    onChange={(e) => onChangeHeaderName(index, e.target.value)}
                    placeholder={t("AISettings:EnterLabel")}
                    scale
                    hasError={needReset && !headerNames[index] && index === 0}
                    testId="mcp-header-name-input"
                  />
                </FieldContainer>
                <FieldContainer
                  labelText={t("AISettings:HeaderValue")}
                  isVertical
                  removeMargin
                  labelVisible
                >
                  <TextInput
                    type={InputType.text}
                    size={InputSize.base}
                    value={headerValues[index]}
                    onChange={(e) => onChangeHeaderValue(index, e.target.value)}
                    placeholder={t("AISettings:EnterValue")}
                    scale
                    hasError={needReset && !headerValues[index] && index === 0}
                    testId="mcp-header-value-input"
                  />
                </FieldContainer>
              </React.Fragment>
            ))}
          </div>
          <AddButton
            label={t("AISettings:AddMoreHeaders")}
            onClick={onAddNewHeader}
          />
        </div>
      ) : null}
    </>
  );

  return {
    headerCounts,
    headerNames,
    headerValues,
    headersComponent,
    onChangeHeaderName,
    onChangeHeaderValue,
    onAddNewHeader,
    getAPIHeaders,
    advancedSettingsChanged: hasChanges,
  };
};
