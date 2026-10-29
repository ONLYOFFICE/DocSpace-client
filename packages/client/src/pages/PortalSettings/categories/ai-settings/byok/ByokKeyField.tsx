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

import type React from "react";
import { useTranslation } from "react-i18next";

import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { Link, LinkTarget, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { PasswordInput } from "@onlyoffice/apps-ui-kit/components/password-input";

import { getByokProviderMeta } from "./providers";
import styles from "./Byok.module.scss";

type ByokKeyFieldProps = {
  providerId: string;
  value: string;
  error: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
};

const ByokKeyField = ({
  providerId,
  value,
  error,
  isDisabled,
  onChange,
}: ByokKeyFieldProps) => {
  const { t } = useTranslation(["Common"]);

  const keyUrl = providerId ? getByokProviderMeta(providerId)?.keyUrl : "";

  const onKeyChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    key = "",
  ) => onChange(key);

  return (
    <FieldContainer
      labelVisible
      isVertical
      labelText={t("Common:APIKey")}
      removeMargin
      hasError={!!error}
      errorMessage={error}
      errorMessageWidth="100%"
    >
      <div className={styles.keyField}>
        {keyUrl ? (
          <Link
            className={styles.keyLink}
            type={LinkType.page}
            target={LinkTarget.blank}
            href={keyUrl}
            fontSize="13px"
            fontWeight={600}
            isHovered
            dataTestId="byok-get-key-link"
          >
            {t("Common:GetAPIKey")}
          </Link>
        ) : null}
        <PasswordInput
          placeholder={t("Common:EnterKey")}
          inputName="byok_key"
          inputValue={value}
          onChange={onKeyChange}
          hasError={!!error}
          isDisabled={isDisabled}
          scale
          isSimulateType
          isFullWidth
          isDisableTooltip
          autoComplete="off"
          testId="byok-key-input"
        />
      </div>
    </FieldContainer>
  );
};

export default ByokKeyField;
