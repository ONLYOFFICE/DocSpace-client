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
import { useNavigate, useLocation } from "react-router";
import { useStores } from "@onlyoffice/ai-chat";

import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";
import {
  AiModels,
  ModelAssignment,
  McpServers,
  WebSearch,
  Knowledge,
} from "@docspace/ui-kit/ai-agent/settings";

const BASE_PATH = "/portal-settings/new-ai-settings";

const TAB_IDS = {
  AI_MODELS: "ai-models",
  MODEL_ASSIGNMENT: "model-assignment",
  MCP_SERVERS: "mcp-servers",
  WEB_SEARCH: "web-search",
  KNOWLEDGE: "knowledge",
} as const;

const detectTabFromPath = (pathname: string) => {
  if (pathname.includes("model-assignment")) return TAB_IDS.MODEL_ASSIGNMENT;
  if (pathname.includes("mcp-servers")) return TAB_IDS.MCP_SERVERS;
  if (pathname.includes("web-search")) return TAB_IDS.WEB_SEARCH;
  if (pathname.includes("knowledge")) return TAB_IDS.KNOWLEDGE;
  return TAB_IDS.AI_MODELS;
};

const NewAISettings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const hasProfiles = profiles.length > 0;

  const [currentTabId, setCurrentTabId] = React.useState(() =>
    detectTabFromPath(location.pathname),
  );

  React.useEffect(() => {
    setCurrentTabId(detectTabFromPath(location.pathname));
  }, [location.pathname]);

  // If the user lands on a non-AI-Models tab while profiles are empty
  // (e.g. last profile was deleted), bounce back to AI Models.
  React.useEffect(() => {
    if (!hasProfiles && currentTabId !== TAB_IDS.AI_MODELS) {
      navigate(`${BASE_PATH}/${TAB_IDS.AI_MODELS}`, { replace: true });
    }
  }, [hasProfiles, currentTabId, navigate]);

  const navigateToTab = (id: string) => {
    navigate(`${BASE_PATH}/${id}`);
  };

  const onSelect = (element: TTabItem) => {
    if (element.isDisabled) return;
    setCurrentTabId(element.id as (typeof TAB_IDS)[keyof typeof TAB_IDS]);
    navigate(`${BASE_PATH}/${element.id}`);
  };

  const makeOnClick = (id: string) => () => {
    if (!hasProfiles && id !== TAB_IDS.AI_MODELS) return;
    navigateToTab(id);
  };

  const disableNonAiModels = !hasProfiles;

  const data: TTabItem[] = [
    {
      id: TAB_IDS.AI_MODELS,
      name: "AI Models",
      content: <AiModels />,
      onClick: makeOnClick(TAB_IDS.AI_MODELS),
    },
    {
      id: TAB_IDS.MODEL_ASSIGNMENT,
      name: "Model Assignment",
      content: <ModelAssignment />,
      onClick: makeOnClick(TAB_IDS.MODEL_ASSIGNMENT),
      isDisabled: disableNonAiModels,
    },
    {
      id: TAB_IDS.MCP_SERVERS,
      name: "MCP Servers",
      content: <McpServers />,
      onClick: makeOnClick(TAB_IDS.MCP_SERVERS),
      isDisabled: disableNonAiModels,
    },
    {
      id: TAB_IDS.WEB_SEARCH,
      name: "Web Search",
      content: <WebSearch />,
      onClick: makeOnClick(TAB_IDS.WEB_SEARCH),
      isDisabled: disableNonAiModels,
    },
    {
      id: TAB_IDS.KNOWLEDGE,
      name: "Knowledge",
      content: <Knowledge />,
      onClick: makeOnClick(TAB_IDS.KNOWLEDGE),
      isDisabled: disableNonAiModels,
    },
  ];

  return (
    <div>
      <Tabs
        items={data}
        withAnimation
        selectedItemId={currentTabId}
        onSelect={onSelect}
      />
    </div>
  );
};

export default NewAISettings;

