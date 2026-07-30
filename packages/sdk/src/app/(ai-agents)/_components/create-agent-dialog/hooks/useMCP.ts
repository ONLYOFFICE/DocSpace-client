/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { toastr } from "@docspace/ui-kit/components/toast";

import {
  getEntityMcpServers,
  getSystemMcpServerNames,
} from "@docspace/shared/api/ai";
import { getServerIconUrl } from "@docspace/shared/utils";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ServerType } from "@docspace/shared/api/ai/enums";
import { getBrandName } from "@docspace/shared/constants/brands";

export const useMCP = ({
  agentParams,
  setAgentParams,
}: {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
}) => {
  const { isBase } = useTheme();
  const { t } = useTranslation(["Common"]);

  const [isMCPSelectorVisible, setIsMCPSelectorVisible] =
    React.useState(false);

  const [selectedServers, setSelectedServers] = React.useState<
    TSelectorItem[]
  >([]);
  const [initialServers, setInitialServers] = React.useState<TSelectorItem[]>(
    [],
  );

  const onClickAction = () => {
    setIsMCPSelectorVisible(true);
  };

  const onClose = () => setIsMCPSelectorVisible(false);

  const onSubmit = (servers: TSelectorItem[]) => {
    setSelectedServers(servers);
  };

  const agentId = agentParams.agentId;

  // Servers are keyed by name in the chat-lib model. System servers (from the
  // service config) get the portal branding; everything else is a portal
  // custom server copied into the agent scope.
  const toSelectorItem = React.useCallback(
    (name: string, systemNames: readonly string[]): TSelectorItem => {
      const isSystem = systemNames.includes(name);
      return {
        key: name,
        id: name,
        label: isSystem
          ? `${getBrandName("OrganizationName")} ${getBrandName("ProductName")}`
          : name,
        icon:
          getServerIconUrl(
            isSystem ? ServerType.Portal : ServerType.Custom,
            isBase,
          ) ?? "",
        isInputItem: false,
        onAcceptInput: () => {},
        onCancelInput: () => {},
        defaultInputValue: "",
        placeholder: "",
      };
    },
    [isBase],
  );

  React.useEffect(() => {
    if (agentId) {
      // Edit: the agent's enabled servers are its per-entity map.
      Promise.all([
        getEntityMcpServers(String(agentId)),
        getSystemMcpServerNames(),
      ])
        .then(([serversMap, systemNames]) => {
          const items = Object.keys(serversMap).map((name) =>
            toSelectorItem(name, systemNames),
          );

          setSelectedServers(items);
          setInitialServers(items);
        })
        .catch((err) =>
          toastr.error(err instanceof Error ? err.message : String(err)),
        );
    } else {
      // Create: pre-select the system (portal) servers by default.
      getSystemMcpServerNames()
        .then((systemNames) => {
          setSelectedServers(
            systemNames.map((name) => toSelectorItem(name, systemNames)),
          );
        })
        .catch((err) =>
          toastr.error(err instanceof Error ? err.message : String(err)),
        );
    }
  }, [agentId, toSelectorItem, t]);

  React.useEffect(() => {
    // The whole selection is stored by name — system servers included:
    // enabling one for an agent is a per-entity map entry like any other.
    setAgentParams({
      mcpServers: selectedServers
        .map((server) => server.id?.toString() || "")
        .filter((name) => name !== ""),
      mcpServersInitial: initialServers
        .map((server) => server.id?.toString() || "")
        .filter((name) => name !== ""),
    });
  }, [selectedServers, initialServers, setAgentParams]);

  const initSelectedServers = React.useMemo(() => {
    return selectedServers.map((i) => i.id?.toString() || "");
  }, [selectedServers]);

  return {
    isMCPSelectorVisible,
    setIsMCPSelectorVisible,
    selectedServers,
    setSelectedServers,
    initialServers,
    setInitialServers,
    onClickAction,
    onClose,
    onSubmit,
    initSelectedServers,
  };
};
