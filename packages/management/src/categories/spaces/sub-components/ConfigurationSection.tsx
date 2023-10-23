import React from "react";
import { observer } from "mobx-react";
import Button from "@docspace/components/button";
import TextInput from "@docspace/components/text-input";
import Text from "@docspace/components/text";
import toastr from "@docspace/components/toast/toastr";
import { ConfigurationWrapper } from "../StyledSpaces";
import { useStore } from "SRC_DIR/store";
import { parseDomain } from "SRC_DIR/utils";

const ConfigurationSection = ({ t }) => {
  const [domain, setDomain] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [portalNameError, setPortalNameError] = React.useState<null | string>(null);
  const [domainNameError, setDomainNameError] = React.useState<null | Array<object>>(null);

  const { spacesStore, authStore } = useStore();

  const { checkDomain, setDomainName, setPortalName } = spacesStore;

  const onConfigurationPortal = async () => {
    if (window?.DocSpaceConfig?.management?.checkDomain) {
      setIsLoading(true);
      const res = await checkDomain(`${name}.${domain}`).finally(() => setIsLoading(false));
      const isValidDomain = res?.value;

      if (!isValidDomain) {
        const error = "Домен не найден, пожалуйста, проверьте А запись в настройках DNS"
        toastr.error(error); // TODO: add translation
        return setDomainNameError([{message: error}])
      }

        
    }

    const isValidDomain = parseDomain(domain, setDomainNameError);
    
    if (!isValidDomain) return;

    await setPortalName(name)
    .then(async () => await setDomainName(domain))
    .catch(err => {
      setPortalNameError(err?.response?.data?.error?.message);
    });
    await authStore.settingsStore.getAllPortals();
  };

  const onHandleDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (domainNameError)setDomainNameError(null);
    setDomain(e.target.value);
  }

  const onHandleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (portalNameError) setPortalNameError(null);
    setName(e.target.value);
  }


  return (
    <ConfigurationWrapper>
      <div className="spaces-configuration-header">
        <div className="spaces-configuration-title">
          <Text fontSize="16px" fontWeight={700}>
            {t("ConfigurationHeader")}
          </Text>
        </div>
        <Text>{t("ConfigurationDescription")}</Text>
      </div>
      <div className="spaces-input-wrapper">
        <div className="spaces-input-block">
          <div className="spaces-text-wrapper">
            <Text
              fontSize="13px"
              fontWeight="600"
              className="spaces-domain-text"
            >
              {t("Domain")}
            </Text>
            <Text color="#A3A9AE">(example.com)</Text>
          </div>

          <TextInput
            hasError={!!domainNameError}
            onChange={onHandleDomain}
            value={domain}
            placeholder={t("EnterDomain")}
            className="spaces-input"
          />
            <div>
              {domainNameError && domainNameError.map((err, index) => (
                <Text key={index} fontSize="12px" fontWeight="400" color="#F24724">{err.message}</Text>
              ))}
            </div>
        </div>
        <div className="spaces-input-block">
          <Text fontSize="13px" fontWeight="600">
            {t("DocSpaceName")}
          </Text>
          <TextInput
            hasError={!!portalNameError}
            onChange={onHandleName}
            value={name}
            placeholder={t("Common:EnterName")}
            className="spaces-input"
          />
            <div>
              <Text fontSize="12px" fontWeight="400" color="#F24724">{portalNameError}</Text>
            </div>
        </div>
      </div>

      <Button
        isLoading={isLoading}
        size="normal"
        className="spaces-button"
        label={t("Common:Connect")}
        onClick={onConfigurationPortal}
        primary={true}
      />
    </ConfigurationWrapper>
  );
};

export default observer(ConfigurationSection);
