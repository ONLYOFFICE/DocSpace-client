import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { UrlActionType } from "@docspace/common/constants";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

import GithubLight from "PUBLIC_DIR/images/github.light.react.svg";
import GithubDark from "PUBLIC_DIR/images/github.dark.react.svg";

import { StyledContainer } from "./StyledPluginSDK";

const LEARN_MORE_LINK = "https://api.onlyoffice.com/docspace/pluginssdk/";

const PluginSDK = ({
  systemPluginList,
  currentDeviceType,
  isLoading,
  isEmptyList,
  theme,
  openUrl,
}) => {
  const { t } = useTranslation(["WebPlugins", "VersionHistory", "Common"]);

  const isMobile = currentDeviceType === "mobile";

  const icon = !theme.isBase ? <GithubLight /> : <GithubDark />;

  const getPluginList = () => {
    if (isLoading) {
      return [
        <RectangleSkeleton
          key={"plugin-1"}
          width={"100%"}
          height={"164px"}
          borderRadius={"6px"}
        />,
        <RectangleSkeleton
          key={"plugin-2"}
          width={"100%"}
          height={"164px"}
          borderRadius={"6px"}
        />,
        <RectangleSkeleton
          key={"plugin-3"}
          width={"100%"}
          height={"164px"}
          borderRadius={"6px"}
        />,
      ];
    }

    const list = systemPluginList.map((p) => (
      <div key={p.name} className="plugin-list__item">
        <div className="plugin-list__item-info">
          <img className="plugin-logo" src={`${p.iconUrl}/assets/${p.image}`} />
          <div className="plugin-info-container">
            <Text>{p.name}</Text>
            <Text className={"description"}>
              {t("VersionHistory:Version")} {p.version}
            </Text>
          </div>
        </div>
        <Text className={"description-text"}>{p.description}</Text>
        <Button
          icon={icon}
          onClick={() => openUrl(p.homePage, UrlActionType.Link)}
          scale
          label={t("GoToRepo")}
          size={"small"}
        />
      </div>
    ));

    return list;
  };

  const list = getPluginList();

  console.log(list, isEmptyList);

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
        onClick={() => openUrl(LEARN_MORE_LINK, UrlActionType.Link)}
      ></Button>
      {!isEmptyList && list.length > 0 && (
        <>
          <Text fontSize={"16px"} fontWeight={700} lineHeight={"22px"}>
            {t("PluginSamples")}
          </Text>
          <div className="plugin-list">{list}</div>
        </>
      )}
    </StyledContainer>
  );
};

export default inject(({ pluginStore, auth }) => {
  const { currentDeviceType, theme, openUrl } = auth.settingsStore;
  const { systemPluginList, isLoading, isEmptyList } = pluginStore;

  return {
    currentDeviceType,
    systemPluginList,
    theme,
    isLoading,
    isEmptyList,
    openUrl,
  };
})(observer(PluginSDK));
