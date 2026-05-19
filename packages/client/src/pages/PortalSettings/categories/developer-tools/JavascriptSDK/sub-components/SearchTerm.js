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

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { Label } from "@docspace/ui-kit/components/label";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";

import { ColumnContainer } from "../presets/StyledPresets";

export const SearchTerm = ({ t, config, setConfig }) => {
	const [value, setValue] = useState(config.filter.filterValue);

	const debouncedSetConfig = useCallback(
		debounce((newValue) => {
			setConfig((oldConfig) => ({
				...oldConfig,
				filter: { ...oldConfig.filter, filterValue: newValue },
			}));
		}, 500),
		[setConfig],
	);

	const onChangeSearch = (e) => {
		setValue(e.target.value);
		debouncedSetConfig(e.target.value);
	};

	const onChangeWithSubfolders = () => {
		setConfig((oldConfig) => ({
			...oldConfig,
			withSubfolders: !config.withSubfolders,
		}));
	};

	return (
		<>
			<Label className="label" text={t("SearchTerm")} />
			<ColumnContainer>
				<TextInput
					scale
					onChange={onChangeSearch}
					placeholder={t("Common:Search")}
					value={value}
					tabIndex={5}
					testId="search_term_text_input"
				/>
				<Checkbox
					className="checkbox"
					label={t("Common:WithSubfolders")}
					onChange={onChangeWithSubfolders}
					isChecked={config.withSubfolders}
					dataTestId="with_subfolders_checkbox"
				/>
			</ColumnContainer>
		</>
	);
};
