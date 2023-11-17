import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { StyledContainer } from "./StyledPluginSDK";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

const PluginSDK = ({ systemPluginList, currentDeviceType }) => {
  const { t } = useTranslation(["WebPlugins", "Common"]);

  const isMobile = currentDeviceType === "mobile";

  const getPluginList = () => {
    const list = systemPluginList.map((p) => (
      <div className="plugin-list__item">
        <div className="plugin-list__item-info">
          <img className="plugin-logo" />
          <div className="plugin-info-container">
            <Text></Text>
            <Text></Text>
          </div>
        </div>
        <Text>123</Text>
        <Button />
      </div>
    ));

    return list;
  };

  const list = getPluginList();

  console.log(currentDeviceType);
  return (
    <StyledContainer>
      <Text fontSize={"16px"} fontWeight={700} lineHeight={"22px"}>
        {t("ExpandFunctionality")}
      </Text>
      <Text
        className={"description"}
        fontSize={"13px"}
        fontWeight={400}
        lineHeight={"20px"}
      >
        {t("PluginSDKDescription")}
      </Text>
      <Text
        className={"description"}
        fontSize={"13px"}
        fontWeight={400}
        lineHeight={"20px"}
      >
        {t("PluginSDKInstruction")}
      </Text>
      <Button
        className={"read-instructions-button"}
        label={t("Common:ReadInstructions")}
        primary
        scale={isMobile}
        size={isMobile ? "normal" : "small"}
      ></Button>
      <Text fontSize={"16px"} fontWeight={700} lineHeight={"22px"}>
        {t("PluginSamples")}
      </Text>
      <div className="plugin-list">{list}</div>
    </StyledContainer>
  );
};

export default inject(({ pluginStore, auth }) => {
  const { currentDeviceType } = auth.settingsStore;
  const { systemPluginList } = pluginStore;

  return { currentDeviceType, systemPluginList };
})(observer(PluginSDK));
