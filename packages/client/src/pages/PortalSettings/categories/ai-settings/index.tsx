// (c) Copyright Ascensio System SIA 2009-2026
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

import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";

import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";

import { DeviceType } from "@docspace/shared/enums";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";

import { AIProvider, ProvidersLoader } from "./providers";
import { MCPServers, ServersLoader } from "./servers";
import { Search, SearchLoader } from "./search";
import { Knowledge, KnowledgeLoader } from "./knowledge";

import useAiSettings from "./useAiSettings";

import styles from "./AISettings.module.scss";

const detectCurrentTabId = (standalone: boolean) => {
  const path = window.location.pathname;

  if (!standalone) return "servers";

  if (path.includes("providers")) return "providers";

  if (path.includes("servers")) return "servers";

  if (path.includes("search")) return "search";

  if (path.includes("knowledge")) return "knowledge";

  return "";
};

const loaders: Record<string, React.ReactNode> = {
  providers: <ProvidersLoader />,
  servers: <ServersLoader />,
  search: <SearchLoader />,
  knowledge: <KnowledgeLoader />,
};

type TAiSettingsProps = {
  currentDeviceType?: DeviceType;
  standalone?: boolean;

  fetchKnowledge?: AISettingsStore["fetchKnowledge"];
  fetchAIProviders?: AISettingsStore["fetchAIProviders"];
  fetchMCPServers?: AISettingsStore["fetchMCPServers"];
  fetchWebSearch?: AISettingsStore["fetchWebSearch"];
  initDefaultProvider?: AISettingsStore["initDefaultProvider"];

  showPortalSettingsLoader?: ClientLoadingStore["showPortalSettingsLoader"];
};

// TODO: add standalone flag from store for hide ai providers
const AiSettings = ({
  currentDeviceType,
  standalone = true,
  fetchKnowledge,
  fetchAIProviders,
  fetchMCPServers,
  fetchWebSearch,
  initDefaultProvider,
  showPortalSettingsLoader,
}: TAiSettingsProps) => {
  const { t, ready } = useTranslation(["Common", "AISettings", "AIRoom"]);

  const { initAIProviders, initMCPServers, initWebSearch, initKnowledge } =
    useAiSettings({
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
      initDefaultProvider,
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
    const title =
      currentTabId === "providers"
        ? t("Common:AIProvider")
        : currentTabId === "search"
          ? t("Common:WebSearchAI")
          : currentTabId === "knowledge"
            ? t("AIRoom:Knowledge")
            : t("Common:MCPSettingTitle");
    setDocumentTitle(title);
  }, [t, currentTabId]);

  const serversData = [
    {
      id: "servers",
      name: t("Common:MCPSettingTitle"),
      content: <MCPServers standalone={standalone} />,
      onClick: initMCPServers,
    },
  ];

  const data = standalone
    ? [
        {
          id: "providers",
          name: t("Common:AIProvider"),
          content: <AIProvider />,
          onClick: initAIProviders,
        },
        ...serversData,
        {
          id: "search",
          name: t("Common:WebSearchAI"),
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

  if (showPortalSettingsLoader || !ready) {
    return (
      <>
        <RectangleSkeleton className={styles.tabsLoader} />
        {loaders[currentTabId]}
      </>
    );
  }

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
  ({ settingsStore, aiSettingsStore, clientLoadingStore }: TStore) => {
    const { currentDeviceType } = settingsStore;

    const {
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
      initDefaultProvider,
    } = aiSettingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      currentDeviceType,
      fetchAIProviders,
      fetchMCPServers,
      fetchWebSearch,
      fetchKnowledge,
      initDefaultProvider,
      showPortalSettingsLoader,
    };
  },
)(observer(AiSettings));
