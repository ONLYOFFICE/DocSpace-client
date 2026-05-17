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

import React, { useId, useRef, useCallback, FC } from "react";
import type { TooltipRefProps } from "react-tooltip";

import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";

import { Badge } from "@docspace/ui-kit/components/badge";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";

import styles from "./InfoBadge.module.scss";
import type InfoBadgeProps from "./InfoBadge.types";
import { globalColors } from "@docspace/ui-kit/providers/theme";

const InfoBadge: FC<InfoBadgeProps> = ({
	label,
	offset,
	place = "bottom",
	tooltipDescription,
	tooltipTitle,
	dataTestId,
}) => {
	const id = useId();

	const tooltipRef = useRef<TooltipRefProps>(null);

	const onClose = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		tooltipRef.current?.close();
	}, []);

	const isSimpleContent =
		typeof tooltipTitle === "string" && typeof tooltipDescription === "string";

	const tooltipHtmlContent = isSimpleContent
		? `<div style="max-width: 300px;">
         <div style="font-weight: 600; margin-bottom: 8px;">${tooltipTitle}</div>
         <div>${tooltipDescription}</div>
       </div>`
		: null;

	return (
		<div data-testid={dataTestId ?? "info-badge"}>
			<Badge
				noHover
				fontSize="9px"
				isHovered={false}
				borderRadius="50px"
				label={label}
				data-tooltip-id={isSimpleContent ? "info-tooltip" : id}
				{...(isSimpleContent && tooltipHtmlContent
					? {
							"data-tooltip-html": tooltipHtmlContent,
							"data-tooltip-place": place,
						}
					: {})}
				backgroundColor={globalColors.mainPurple}
			/>

			{!isSimpleContent && tooltipDescription && tooltipTitle ? (
				<Tooltip
					id={id}
					ref={tooltipRef}
					place={place}
					offset={offset || 10}
					clickable
					openOnClick
					className={styles.tooltip}
					aria-labelledby={id}
					data-testid="info-tooltip"
				>
					<div className={styles.content}>
						<div className={styles.header}>
							<h3 className={styles.title} data-testid="tooltip-title">
								{tooltipTitle}
							</h3>
							<IconButton
								data-testid="close-tooltip-button"
								isFill
								size={16}
								onClick={onClose}
								iconName={CrossIcon}
								className={styles.close}
							/>
						</div>
						<p className={styles.description} data-testid="tooltip-description">
							{tooltipDescription}
						</p>
					</div>
				</Tooltip>
			) : null}
		</div>
	);
};

InfoBadge.displayName = "InfoBadge";

export { InfoBadge };
