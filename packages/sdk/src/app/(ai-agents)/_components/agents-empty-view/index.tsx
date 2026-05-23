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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  EmptyView,
  type EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";

import EmptyAIAgentsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import EmptyAIAgentsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import CreateAIAgentIcon from "PUBLIC_DIR/images/emptyview/create.ai-agent.svg";

import {
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useAgentDialogsStore,
} from "../../_store";

// Port of client EmptyViewContainer for the AI Agents root folder. Renders
// the same <EmptyView> primitive with the same i18n keys + the same SVG
// icons; logic mirrors getRootTitle/getRootDescription/getRootIcon and the
// helpers from EmptyViewContainer.utils / EmptyViewContainer.helpers.

const AgentsEmptyView = () => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  // Defer theme-dependent rendering until the client has mounted. The server
  // doesn't know the theme (it's negotiated client-side via THEME_HEADER), so
  // a direct `isBase ? Light : Dark` swap mismatches hydration when the
  // resolved theme isn't the default. Mount-gating forces the SSR + first
  // client render to share one branch (light), then upgrades on next render.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const useLightIcon = !mounted || isBase;

  const userStore = useAgentsUserStore();
  const aiConfigStore = useAgentsAIConfigStore();
  const dialogsStore = useAgentDialogsStore();

  const user = userStore.user;
  const isVisitor = user?.isVisitor ?? false;
  const isAdminOrOwner = !!(user?.isAdmin || user?.isOwner);
  const aiReady = aiConfigStore.aiReady;
  // SDK is embedded and always behaves as standalone w.r.t. AI configuration.
  const standalone = true;

  const title = aiReady
    ? isVisitor
      ? t("Common:EmptyAIAgentsUserTitle", {
          aiAgents: t("Common:AIAgents", { defaultValue: "AI Agents" }),
          defaultValue: "No {{aiAgents}} yet",
        })
      : t("Common:EmptyAIAgentsTitle", {
          aiAgent: t("Common:AIAgent", { defaultValue: "AI Agent" }),
          defaultValue: "Create your first {{aiAgent}}",
        })
    : standalone && isAdminOrOwner
      ? t("Common:EmptyAIAgentsAIDisabledStandaloneAdminTitle", {
          aiProvider: t("Common:AIProvider", {
            defaultValue: "AI Provider",
          }),
          defaultValue: "Configure {{aiProvider}} to start",
        })
      : isAdminOrOwner
        ? t("Common:EmptyAIAgentsAIDisabledSaasAdminTitle", {
            defaultValue: "AI agents are unavailable",
          })
        : t("Common:EmptyAIAgentsAIDisabledUserTitle", {
            aiAgents: t("Common:AIAgents", { defaultValue: "AI Agents" }),
            defaultValue: "{{aiAgents}} are unavailable",
          });

  const description = aiReady
    ? isVisitor
      ? t("Common:EmptyAIAgentsAIEnabledUserDescription", {
          aiAgents: t("Common:AIAgents", { defaultValue: "AI Agents" }),
          defaultValue:
            "{{aiAgents}} will appear here once an admin creates them.",
        })
      : t("Common:EmptyAIAgentsDescription", {
          mcpServer: t("Common:MCPServer", { defaultValue: "MCP server" }),
          defaultValue:
            "Set up an agent with model, instructions and an {{mcpServer}} to get started.",
        })
    : standalone && isAdminOrOwner
      ? t("Common:EmptyAIAgentsAIDisabledStandaloneAdminDescription", {
          productName: getBrandName("ProductName"),
          aiChats: t("Common:AIChats", { defaultValue: "AI Chats" }),
          defaultValue:
            "Configure an AI provider in {{productName}} settings to unlock {{aiChats}}.",
        })
      : isAdminOrOwner
        ? t("Common:EmptyAIAgentsAIDisabledSaasAdminDescription", {
            productName: getBrandName("ProductName"),
            aiAgents: t("Common:AIAgents", { defaultValue: "AI Agents" }),
            defaultValue:
              "{{aiAgents}} are not yet enabled in this {{productName}} portal.",
          })
        : t("Common:EmptyAIAgentsAIDisabledDescription", {
            productName: getBrandName("ProductName"),
            aiAgents: t("Common:AIAgents", { defaultValue: "AI Agents" }),
            defaultValue:
              "Ask your portal admin to enable {{aiAgents}} in {{productName}}.",
          });

  const icon = useLightIcon ? (
    <EmptyAIAgentsLightIcon />
  ) : (
    <EmptyAIAgentsDarkIcon />
  );

  // Actions: AI-enabled + admin → [createAIAgent]. AI-disabled + admin path
  // (goToAIProviderSettings) is not surfaced in the SDK because the SDK
  // doesn't own portal settings UI.
  const options: EmptyViewOptionsType | null =
    aiReady && isAdminOrOwner && !isVisitor
      ? [
          {
            key: "create-ai-agent",
            title: t("Common:CreateNewAIAgent", {
              defaultValue: "Create a new AI agent",
            }),
            description: t("Common:CreateAIAgentDescription", {
              aiAgent: t("Common:AIAgent", { defaultValue: "AI Agent" }),
              defaultValue: "Set up a new {{aiAgent}} from scratch.",
            }),
            icon: <CreateAIAgentIcon />,
            onClick: () => dialogsStore.setCreateAgentDialogVisible(true),
            disabled: false,
          },
        ]
      : null;

  return (
    <EmptyView
      icon={icon}
      title={title}
      description={description}
      options={options}
    />
  );
};

export default observer(AgentsEmptyView);
