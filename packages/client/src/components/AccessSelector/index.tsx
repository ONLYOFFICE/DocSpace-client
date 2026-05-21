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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";
import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";
import { TOption } from "@docspace/ui-kit/components/combobox";
import { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

interface AccessSelectorProps {
	t: TTranslation;
	roomType: RoomsType | -1;
	onSelectAccess: (access: TOption) => void;
	containerRef?: React.RefObject<HTMLDivElement | null>;
	defaultAccess: number;
	isOwner: boolean;
	isAdmin: boolean;
	withRemove?: boolean;
	filteredAccesses?: TOption[];
	setIsOpenItemAccess?: React.Dispatch<React.SetStateAction<boolean>>;
	className: string;
	standalone?: boolean;
	isMobileView: boolean;
	noBorder?: boolean;
	manualWidth?: number;
	isDisabled?: boolean;
	directionX?: string;
	directionY?: string;
	isSelectionDisabled?: boolean;
	selectionErrorText?: React.ReactNode;
	availableAccess?: number[];
	scaledOptions?: boolean;
	dataTestId?: string;
}

const AccessSelector: React.FC<AccessSelectorProps> = ({
	t,
	roomType,
	onSelectAccess,
	containerRef,
	defaultAccess,
	isOwner,
	isAdmin,
	withRemove = false,
	filteredAccesses,
	setIsOpenItemAccess,
	className,
	standalone,
	isMobileView,
	noBorder = false,
	manualWidth,
	isDisabled,
	directionX = "left",
	directionY = "bottom",
	isSelectionDisabled,
	selectionErrorText,
	availableAccess,
	scaledOptions,
	dataTestId,
}) => {
	const [horizontalOrientation, setHorizontalOrientation] = useState(false);
	const [width, setWidth] = useState(manualWidth || 0);

	useEffect(() => {
		const offsetWidth = containerRef?.current?.offsetWidth;

		if (typeof offsetWidth !== "number") {
			return;
		}

		setWidth(offsetWidth - 32);
	}, [containerRef, containerRef?.current?.offsetWidth]);

	const accessOptions = getAccessOptions(
		t,
		roomType as RoomsType,
		withRemove,
		true,
		isOwner,
		isAdmin,
		standalone,
	);

	const selectedOption = accessOptions.filter(
		(access) => "access" in access && access?.access === +defaultAccess,
	)[0];

	const checkWidth = () => {
		if (!isMobile()) return;

		if (!isMobile()) {
			setHorizontalOrientation(true);
		} else {
			setHorizontalOrientation(false);
		}
	};

	useEffect(() => {
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	}, []);

	const isMobileHorizontalOrientation = isMobile() && horizontalOrientation;

	return (
		<div className="access-selector" style={{ marginInlineEnd: "16px" }}>
			{!(isMobile() && !isMobileHorizontalOrientation) ? (
				<AccessRightSelect
					className={className}
					selectedOption={selectedOption as unknown as TOption}
					onSelect={onSelectAccess}
					accessOptions={
						(filteredAccesses || accessOptions) as unknown as TOption[]
					}
					noBorder={noBorder}
					directionX={directionX as "right" | "left"}
					directionY={directionY as "bottom" | "top" | "both" | undefined}
					fixedDirection
					manualWidth={`${width}px`}
					isDefaultMode={false}
					isAside={false}
					setIsOpenItemAccess={setIsOpenItemAccess}
					isDisabled={isDisabled}
					isSelectionDisabled={isSelectionDisabled}
					selectionErrorText={selectionErrorText}
					availableAccess={availableAccess}
					scaledOptions={scaledOptions}
					dataTestId={dataTestId}
					showDisabledItems={true}
				/>
			) : null}

			{isMobile() && !isMobileHorizontalOrientation ? (
				<AccessRightSelect
					className={className}
					selectedOption={selectedOption as unknown as TOption}
					onSelect={onSelectAccess}
					accessOptions={
						(filteredAccesses || accessOptions) as unknown as TOption[]
					}
					noBorder={noBorder}
					directionX="right"
					directionY="top"
					fixedDirection
					manualWidth="auto"
					isDefaultMode
					isAside={isMobileView}
					setIsOpenItemAccess={setIsOpenItemAccess}
					manualY="0px"
					withBackground={isMobileView}
					withBlur={isMobileView}
					isDisabled={isDisabled}
					isSelectionDisabled={isSelectionDisabled}
					selectionErrorText={selectionErrorText}
					availableAccess={availableAccess}
					scaledOptions={scaledOptions}
					dataTestId={dataTestId}
					showDisabledItems={true}
				/>
			) : null}
		</div>
	);
};

export default inject<TStore>(({ settingsStore }) => {
	const { standalone } = settingsStore;

	return {
		standalone,
	};
})(observer(AccessSelector));
