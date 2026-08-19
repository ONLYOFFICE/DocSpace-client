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
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";
import styles from "./Payments.module.scss";
import { PaymentsLoaderProps } from "./Payments.types";

const TrialLoader = (props: PaymentsLoaderProps) => {
	const {
		title,
		borderRadius,
		backgroundColor,
		foregroundColor,
		backgroundOpacity,
		foregroundOpacity,
		speed,
		animate,
	} = props;

	return (
		<div className={styles.trialComponent} data-testid="trial-loader">
			<RectangleSkeleton
				className="payments-loader_1"
				title={title}
				width="100%"
				height="100%"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_2"
				title={title}
				width="100%"
				height="40px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_3"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_4"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_5"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_6"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_7"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_8"
				title={title}
				width="100%"
				height="32px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_9"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<RectangleSkeleton
				className="payments-loader_9"
				title={title}
				width="100%"
				height="20px"
				borderRadius={borderRadius}
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
		</div>
	);
};
export default TrialLoader;
