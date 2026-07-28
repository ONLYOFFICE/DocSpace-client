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
import { LOADER_STYLE } from "../../constants";

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import styles from "./Settings.module.scss";

const speed = 2;

export const SettingsSMTPSkeleton = () => {
	const firstComponent = (
		<div>
			<div>
				<RectangleSkeleton
					height="22"
					width="56"
					backgroundColor={LOADER_STYLE.backgroundColor}
					foregroundColor={LOADER_STYLE.foregroundColor}
					backgroundOpacity={LOADER_STYLE.backgroundOpacity}
					foregroundOpacity={LOADER_STYLE.foregroundOpacity}
					speed={speed}
					animate
				/>
			</div>
			<RectangleSkeleton
				className="rectangle-loader-2"
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);

	const secondComponent = (
		<div>
			<RectangleSkeleton
				height="20"
				width="101"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				className="rectangle-loader-2"
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);
	const thirdComponent = (
		<div>
			<RectangleSkeleton
				height="20"
				width="138"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				className="rectangle-loader-2"
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);

	const checkboxComponent = (
		<div className="rectangle-loader_checkbox">
			<RectangleSkeleton
				height="16"
				width="16"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				height="22"
				width="101"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);
	const secondCheckboxComponent = (
		<div className="rectangle-loader_checkbox">
			<RectangleSkeleton
				height="16"
				width="16"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				height="20"
				width="70"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);
	const buttonsComponent = (
		<div className="rectangle-loader_buttons">
			<RectangleSkeleton
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			<RectangleSkeleton
				height="32"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
		</div>
	);
	return (
		<div className={styles.smtpContent} data-testid="settings-smtp-skeleton">
			<RectangleSkeleton
				className="rectangle-loader_title"
				height="22"
				width="128"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>

			<RectangleSkeleton
				className="rectangle-loader_description"
				height="60"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>

			{firstComponent}
			{firstComponent}
			<RectangleSkeleton
				className="rectangle-loader_title"
				height="20"
				width="128"
				backgroundColor={LOADER_STYLE.backgroundColor}
				foregroundColor={LOADER_STYLE.foregroundColor}
				backgroundOpacity={LOADER_STYLE.backgroundOpacity}
				foregroundOpacity={LOADER_STYLE.foregroundOpacity}
				speed={speed}
				animate
			/>
			{secondComponent}
			{secondComponent}

			{checkboxComponent}

			{thirdComponent}
			{thirdComponent}

			{secondCheckboxComponent}
			{buttonsComponent}
		</div>
	);
};
