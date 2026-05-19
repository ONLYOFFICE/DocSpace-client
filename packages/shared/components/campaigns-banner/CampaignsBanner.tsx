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

import CrossReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import React from "react";
import { ReactSVG } from "react-svg";

import { Text as TextComponent } from "@docspace/ui-kit/components/text";
import {
	Link as LinkComponent,
	LinkType,
} from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import styles from "./CampaignsBanner.module.scss";
import { CampaignsBannerProps } from "./CampaignsBanner.types";

import useFitText from "./useFitText";
import { globalColors } from "@docspace/ui-kit/providers/theme";

const CampaignsBanner = (props: CampaignsBannerProps) => {
	const {
		campaignBackground,
		campaignIcon,
		campaignTranslate,
		campaignConfig,
		onAction,
		onClose,
		disableFitText,
		actionIcon,
	} = props;
	const { Header, SubHeader, Text, ButtonLabel, Link } = campaignTranslate;
	const { borderColor, title, body, text, action } = campaignConfig;

	const hasTitle = !!Header;
	const hasBodyText = !!SubHeader;
	const hasText = !!Text;
	const isButton = action?.isButton;

	const fitTextResult = useFitText(
		campaignBackground,
		campaignTranslate,
		body?.fontSize,
	);

	const staticRef = React.useRef<HTMLDivElement>(null);
	const staticWrapperRef = React.useRef<HTMLDivElement>(null);

	const fontSize = disableFitText ? body?.fontSize : fitTextResult.fontSize;
	const ref = disableFitText ? staticRef : fitTextResult.ref;
	const wrapperRef = disableFitText
		? staticWrapperRef
		: fitTextResult.wrapperRef;

	const wrapperStyle = {
		"--campaign-background": `url(${campaignBackground})`,
		"--campaign-border-color": borderColor,
	} as React.CSSProperties;

	const buttonStyle = {
		"--campaign-button-background-color": action?.backgroundColor,
		"--campaign-button-color": action?.color,
	} as React.CSSProperties;

	return (
		<div
			ref={wrapperRef}
			data-testid="campaigns-banner"
			className={styles.wrapper}
			style={wrapperStyle}
		>
			<div ref={ref} className={styles.content}>
				{hasTitle ? (
					<TextComponent
						className={styles.header}
						color={title?.color ?? globalColors.black}
						fontSize={title?.fontSize ?? "13px"}
						fontWeight={title?.fontWeight ?? "normal"}
						lineHeight={title?.lineHeight ?? "12px"}
					>
						{Header}
					</TextComponent>
				) : null}
				<div>
					{hasBodyText ? (
						<TextComponent
							color={body?.color ?? globalColors.black}
							fontSize={fontSize ?? "13px"}
							fontWeight={body?.fontWeight ?? "normal"}
							lineHeight={body?.lineHeight ?? "16px"}
						>
							{SubHeader}
						</TextComponent>
					) : null}
					{hasText ? (
						<TextComponent
							color={text?.color ?? globalColors.black}
							fontSize={text?.fontSize ?? "13px"}
							fontWeight={text?.fontWeight ?? "normal"}
							lineHeight={text?.lineHeight ?? "16px"}
						>
							{Text}
						</TextComponent>
					) : null}
				</div>
				{isButton ? (
					<button
						style={buttonStyle}
						className={styles.button}
						onClick={() => onAction(action?.type, Link)}
						type="button"
					>
						<TextComponent
							color={action?.color ?? globalColors.black}
							fontSize={action?.fontSize ?? "13px"}
							fontWeight={action?.fontWeight ?? "normal"}
						>
							{ButtonLabel}
						</TextComponent>
					</button>
				) : (
					<LinkComponent
						color={action?.color ?? globalColors.black}
						type={LinkType.action}
						isHovered
						onClick={() => onAction(action?.type, Link)}
					>
						<TextComponent
							color={action?.color ?? globalColors.black}
							fontSize={action?.fontSize ?? "13px"}
							fontWeight={action?.fontWeight ?? "normal"}
						>
							{ButtonLabel}
						</TextComponent>
					</LinkComponent>
				)}

				{campaignIcon ? (
					<ReactSVG src={campaignIcon} className={styles.icon} />
				) : null}
			</div>
			<IconButton
				size={12}
				className={styles.closeIcon}
				onClick={onClose}
				iconName={actionIcon || CrossReactSvg}
			/>
		</div>
	);
};

export { CampaignsBanner };
