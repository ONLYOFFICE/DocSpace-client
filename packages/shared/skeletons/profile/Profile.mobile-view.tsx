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
	RectangleSkeleton,
	RectangleSkeletonProps,
} from "@docspace/ui-kit/components/rectangle";
import { CircleSkeleton } from "@docspace/ui-kit/components/circle";

import styles from "./Profile.module.scss";

const MobileViewLoader = (props: RectangleSkeletonProps) => {
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
		<div className={styles.mobileView}>
			<CircleSkeleton
				className="avatar"
				title={title}
				x="62"
				y="62"
				radius="62"
				backgroundColor={backgroundColor}
				foregroundColor={foregroundColor}
				backgroundOpacity={backgroundOpacity}
				foregroundOpacity={foregroundOpacity}
				speed={speed}
				animate={animate}
			/>
			<div className="info">
				<RectangleSkeleton
					title={title}
					height="58"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
				<RectangleSkeleton
					title={title}
					height="58"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
				<RectangleSkeleton
					title={title}
					height="58"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
			</div>
			<div className="block">
				<RectangleSkeleton
					title={title}
					width="78"
					height="20"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
				<RectangleSkeleton
					title={title}
					height="32"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
			</div>

			<div className="notifications">
				<RectangleSkeleton
					title={title}
					width="101"
					height="22"
					className="title"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
				<RectangleSkeleton
					title={title}
					height="32"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>
			</div>

			<div className="theme">
				<RectangleSkeleton
					title={title}
					className="theme-title"
					width="129"
					height="22"
					borderRadius={borderRadius}
					backgroundColor={backgroundColor}
					foregroundColor={foregroundColor}
					backgroundOpacity={backgroundOpacity}
					foregroundOpacity={foregroundOpacity}
					speed={speed}
					animate={animate}
				/>

				<div className="flex">
					<RectangleSkeleton
						title={title}
						width="16"
						height="16"
						className="check-box"
						borderRadius={borderRadius}
						backgroundColor={backgroundColor}
						foregroundColor={foregroundColor}
						backgroundOpacity={backgroundOpacity}
						foregroundOpacity={foregroundOpacity}
						speed={speed}
						animate={animate}
					/>

					<RectangleSkeleton
						title={title}
						width="124"
						height="20"
						borderRadius={borderRadius}
						backgroundColor={backgroundColor}
						foregroundColor={foregroundColor}
						backgroundOpacity={backgroundOpacity}
						foregroundOpacity={foregroundOpacity}
						speed={speed}
						animate={animate}
					/>
				</div>

				<div className="theme-selection">
					<RectangleSkeleton
						title={title}
						width="291"
						height="32"
						className="theme-description"
						borderRadius={borderRadius}
						backgroundColor={backgroundColor}
						foregroundColor={foregroundColor}
						backgroundOpacity={backgroundOpacity}
						foregroundOpacity={foregroundOpacity}
						speed={speed}
						animate={animate}
					/>

					<div className="check-box-container">
						<div className="flex">
							<CircleSkeleton
								title={title}
								className="check-box"
								x="8"
								y="8"
								radius="8"
								backgroundColor={backgroundColor}
								foregroundColor={foregroundColor}
								backgroundOpacity={backgroundOpacity}
								foregroundOpacity={foregroundOpacity}
								speed={speed}
								animate={animate}
							/>
							<RectangleSkeleton
								title={title}
								width="124"
								height="20"
								borderRadius={borderRadius}
								backgroundColor={backgroundColor}
								foregroundColor={foregroundColor}
								backgroundOpacity={backgroundOpacity}
								foregroundOpacity={foregroundOpacity}
								speed={speed}
								animate={animate}
							/>
						</div>
						<div className="flex">
							<CircleSkeleton
								title={title}
								className="check-box"
								x="8"
								y="8"
								radius="8"
								backgroundColor={backgroundColor}
								foregroundColor={foregroundColor}
								backgroundOpacity={backgroundOpacity}
								foregroundOpacity={foregroundOpacity}
								speed={speed}
								animate={animate}
							/>
							<RectangleSkeleton
								title={title}
								width="124"
								height="20"
								borderRadius={borderRadius}
								backgroundColor={backgroundColor}
								foregroundColor={foregroundColor}
								backgroundOpacity={backgroundOpacity}
								foregroundOpacity={foregroundOpacity}
								speed={speed}
								animate={animate}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MobileViewLoader;
