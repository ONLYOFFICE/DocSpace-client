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

import { useDidMount } from "../../hooks/useDidMount";
import {
	InputSize,
	InputType,
	TextInput,
} from "@docspace/ui-kit/components/text-input";

import {
	FILE_PATH,
	PRIVATE_CONTAINER,
	PUBLIC_CONTAINER,
} from "./SelectelSettings.constants";
import type { SelectelSettingsProps } from "./SelectelSettings.types";

const SelectelSettings = ({
	isLoading,
	formSettings,
	isLoadingData,
	isNeedFilePath,
	selectedStorage,
	errorsFieldsBeforeSafe: isError,
	t,
	setIsThirdStorageChanged,
	setRequiredFormSettings,
	addValueInFormSettings,
}: SelectelSettingsProps) => {
	const isDisabled = selectedStorage && !selectedStorage.isSet;
	const privatePlaceholder =
		selectedStorage && selectedStorage.properties[0].title;

	const publicPlaceholder =
		selectedStorage && selectedStorage.properties[1].title;

	useDidMount(() => {
		const filePathField = isNeedFilePath ? [FILE_PATH] : [];
		setIsThirdStorageChanged(false);
		setRequiredFormSettings([
			PUBLIC_CONTAINER,
			PRIVATE_CONTAINER,
			...filePathField,
		]);
	});

	const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { target } = event;
		const value = target.value;
		const name = target.name;

		addValueInFormSettings(name, value);
	};

	return (
		<>
			<TextInput
				id="private-container-input"
				name={PRIVATE_CONTAINER}
				className="backup_text-input"
				scale
				value={formSettings[PRIVATE_CONTAINER]}
				hasError={isError[PRIVATE_CONTAINER]}
				onChange={onChangeText}
				isDisabled={isLoadingData || isLoading || isDisabled}
				placeholder={privatePlaceholder || ""}
				tabIndex={1}
				type={InputType.text}
				size={InputSize.base}
				testId="selectel_private_container_input"
			/>
			<TextInput
				scale
				id="public-container-input"
				name={PUBLIC_CONTAINER}
				className="backup_text-input"
				value={formSettings[PUBLIC_CONTAINER]}
				hasError={isError[PUBLIC_CONTAINER]}
				onChange={onChangeText}
				isDisabled={isLoadingData || isLoading || isDisabled}
				placeholder={publicPlaceholder || ""}
				tabIndex={2}
				type={InputType.text}
				size={InputSize.base}
				testId="selectel_public_container_input"
			/>

			{isNeedFilePath ? (
				<TextInput
					id="file-path-input"
					name={FILE_PATH}
					className="backup_text-input"
					scale
					value={formSettings[FILE_PATH]}
					onChange={onChangeText}
					isDisabled={isLoadingData || isLoading || isDisabled}
					placeholder={t("Common:Path")}
					tabIndex={3}
					hasError={isError[FILE_PATH]}
					type={InputType.text}
					size={InputSize.base}
					testId="selectel_file_path_input"
				/>
			) : null}
		</>
	);
};

export default SelectelSettings;

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
// })(observer(SelectelSettings));
