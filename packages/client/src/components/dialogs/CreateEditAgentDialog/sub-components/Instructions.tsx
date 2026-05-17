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

import { Text } from "@docspace/ui-kit/components/text";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

type InstructionsSettingsProps = {
	agentParams: TAgentParams;
	setAgentParams: (value: Partial<TAgentParams>) => void;
};

const InstructionsSettings = ({
	agentParams,
	setAgentParams,
}: InstructionsSettingsProps) => {
	const { t } = useTranslation(["AIRoom", "Common"]);
	const [value, setValue] = React.useState(agentParams.prompt || "");

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	React.useEffect(() => {
		if (agentParams.prompt === value) return;

		setAgentParams({
			prompt: value,
		});
	}, [value, agentParams.prompt, setAgentParams]);

	return (
		<StyledParam increaseGap>
			<div className=" set_room_params-info">
				<div>
					<Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
						{t("AIInstructions")}
					</Text>
					<Text
						fontSize="12px"
						lineHeight="16px"
						fontWeight={400}
						className="set_room_params-info-description"
						noSelect
					>
						{t("InstructionsDescriptionAgent", {
							aiAgent: t("Common:AIAgent"),
						})}
					</Text>
				</div>
				<Textarea
					value={value}
					onChange={handleChange}
					heightTextArea={144}
					placeholder={t("InstructionsDescriptionAgentExample")}
					tabIndex={2}
					dataTestId="create_agent_instructions_textarea"
				/>
			</div>
		</StyledParam>
	);
};

export default InstructionsSettings;
