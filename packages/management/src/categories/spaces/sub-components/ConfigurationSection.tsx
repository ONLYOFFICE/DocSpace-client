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

import React from "react";
import { observer } from "mobx-react";
import toLower from "lodash/toLower";
import { isMobile } from "react-device-detect";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  TextInput,
  InputSize,
  InputType,
} from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { parseDomain, validatePortalName } from "@docspace/shared/utils/common";

import { TranslationType } from "SRC_DIR/types/spaces";
import { useStore } from "SRC_DIR/store";
import { ConfigurationWrapper } from "../StyledSpaces";

type TConfigurationSection = {
  t: TranslationType;
};

const ConfigurationSection = ({ t }: TConfigurationSection): JSX.Element => {
  const [domain, setDomain] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [portalNameError, setPortalNameError] = React.useState<null | string>(
    null
  );
  const [checkDomainError, setCheckDomainError] = React.useState<null | string>(
    null
  );
  const [domainNameError, setDomainNameError] =
    React.useState<null | Array<object>>(null);

  const { spacesStore, settingsStore } = useStore();
  const { checkDomain, setDomainName, setPortalName } = spacesStore;

  const onConfigurationPortal = async () => {
    if (window?.ClientConfig?.management?.checkDomain) {
      setIsLoading(true);
      const checkDomainResult = await checkDomain(`${name}.${domain}`).finally(
        () => setIsLoading(false)
      );
      const isValidDomain = checkDomainResult?.value;

      if (!isValidDomain) {
        return setCheckDomainError(t("DomainNotFound"));
      }
    }

    const nameValidator = settingsStore.domainValidator;

    const isValidDomain = parseDomain(domain, setDomainNameError, t);
    const isValidPortalName = validatePortalName(
      name,
      nameValidator,
      setPortalNameError,
      t
    );

    if (isValidDomain && isValidPortalName) {
      try {
        setIsLoading(true);
        await setDomainName(domain);
        await setPortalName(name).then((result) => {
          let url = new URL(result);
          url.searchParams.append("referenceUrl", "/management");
          return window.location.replace(url);
        });
      } catch (err) {
        toastr.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onHandleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError(null);
    if (domainNameError) setDomainNameError(null);
    setDomain(toLower(e.target.value));
  };

  const onHandleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError(null);
    if (portalNameError) setPortalNameError(null);
    setName(toLower(e.target.value));
  };

  return (
    <ConfigurationWrapper>
      <div className="spaces-configuration-header">
        <div className="spaces-configuration-title">
          <Text fontSize="16px" fontWeight={700}>
            {t("ConfigurationHeader")}
          </Text>
        </div>
        <Text fontSize="12px" lineHeight="16px" fontWeight={400}>
          {t("ConfigurationDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      </div>
      <div className="spaces-input-wrapper">
        <div className="spaces-input-block">
          <div className="spaces-text-wrapper">
            <Text
              fontSize="13px"
              fontWeight={600}
              className="spaces-domain-text"
            >
              {t("Common:Domain")}
            </Text>
            <Text className="spaces-input-subheader">(example.com)</Text>
          </div>

          <TextInput
            type={InputType.text}
            size={InputSize.base}
            hasError={!!(domainNameError || checkDomainError)}
            onChange={onHandleDomain}
            value={domain}
            placeholder={t("EnterDomain")}
            className="spaces-input"
            tabIndex={1}
          />
          <div style={{ marginTop: "5px" }}>
            {domainNameError &&
              domainNameError.map((err, index) => (
                <Text
                  className="error-text"
                  key={index}
                  fontSize="12px"
                  fontWeight="400"
                >
                  {err}
                </Text>
              ))}
          </div>
        </div>
        <div className="spaces-input-block">
          <Text fontSize="13px" fontWeight="600">
            {t("PortalName", { productName: t("Common:ProductName") })}
          </Text>
          <TextInput
            type={InputType.text}
            size={InputSize.base}
            hasError={!!(portalNameError || checkDomainError)}
            onChange={onHandleName}
            value={name}
            placeholder={t("Common:EnterName")}
            className="spaces-input"
            tabIndex={2}
          />
          <div>
            <Text className="error-text" fontSize="12px" fontWeight="400">
              {portalNameError || checkDomainError}
            </Text>
          </div>
        </div>
      </div>

      <Button
        isLoading={isLoading}
        size={isMobile ? ButtonSize.normal : ButtonSize.small}
        className="spaces-button"
        label={t("Common:Connect")}
        onClick={onConfigurationPortal}
        primary={true}
        style={{ marginTop: "2px" }}
        tabIndex={3}
      />
    </ConfigurationWrapper>
  );
};

export default observer(ConfigurationSection);
