// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toLower from "lodash/toLower";

import { DeviceType } from "@docspace/shared/enums";
import { Text } from "@docspace/shared/components/text";
import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/shared/components/text-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { parseDomain, validatePortalName } from "@docspace/shared/utils/common";
import {
  setDomainName,
  setPortalName,
  checkDomain,
} from "@docspace/shared/api/management";
import type { TDomainValidator } from "@docspace/shared/api/settings/types";

import useDeviceType from "@/hooks/useDeviceType";

import { StyledBody } from "./configuration.styled";

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
      <Text className="domain-description">(example.com)</Text>
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
    <StyledBody>
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
          placeholder={t("EnterDomain")}
          value={domain}
          onChange={onChangeDomain}
          tabIndex={1}
          scale
        />
      </FieldContainer>
      <FieldContainer
        isVertical
        labelText={t("PortalName", { productName: t("Common:ProductName") })}
        labelVisible
        hasError={!!(portalNameError || checkDomainError)}
        errorMessage={portalNameError || checkDomainError}
      >
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          placeholder={t("EnterName")}
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
    </StyledBody>
  );
};
