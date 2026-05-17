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

import { observer } from "mobx-react";
import { useState, useRef, useEffect, FC } from "react";
import { withTranslation } from "react-i18next";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { SearchInput } from "@docspace/ui-kit/components/search-input";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { SearchFilterProps } from "./SearchFilter.types";

const SearchFilter: FC<SearchFilterProps> = ({
	t,
	oformsFilter,
	filterOformsBySearch,
	filterOformsByLocaleIsLoading,
	categoryFilterLoaded,
	languageFilterLoaded,
	isShowInitSkeleton,
	isLanguageFilterChange,
}) => {
	const [value, setValue] = useState(oformsFilter.search);
	const onChangeValue = (val: string) => {
		setValue(val);
		filterOformsBySearch(val);
	};
	const onClear = () => onChangeValue("");

	useEffect(() => {
		if (value !== oformsFilter.search) setValue(oformsFilter.search);
	}, [oformsFilter.search, value]);

	const ref = useRef<HTMLInputElement>(null);
	const onInputClick = () => ref?.current?.focus();
	const onInputOutsideClick = (e: MouseEvent) => {
		if (ref?.current && !ref?.current?.contains(e.target as Node)) {
			ref.current.blur();
		}
	};
	useEffect(() => {
		document.addEventListener("mousedown", onInputOutsideClick);
		return () => document.removeEventListener("mousedown", onInputOutsideClick);
	}, [ref]);

	if (
		(isShowInitSkeleton ||
			filterOformsByLocaleIsLoading ||
			!(categoryFilterLoaded && languageFilterLoaded)) &&
		!isLanguageFilterChange
	)
		return <RectangleSkeleton height="32px" />;

	return (
		<SearchInput
			forwardedRef={ref}
			scale
			size={InputSize.base}
			placeholder={t("Common:Search")}
			value={value}
			onChange={onChangeValue}
			onClick={onInputClick}
			onClearSearch={onClear}
			isDisabled={isLanguageFilterChange}
		/>
	);
};

export default observer(
	withTranslation(["FormGallery", "Common"])(SearchFilter),
);
