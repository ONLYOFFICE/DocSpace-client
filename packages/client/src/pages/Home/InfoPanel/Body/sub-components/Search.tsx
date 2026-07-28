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

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";

import XIconReactSvgUrl from "PUBLIC_DIR/images/x.react.svg?url";
import {
	InputSize,
	InputType,
	TextInput,
} from "@docspace/ui-kit/components/text-input";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import commonStyles from "../helpers/Common.module.scss";

export type SearchProps = {
	setSearchValue: (value: string) => void;
	resetSearch: VoidFunction;
};

const Search = ({ setSearchValue, resetSearch }: SearchProps) => {
	const [value, setValue] = useState("");

	const onClose = () => {
		resetSearch?.();
	};

	const onEscapeUp = (e: KeyboardEvent) => {
		if (e.key === "Esc" || e.key === "Escape") {
			e.stopPropagation();
			onClose();
		}
	};

	const debouncedSearch = useCallback(
		debounce((debouncedValue: string) => setSearchValue?.(debouncedValue), 300),
		[],
	);

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.currentTarget.value;
		setValue(newValue);

		debouncedSearch(newValue.trim());
	};

	useEffect(() => {
		window.addEventListener("keyup", onEscapeUp);

		return () => window.removeEventListener("keyup", onEscapeUp);
	}, []);

	useEffect(() => {
		return () => debouncedSearch.cancel();
	}, [debouncedSearch]);

	return (
		<div className={commonStyles.searchContainer}>
			<TextInput
				id="info_panel_search_input"
				type={InputType.text}
				size={InputSize.base}
				scale
				onChange={onChange}
				value={value}
				isAutoFocussed
			/>
			<IconButton
				id="search_close"
				iconName={XIconReactSvgUrl}
				size={16}
				onClick={onClose}
				isClickable
			/>
		</div>
	);
};

export default Search;
