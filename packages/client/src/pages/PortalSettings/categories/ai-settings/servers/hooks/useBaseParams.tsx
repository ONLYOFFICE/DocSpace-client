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
import equal from "fast-deep-equal/react";
import classNames from "classnames";
import { ALLOWED_MCP_CHARACTERS } from "@docspace/shared/constants";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
	TextInput,
	InputType,
	InputSize,
} from "@docspace/ui-kit/components/text-input";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "./useBaseParams.module.scss";

const regex = /^[a-zA-Z0-9_-]+$/;

export const useBaseParams = (initialValues?: {
	name?: string;
	url?: string;
	description?: string;
}) => {
	const { t } = useTranslation(["AISettings", "Common", "OAuth"]);

	const [name, setName] = React.useState(initialValues?.name || "");
	const [url, setUrl] = React.useState(initialValues?.url || "");
	const [description, setDescription] = React.useState(
		initialValues?.description || "",
	);

	const initBaseParams = React.useRef({
		name,
		url,
		description,
	});

	const [nameError, setNameError] = React.useState("");
	const [urlError, setUrlError] = React.useState("");
	const [descriptionError, setDescriptionError] = React.useState("");
	const [hasError, setHasError] = React.useState(false);

	const onChangeName = (value: string) => {
		setName(value);

		if (nameError) setNameError("");
	};

	const onChangeUrl = (value: string) => {
		setUrl(value);

		if (urlError) setUrlError("");
	};

	const onChangeDescription = (value: string) => {
		setDescription(value);

		if (descriptionError) setDescriptionError("");
	};

	const requiredError = t("OAuth:ThisRequiredField");

	const getBaseParams = () => {
		if (!name) {
			setNameError(requiredError);
		}
		if (!url) {
			setUrlError(requiredError);
		}
		if (!description) {
			setDescriptionError(requiredError);
		}

		if (!name || !url || !description) {
			return;
		}

		return {
			name,
			url,
			description,
		};
	};

	const hasChanges = !equal(initBaseParams.current, { name, url, description });

	const handleBlur = () => setHasError(Boolean(name && !regex.test(name)));

	const baseParamsError = !name || !url || !description || hasError;

	const baseParamsComponent = (
		<>
			<FieldContainer
				labelText={t("AISettings:IntegrationName")}
				isRequired
				isVertical
				removeMargin
				labelVisible
				errorMessage={nameError}
				hasError={!!nameError}
			>
				<TextInput
					type={InputType.text}
					size={InputSize.base}
					value={name}
					onChange={(e) => onChangeName(e.target.value)}
					onBlur={handleBlur}
					placeholder={t("Common:EnterName")}
					scale
					hasError={hasError || !!nameError}
					maxLength={128}
					testId="mcp-title-input"
				/>
				<Text
					className={classNames(styles.fieldHint, {
						[styles.errorText]: hasError,
					})}
				>
					{hasError
						? `${t("Common:AllowedCharacters")}: ${ALLOWED_MCP_CHARACTERS}`
						: t("AISettings:ProviderNameInputHint")}
				</Text>
			</FieldContainer>
			<FieldContainer
				labelText={t("AISettings:IntegrationURL")}
				isRequired
				isVertical
				removeMargin
				labelVisible
				errorMessage={urlError}
				hasError={!!urlError}
			>
				<TextInput
					type={InputType.text}
					size={InputSize.base}
					value={url}
					onChange={(e) => onChangeUrl(e.target.value)}
					placeholder={t("OAuth:EnterURL")}
					scale
					hasError={!!urlError}
					testId="mcp-url-input"
				/>
				<Text className={styles.fieldHint}>
					{t("AISettings:MCPServerIntegrationURLHint", {
						mcpServer: t("Common:MCPServer"),
					})}
				</Text>
			</FieldContainer>
			<FieldContainer
				labelText={t("Common:DescriptionLabel")}
				isRequired
				isVertical
				removeMargin
				labelVisible
				errorMessage={descriptionError}
				hasError={!!descriptionError}
			>
				<Textarea
					heightTextArea={64}
					value={description}
					onChange={(e) => onChangeDescription(e.target.value)}
					placeholder={t("OAuth:EnterDescription")}
					maxLength={256}
					dataTestId="mcp-description-textarea"
				/>
				<Text className={styles.fieldHint}>
					{t("AISettings:MCPServerDescriptionHint")}
				</Text>
			</FieldContainer>
		</>
	);

	return {
		getBaseParams,
		baseParamsComponent,
		baseParamsChanged: hasChanges,
		baseParamsError,
	};
};
