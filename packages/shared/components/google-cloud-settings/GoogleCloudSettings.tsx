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

import {
	InputSize,
	InputType,
	TextInput,
} from "@docspace/ui-kit/components/text-input";
import { useDidMount } from "../../hooks/useDidMount";

import { BUCKET, FILE_PATH } from "./GoogleCloudSettings.constants";
import type { GoogleCloudSettingsProps } from "./GoogleCloudSettings.types";

const GoogleCloudSettings = ({
	t,
	setIsThirdStorageChanged,
	setRequiredFormSettings,
	addValueInFormSettings,
	isNeedFilePath,
	selectedStorage,
	errorsFieldsBeforeSafe: isError,
	formSettings,
	isLoading,
	isLoadingData,
}: GoogleCloudSettingsProps) => {
	useDidMount(() => {
		const filePathField = isNeedFilePath ? [FILE_PATH] : [];
		setRequiredFormSettings([BUCKET, ...filePathField]);
		setIsThirdStorageChanged(false);
	});

	const isDisabled = selectedStorage && !selectedStorage.isSet;
	const bucketPlaceholder =
		selectedStorage && selectedStorage.properties[0].title;

	const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { target } = event;
		const value = target.value;
		const name = target.name;

		addValueInFormSettings(name, value);
	};

	return (
		<>
			<TextInput
				scale
				tabIndex={1}
				name={BUCKET}
				id="bucket-input"
				onChange={onChangeText}
				className="backup_text-input"
				value={formSettings[BUCKET]}
				hasError={isError[BUCKET]}
				isDisabled={isLoadingData || isLoading || isDisabled}
				placeholder={bucketPlaceholder || ""}
				type={InputType.text}
				size={InputSize.base}
				testId="google_cloud_bucket_input"
			/>

			{isNeedFilePath ? (
				<TextInput
					scale
					tabIndex={2}
					type={InputType.text}
					size={InputSize.base}
					name={FILE_PATH}
					id="file-path-input"
					placeholder={t("Common:Path")}
					onChange={onChangeText}
					className="backup_text-input"
					hasError={isError[FILE_PATH]}
					value={formSettings[FILE_PATH]}
					isDisabled={isLoadingData || isLoading || isDisabled}
					testId="google_cloud_file_path_input"
				/>
			) : null}
		</>
	);
};

export default GoogleCloudSettings;

// export default inject(({ backup }) => {
//   const {
//     setFormSettings,
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,
//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//   } = backup;

//   return {
//     setFormSettings,
//     setRequiredFormSettings,
//     formSettings,
//     errorsFieldsBeforeSafe,
//     setIsThirdStorageChanged,
//     addValueInFormSettings,
//   };
// })(observer(GoogleCloudSettings));
