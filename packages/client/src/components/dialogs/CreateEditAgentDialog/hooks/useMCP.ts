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

import React from "react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import {
	getMCPServerById,
	getServersListForRoom,
} from "@docspace/shared/api/ai";
import { getServerIconUrl } from "@docspace/shared/utils";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ServerType } from "@docspace/shared/api/ai/enums";
import { getBrandName } from "@docspace/shared/constants/brands";

export const useMCP = ({
	agentParams,
	setAgentParams,
	portalMcpServerId,
}: {
	agentParams: TAgentParams;
	setAgentParams: (value: Partial<TAgentParams>) => void;
	portalMcpServerId?: string;
}) => {
	const { isBase } = useTheme();
	const { t } = useTranslation(["Common"]);

	const [isMCPSelectorVisible, setIsMCPSelectorVisible] = React.useState(false);

	const [selectedServers, setSelectedServers] = React.useState<TSelectorItem[]>(
		[],
	);
	const [initialServers, setInitialServers] = React.useState<TSelectorItem[]>(
		[],
	);

	const onClickAction = () => {
		setIsMCPSelectorVisible(true);
	};

	const onClose = () => setIsMCPSelectorVisible(false);

	const onSubmit = (servers: TSelectorItem[]) => {
		if (servers.find((s) => s.id === portalMcpServerId)) {
			setAgentParams({ attachDefaultTools: true });
		}

		setSelectedServers(servers);
	};

	const agentId = agentParams.agentId;

	React.useEffect(() => {
		if (agentId) {
			getServersListForRoom(agentId).then((res) => {
				if (res) {
					const items = res.map((item) => {
						const name =
							item.serverType === ServerType.Portal
								? `${getBrandName("OrganizationName")} ${getBrandName("ProductName")}`
								: item.name;

						return {
							key: item.id,
							id: item.id,
							label: name,
							icon:
								(item.icon?.icon24 || getServerIconUrl(item.serverType, isBase)) ??
								"",
							isInputItem: false,
							onAcceptInput: () => {},
							onCancelInput: () => {},
							defaultInputValue: "",
							placeholder: "",
						};
					});

					setSelectedServers(items);
					setInitialServers(items);
				}
			});
		}
	}, [agentId, isBase, t]);

	React.useEffect(() => {
		setAgentParams({
			mcpServers: selectedServers
				.map((server) => server.id?.toString() || "")
				.filter((id) =>
					portalMcpServerId ? id !== portalMcpServerId && id !== "" : id !== "",
				),
			mcpServersInitial: initialServers
				.map((server) => server.id?.toString() || "")
				.filter((id) =>
					portalMcpServerId ? id !== portalMcpServerId && id !== "" : id !== "",
				),
		});
	}, [selectedServers, initialServers, portalMcpServerId, setAgentParams]);

	React.useEffect(() => {
		const initBaseMcpServers = async () => {
			if (!portalMcpServerId) return;

			const portalMcpServer = await getMCPServerById(portalMcpServerId);

			if (!portalMcpServer?.enabled) return;

			const name =
				portalMcpServer.serverType === ServerType.Portal
					? `${getBrandName("OrganizationName")} ${getBrandName("ProductName")}`
					: portalMcpServer.name;

			setSelectedServers([
				{
					key: portalMcpServer.id,
					id: portalMcpServer.id,
					label: name,
					icon:
						(portalMcpServer.icon?.icon24 ||
							getServerIconUrl(portalMcpServer.serverType, isBase)) ??
						"",
					isInputItem: false,
					onAcceptInput: () => {},
					onCancelInput: () => {},
					defaultInputValue: "",
					placeholder: "",
				},
			]);
		};

		if (portalMcpServerId) {
			initBaseMcpServers();
		}
	}, [portalMcpServerId, isBase, t]);

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
