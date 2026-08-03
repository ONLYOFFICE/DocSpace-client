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

import { isMobile as isMobileDevice } from "react-device-detect";
import React, { useId } from "react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { classNames } from "../../utils";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import ButtonAlertIconSvgUrl from "PUBLIC_DIR/images/button.alert.react.svg?url";
import LoadErrorIconSvgUrl from "PUBLIC_DIR/images/load.error.react.svg?url";

import styles from "./FailedVectorizationBadge.module.scss";

type Props = {
	className?: string;
	size?: "small" | "medium";

	withRetryVectorization?: boolean;
	onRetryVectorization?: () => void;
};

export const FailedVectorizationBadge = ({
	size = "small",
	onRetryVectorization,
	className,
	withRetryVectorization,
}: Props) => {
	const { t } = useTranslation("Common");
	const tooltipId = useId();

	const iconAlert =
		size === "small" ? ButtonAlertIconSvgUrl : LoadErrorIconSvgUrl;

	const getAlertTooltipContent = () => {
		return (
			<div>
				<Text fontWeight={600} fontSize="12px" lineHeight="16px">
					{t("Common:PreparationForAIFailed")}
				</Text>
				<Text fontSize="12px" lineHeight="16px">
					{t("Common:PreparationForAIFailedInfo")}
				</Text>
				{withRetryVectorization ? (
					<Link
						type={LinkType.action}
						fontWeight={600}
						onClick={onRetryVectorization}
					>
						{t("Common:TryAgain")}
					</Link>
				) : null}
			</div>
		);
	};

	return (
		<>
			<IconButton
				data-tooltip-id={tooltipId}
				iconName={iconAlert}
				className={classNames(styles.badge, className, {
					[styles.small]: size === "small",
					[styles.medium]: size === "medium",
				})}
				dataTestId="failed-vectorization-badge"
			/>
			<Tooltip
				id={tooltipId}
				className="not-selectable"
				getContent={getAlertTooltipContent}
				place="bottom-start"
				clickable
				maxWidth="302px"
				openOnClick={isMobileDevice}
			/>
		</>
	);
};
