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
import { useTheme } from "styled-components";
import NextStepReactSvg from "PUBLIC_DIR/images/arrow.right.react.svg?url";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import { useTwoFactorCampaignBanner } from "../../hooks/useTwoFactorCampaignBanner";
import { CampaignsBanner } from "../campaigns-banner";
import { TColorScheme } from "@docspace/ui-kit/providers/theme";
import styles from "./TwoFactorCampaignBanner.module.scss";

export interface TwoFactorCampaignBannerProps {
	/** Whether TFA is enabled */
	tfaEnabled: boolean;
	/** Current color scheme */
	currentColorScheme: TColorScheme;
	/** Whether to show campaign banner */
	withCampaign?: boolean;
	/** Additional styles */
	style?: React.CSSProperties;
}

export const TwoFactorCampaignBanner: React.FC<
	TwoFactorCampaignBannerProps
> = ({ tfaEnabled, currentColorScheme, withCampaign = false, style }) => {
	const { isRTL } = useInterfaceDirection();
	const theme = useTheme();
	const isBaseTheme = theme.isBase;

	const { navigateTo2FA, loginHistoryTranslates, loginHistoryConfig } =
		useTwoFactorCampaignBanner(isBaseTheme, currentColorScheme);

	if (tfaEnabled || !withCampaign) {
		return null;
	}

	const wrapperClassName = `${styles.bannerWrapper} ${isRTL ? styles.rtl : ""}`;

	return (
		<div className={wrapperClassName} onClick={navigateTo2FA} style={style}>
			<CampaignsBanner
				campaignBackground=""
				campaignIcon=""
				campaignConfig={loginHistoryConfig}
				campaignTranslate={loginHistoryTranslates}
				disableFitText
				actionIcon={NextStepReactSvg}
				onAction={(type) => {
					if (type === "2fa-settings") {
						navigateTo2FA();
					}
				}}
				onClose={() => {
					navigateTo2FA();
				}}
			/>
		</div>
	);
};
