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

import { useState } from "react";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Text } from "@docspace/ui-kit/components/text";
import { Tabs, TabsTypes } from "@docspace/ui-kit/components/tabs";
import CodeBlock from "./CodeBlock";

import { CategorySubHeader, CodeWrapper } from "../presets/StyledPresets";
import { getBrandName } from "@docspace/shared/constants/brands";

export const CodeToInsert = ({
	t,
	tReady,
	codeBlock,
	config,
	theme,
	scriptUrl,
}) => {
	const html = (
		<CodeWrapper height="fit-content">
			<CategorySubHeader className="copy-window-code">
				{`HTML ${t("CodeTitle")}`}
			</CategorySubHeader>
			<Text lineHeight="20px" className="preview-description">
				{t("HtmlCodeDescription", { productName: getBrandName("ProductName") })}
			</Text>
			<Textarea value={codeBlock} heightTextArea={153} isReadOnly enableCopy />
		</CodeWrapper>
	);
	const js = (
		<CodeWrapper height="fit-content">
			<CategorySubHeader className="copy-window-code">
				{`JavaScript ${t("CodeTitle")}`}
			</CategorySubHeader>
			<Text lineHeight="20px" className="preview-description">
				{t("JavaScriptCodeDescription", {
					productName: getBrandName("ProductName"),
				})}
			</Text>
			<CodeBlock config={config} scriptUrl={scriptUrl} theme={theme} />
		</CodeWrapper>
	);

	const npm = (
		<CodeWrapper height="fit-content">
			<CategorySubHeader className="copy-window-code">NPM</CategorySubHeader>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeDescription")}
			</Text>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeInstallStep")}
			</Text>
			<Textarea
				value="npm install --save @onlyoffice/docspace-sdk-js"
				heightTextArea={32}
				isReadOnly
				enableCopy
			/>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeImportStep")}
			</Text>
			<Textarea
				value="import SDK from '@onlyoffice/docspace-sdk-js';"
				heightTextArea={32}
				isReadOnly
				enableCopy
			/>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeConfigStep")}
			</Text>
			<Textarea
				value={JSON.stringify({ ...config, events: undefined })}
				heightTextArea={118}
				isReadOnly
				enableCopy
				isJSONField
			/>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeCreateStep")}
			</Text>
			<Textarea
				value={`const container = document.createElement('div');
        container.id = '${config.frameId}';
        document.body.appendChild(container);`}
				heightTextArea={68}
				isReadOnly
				enableCopy
			/>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeInitStep")}
			</Text>
			<Textarea
				value="const sdk = new SDK();"
				heightTextArea={32}
				isReadOnly
				enableCopy
			/>
			<Text lineHeight="20px" className="preview-description">
				{t("NPMCodeUsageStep")}
			</Text>
			<Textarea
				value="sdk.init(config);"
				heightTextArea={32}
				isReadOnly
				enableCopy
			/>
		</CodeWrapper>
	);

	const tabs = [
		{
			id: "html",
			name: "HTML",
			content: html,
		},
		{
			id: "js",
			name: "JavaScript",
			content: js,
		},
		{
			id: "npm",
			name: "NPM",
			content: npm,
		},
	];

	const [selectedItemId, setSelectedItemId] = useState(tabs[0].id);

	return (
		<Tabs
			layoutId="codeToInsert"
			hotkeysId="codeToInsert"
			type={TabsTypes.Secondary}
			items={tabs}
			selectedItemId={selectedItemId}
			onSelect={(e) => setSelectedItemId(e.id)}
			isLoading={!tReady}
		/>
	);
};
