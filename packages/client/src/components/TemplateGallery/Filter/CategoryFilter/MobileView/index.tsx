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

import React, { useState, useRef } from "react";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { ComboButton } from "@docspace/ui-kit/components/combobox";
import classNames from "classnames";
import styles from "./MobileView.module.scss";
import type {
	CategoryFilterMobileProps,
	MenuItem,
	Category,
	InjectedProps,
} from "../CategoryFilter.types";
import { ScrollbarType } from "@docspace/ui-kit/components/scrollbar";

const CategoryFilterMobile: React.FC<CategoryFilterMobileProps> = ({
	t,
	menuItems,
	currentCategory,
	getCategoryTitle,
	filterOformsByCategory,
	setOformsCurrentCategory,
	isLanguageFilterChange,
}) => {
	const scrollRef = useRef<ScrollbarType>(null);

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [openedMenuItem, setOpenedMenuItem] = useState<MenuItem | null>(null);

	const onCloseDropdown = () => {
		setIsOpen(false);
		setOpenedMenuItem(null);
	};
	const onToggleDropdown = () => {
		if (isOpen) setOpenedMenuItem(null);
		else setIsOpen(!isOpen);
	};

	const onViewAllTemplates = () => {
		filterOformsByCategory("", "");
		onCloseDropdown();
	};

	const onOpenMenuItem = (category: MenuItem) => setOpenedMenuItem(category);
	const onHeaderArrowClick = () => setOpenedMenuItem(null);

	const onFilterByCategory = (category: Category) => {
		if (!openedMenuItem) return;
		filterOformsByCategory(openedMenuItem.key, category.id);
		setOformsCurrentCategory(category);
		setOpenedMenuItem(null);
		setIsOpen(false);
	};

	let height = 0;
	const maxCalculatedHeight = 385;

	const calculatedHeight =
		48 +
		(!openedMenuItem
			? 36 + 13 + menuItems.length * 36
			: openedMenuItem.categories.length * 36);

	if (calculatedHeight > maxCalculatedHeight) height = maxCalculatedHeight;
	else height = calculatedHeight;

	return (
		<div id="containerMobile" className={styles.categoryFilterMobileWrapper}>
			<ComboButton
				selectedOption={{
					key: currentCategory?.id || "categories",
					label:
						getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
				}}
				isOpen={isOpen}
				scaled
				onClick={onToggleDropdown}
				tabIndex={1}
				isDisabled={isLanguageFilterChange}
			/>

			<DropDown
				className={classNames(styles.categoryFilterMobile, "mainBtnDropdown")}
				style={{ "--forced-height": `${height}px` } as React.CSSProperties}
				open={isOpen}
				withBackdrop
				withBackground
				usePortalBackdrop
				shouldShowBackdrop
				manualWidth="100%"
				directionY="top"
				manualY="0px"
				directionX="right"
				fixedDirection
				isDefaultMode={true}
				clickOutsideAction={onCloseDropdown}
			>
				<Scrollbar
					style={{ position: "absolute" }}
					scrollClass="section-scroll"
					ref={scrollRef}
				>
					<DropDownItem
						isHeader
						withHeaderArrow={!!openedMenuItem}
						headerArrowAction={onHeaderArrowClick}
						label={openedMenuItem?.label || t("Categories")}
						style={{ paddingLeft: "0" }}
					/>

					{!openedMenuItem
						? [
								<DropDownItem
									key="view-all"
									className={classNames(
										"dropdown-item",
										styles.categoryFilterItemMobile,
									)}
									label={t("FormGallery:ViewAllTemplates")}
									onClick={onViewAllTemplates}
									style={{ paddingLeft: "0" }}
								/>,
								<DropDownItem
									isSeparator
									key="separator"
									className={classNames("huge-separator", "isSeparator")}
								/>,
							]
						: null}

					{!openedMenuItem
						? menuItems.map((item) => (
								<DropDownItem
									key={item.key}
									className={classNames(
										`item-by-${item.key}`,
										styles.categoryFilterItemMobile,
									)}
									label={item.label}
									onClick={() => onOpenMenuItem(item)}
									style={{ paddingLeft: "0" }}
									isSubMenu
								/>
							))
						: openedMenuItem.categories.map((category) => (
								<DropDownItem
									key={category.id}
									className={styles.categoryFilterItemMobile}
									label={getCategoryTitle(category)}
									onClick={() => onFilterByCategory(category)}
									style={{ paddingLeft: "0" }}
								/>
							))}
				</Scrollbar>
			</DropDown>
		</div>
	);
};

export default inject(({ oformsStore }: InjectedProps) => ({
	currentCategory: oformsStore.currentCategory,
	getCategoryTitle: oformsStore.getCategoryTitle,
	filterOformsByCategory: oformsStore.filterOformsByCategory,
	setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery"])(observer(CategoryFilterMobile)));
