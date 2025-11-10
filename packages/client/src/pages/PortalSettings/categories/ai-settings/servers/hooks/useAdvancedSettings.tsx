// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import equal from "fast-deep-equal/react";

import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { Link, LinkType } from "@docspace/shared/components/link";

import styles from "../styles/AddEditDialog.module.scss";

export const useAdvancedSettings = (initialValues?: Record<string, string>) => {
  const { t } = useTranslation(["Common", "AISettings", "SingleSignOn"]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(
    !!initialValues,
  );

  const [headerCounts, setHeaderCounts] = React.useState(
    initialValues ? Object.keys(initialValues).length : 1,
  );
  const [headerNames, setHeaderNames] = React.useState<Record<string, string>>(
    () => {
      if (!initialValues) return {};

      const names: Record<string, string> = {};
      Object.keys(initialValues).map((key, index) => (names[index] = key));
      return names;
    },
  );
  const [headerValues, setHeaderValues] = React.useState<
    Record<string, string>
  >(() => {
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
      headers[name] = headerValues[index];
    });

    return headers;
  };

  const headersComponent = (
    <>
      <div className={styles.advancedSettings}>
        <Text fontSize="16px" lineHeight="22px" fontWeight={700}>
          {t("SingleSignOn:AdvancedSettings")}
        </Text>
        <Link
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          type={LinkType.action}
          isHovered
        >
          {t(showAdvancedSettings ? "Common:Hide" : "SingleSignOn:Show")}
        </Link>
      </div>
      {showAdvancedSettings ? (
        <div>
          <div className={styles.headersContainer}>
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
                  />
                </FieldContainer>
              </React.Fragment>
            ))}
          </div>
          <SelectorAddButton
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
