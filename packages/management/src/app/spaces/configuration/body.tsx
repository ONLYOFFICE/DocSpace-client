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
import toLower from "lodash/toLower";

import { DeviceType } from "@docspace/shared/enums";
import { Text } from "@docspace/ui-kit/components/text";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/ui-kit/components/text-input";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { parseDomain, validatePortalName } from "@docspace/shared/utils/common";
import {
  setDomainName,
  setPortalName,
  checkDomain,
} from "@docspace/shared/api/management";
import type { TDomainValidator } from "@docspace/shared/api/settings/types";

import useDeviceType from "@/hooks/useDeviceType";

import styles from "./configuration.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type CheckDomainResponse = {
  value: boolean;
};

export const Body = ({
  domainValidator,
}: {
  domainValidator: TDomainValidator;
}) => {
  const { t } = useTranslation(["Management", "Common"]);
  const { currentDeviceType } = useDeviceType();

  const [domain, setDomain] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [portalNameError, setPortalNameError] = useState<string | null>("");
  const [checkDomainError, setCheckDomainError] = useState<string>("");
  const [domainNameError, setDomainNameError] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const domainFieldLabel = (
    <>
      <Text fontSize="13px" fontWeight={600}>
        {t("Common:Domain")}
      </Text>
      <Text className={styles.domainDescription}>(example.com)</Text>
    </>
  );

  const onChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError("");
    if (domainNameError) setDomainNameError(null);
    setDomain(toLower(e.target.value));
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError("");
    if (portalNameError) setPortalNameError("");
    setName(toLower(e.target.value));
  };

  const onConnectClick = async () => {
    if (window?.DocSpaceConfig?.management?.checkDomain) {
      setIsLoading(true);
      const checkDomainResult = (await checkDomain(`${name}.${domain}`).finally(
        () => setIsLoading(false),
      )) as CheckDomainResponse;

      const isValidDomain = checkDomainResult.value;

      if (!isValidDomain) {
        return setCheckDomainError(t("DomainNotFound"));
      }
    }

    const isValidDomain = parseDomain(domain, setDomainNameError, t);
    const isValidPortalName = validatePortalName(
      name,
      domainValidator,
      setPortalNameError,
      t,
    );

    if (isValidDomain && isValidPortalName) {
      try {
        setIsLoading(true);
        await setDomainName(domain);
        try {
          const result = (await setPortalName(name)) as string;
          const url = new URL(result);
          url.searchParams.append("referenceUrl", "/management");
          window.location.replace(url);
        } catch (err) {
          console.error(err);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const domainErrorMessage = (
    domainNameError ? domainNameError[0] : ""
  ) as string;

  return (
    <div className={styles.body}>
      <FieldContainer
        isVertical
        labelText={domainFieldLabel}
        labelVisible
        hasError={!!(domainNameError || checkDomainError)}
        errorMessage={domainErrorMessage}
      >
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          placeholder={t("EnterDomainName")}
          value={domain}
          onChange={onChangeDomain}
          tabIndex={1}
          scale
        />
      </FieldContainer>
      <FieldContainer
        isVertical
        labelText={t("PortalName", { productName: getBrandName("ProductName") })}
        labelVisible
        hasError={!!(portalNameError || checkDomainError)}
        errorMessage={portalNameError || checkDomainError}
      >
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          placeholder={t("EnterSpaceName")}
          value={name}
          onChange={onChangeName}
          tabIndex={2}
          scale
        />
      </FieldContainer>
      <Button
        size={
          currentDeviceType === DeviceType.desktop
            ? ButtonSize.small
            : ButtonSize.normal
        }
        label={t("Common:Connect")}
        onClick={onConnectClick}
        primary
        tabIndex={3}
        isLoading={isLoading}
        // scale={false}
      />
    </div>
  );
};
