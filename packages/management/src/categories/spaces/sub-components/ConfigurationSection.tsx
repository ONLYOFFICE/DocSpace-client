import React from "react";
import { observer } from "mobx-react";
import { Button } from "@docspace/shared/components";
import { TextInput } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";
import { ConfigurationWrapper } from "../StyledSpaces";
import { useStore } from "SRC_DIR/store";
import { parseDomain, validatePortalName } from "SRC_DIR/utils";
import { isMobile } from "react-device-detect";
import { toastr } from "@docspace/shared/components";

import { TranslationType } from "SRC_DIR/types/spaces";

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

  const { spacesStore, authStore } = useStore();
  const {
    checkDomain,
    setDomainName,
    setPortalName,
    setReferenceLink,
    setSpaceCreatedDialogVisible,
  } = spacesStore;

  const onConfigurationPortal = async () => {
    if (window?.DocSpaceConfig?.management?.checkDomain) {
      setIsLoading(true);
      const checkDomainResult = await checkDomain(`${name}.${domain}`).finally(
        () => setIsLoading(false)
      );
      const isValidDomain = checkDomainResult?.value;

      if (!isValidDomain) {
        return setCheckDomainError(t("DomainNotFound"));
      }
    }

    const nameValidator = authStore.settingsStore.domainValidator;

    const isValidDomain = parseDomain(domain, setDomainNameError, t);
    const isValidPortalName = validatePortalName(
      name,
      nameValidator,
      setPortalNameError,
      t
    );

    if (isValidDomain && isValidPortalName) {
      try {
        await setDomainName(domain);
        await setPortalName(name).then((result) => {
          setReferenceLink(result);
          setSpaceCreatedDialogVisible(true);
        });
        await authStore.settingsStore.getAllPortals();
      } catch (err) {
        toastr.error(err);
      }
    }
  };

  const onHandleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError(null);
    if (domainNameError) setDomainNameError(null);
    setDomain(e.target.value);
  };

  const onHandleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checkDomainError) setCheckDomainError(null);
    if (portalNameError) setPortalNameError(null);
    setName(e.target.value);
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
          {t("ConfigurationDescription")}
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
              {t("Domain")}
            </Text>
            <Text color="#A3A9AE">(example.com)</Text>
          </div>

          <TextInput
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
                  key={index}
                  fontSize="12px"
                  fontWeight="400"
                  color="#F24724"
                >
                  {err}
                </Text>
              ))}
          </div>
        </div>
        <div className="spaces-input-block">
          <Text fontSize="13px" fontWeight="600">
            {t("DocSpaceName")}
          </Text>
          <TextInput
            hasError={!!(portalNameError || checkDomainError)}
            onChange={onHandleName}
            value={name}
            placeholder={t("Common:EnterName")}
            className="spaces-input"
            tabIndex={2}
          />
          <div>
            <Text fontSize="12px" fontWeight="400" color="#F24724">
              {portalNameError || checkDomainError}
            </Text>
          </div>
        </div>
      </div>

      <Button
        isLoading={isLoading}
        size={isMobile ? "normal" : "small"}
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
