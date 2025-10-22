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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TextWithTooltip as Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import GithubLight from "PUBLIC_DIR/images/github.light.react.svg";
import GithubDark from "PUBLIC_DIR/images/github.dark.react.svg";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import { StyledContainer } from "./StyledPluginSDK";

const PluginSDK = ({
  systemPluginList,
  currentDeviceType,
  isLoading,
  isEmptyList,
  theme,
  apiPluginSDKLink,
}) => {
  const { t, ready } = useTranslation([
    "WebPlugins",
    "VersionHistory",
    "Common",
  ]);

  React.useEffect(() => {
    if (ready) setDocumentTitle(t("WebPlugins:PluginSDK"));
  }, [ready]);

  const isMobile = currentDeviceType === "mobile";

  const icon = !theme.isBase ? <GithubLight /> : <GithubDark />;

  const getPluginList = () => {
    if (isLoading) {
      return [
        <RectangleSkeleton
          key="plugin-1"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
        <RectangleSkeleton
          key="plugin-2"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
        <RectangleSkeleton
          key="plugin-3"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
      ];
    }

    const list = systemPluginList.map((p) => (
      <div key={p.name} className="plugin-list__item">
        <div className="plugin-list__item-info">
          <img
            className="plugin-logo"
            src={`${p.iconUrl}/assets/${p.image}?hash=${p.version}`}
            alt="Plugin logo"
          />
          <div className="plugin-info-container">
            <Text>{p.name}</Text>
            <Text className="description">
              {t("VersionHistory:Version")} {p.version}
            </Text>
          </div>
        </div>
        <Text className="description-text" title={p.description}>
          {p.description}
        </Text>
        <Button
          icon={icon}
          onClick={() => window.open(p.homePage, "_blank")}
          scale
          label={t("GoToRepo")}
          size="small"
          testId={`${p.name}_go_to_repo_button`}
        />
      </div>
    ));

    return list;
  };

  const list = getPluginList();

  return (
    <StyledContainer>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("ExpandFunctionality")}
      </Text>
      <Text
        className="description"
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
      >
        {t("PluginSDKDescription", { productName: t("Common:ProductName") })}
      </Text>
      <Text
        className="description"
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
      >
        {t("PluginSDKInstruction")}
      </Text>
      <Button
        className="read-instructions-button"
        label={t("Common:ReadInstructions")}
        primary
        scale={isMobile}
        size={isMobile ? "normal" : "small"}
        onClick={() => window.open(apiPluginSDKLink, "_blank")}
        testId="read_instructions_button"
      />
      {!isEmptyList && list.length > 0 ? (
        <>
          <Text fontSize="16px" fontWeight={700} lineHeight="22px">
            {t("PluginSamples")}
          </Text>
          <div className="plugin-list">{list}</div>
        </>
      ) : null}
    </StyledContainer>
  );
};

export default inject(({ pluginStore, settingsStore }) => {
  const { currentDeviceType, theme, apiPluginSDKLink } = settingsStore;
  const { systemPluginList, isLoading, isEmptyList } = pluginStore;

  return {
    currentDeviceType,
    systemPluginList,
    theme,
    isLoading,
    isEmptyList,
    apiPluginSDKLink,
  };
})(observer(PluginSDK));
