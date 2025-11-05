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
import { useNavigate } from "react-router";

import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";

import { Tabs, TTabItem } from "@docspace/shared/components/tabs";

import { DeviceType } from "@docspace/shared/enums";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import { AIProvider } from "./providers";
import { MCPServers } from "./servers";
import { Search } from "./search";
import { Knowledge } from "./knowledge";

import useAiSettings from "./useAiSettings";

const detectCurrentTabId = (standalone: boolean) => {
  const path = window.location.pathname;

  if (!standalone) return "servers";

  if (path.includes("providers")) return "providers";

  if (path.includes("servers")) return "servers";

  if (path.includes("search")) return "search";

  if (path.includes("knowledge")) return "knowledge";

  return "";
};

type TAiSettingsProps = {
  currentDeviceType?: DeviceType;
  standalone?: boolean;

  fetchKnowledge?: AISettingsStore["fetchKnowledge"];
  fetchAIProviders?: AISettingsStore["fetchAIProviders"];
  fetchMCPServers?: AISettingsStore["fetchMCPServers"];
  fetchWebSearch?: AISettingsStore["fetchWebSearch"];
};

// TODO: add standalone flag from store for hide ai providers
const AiSettings = ({
  currentDeviceType,
  standalone = true,
  fetchKnowledge,
  fetchAIProviders,
  fetchMCPServers,
  fetchWebSearch,
}: TAiSettingsProps) => {
  const { t } = useTranslation(["Common", "AISettings", "AIRoom"]);

  const { initAIProviders, initMCPServers, initWebSearch, initKnowledge } =
    useAiSettings({
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
      standalone,
    });

  const navigate = useNavigate();

  const [currentTabId, setCurrentTabId] = React.useState(
    detectCurrentTabId(standalone),
  );

  const onSelect = (element: TTabItem) => {
    setCurrentTabId(element.id);
    navigate(`/portal-settings/ai-settings/${element.id}`);
  };

  React.useEffect(() => {
    const currentTab = detectCurrentTabId(standalone);

    setCurrentTabId(currentTab);
  }, [standalone]);

  React.useEffect(() => {
    const titleKey =
      currentTabId === "providers"
        ? "AISettings:AIProvider"
        : currentTabId === "search"
          ? "AISettings:Search"
          : currentTabId === "knowledge"
            ? "AIRoom:Knowledge"
            : "AISettings:MCPSettingTitle";
    setDocumentTitle(t(titleKey));
  }, [t, currentTabId]);

  const serversData = [
    {
      id: "servers",
      name: t("AISettings:MCPSettingTitle"),
      content: <MCPServers standalone={standalone} />,
      onClick: initMCPServers,
    },
  ];

  const data = standalone
    ? [
        {
          id: "providers",
          name: t("AISettings:AIProvider"),
          content: <AIProvider />,
          onClick: initAIProviders,
        },
        ...serversData,
        {
          id: "search",
          name: t("AISettings:Search"),
          content: <Search />,
          onClick: initWebSearch,
        },
        {
          id: "knowledge",
          name: t("AIRoom:Knowledge"),
          content: <Knowledge />,
          onClick: initKnowledge,
        },
      ]
    : serversData;

  return (
    <Tabs
      items={data}
      withAnimation
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType!]}
    />
  );
};

export const Component = inject(
  ({ settingsStore, aiSettingsStore }: TStore) => {
    const { currentDeviceType } = settingsStore;

    const {
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
    } = aiSettingsStore;

    return {
      currentDeviceType,
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
    };
  },
)(observer(AiSettings));
