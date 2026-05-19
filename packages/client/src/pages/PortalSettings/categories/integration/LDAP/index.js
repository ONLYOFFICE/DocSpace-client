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

import { useState, useEffect } from "react";
import { isDesktop } from "react-device-detect";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { isMobile } from "@docspace/ui-kit/utils/device";

import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import StyledLdapPage from "./styled-containers/StyledLdapPage";

import ToggleLDAP from "./sub-components/ToggleLDAP";
import { SyncContainerSection } from "./sub-components/SyncContainer";
import LdapMobileView from "./sub-components/LdapMobileView";
import { SettingsContainerSection } from "./sub-components/SettingsContainer";
import LdapLoader from "./sub-components/LdapLoader";
import { getBrandName } from "@docspace/shared/constants/brands";

const LDAP = ({
	ldapSettingsUrl,
	currentColorScheme,
	isLdapAvailable,
	load,
	isMobileView,
	isLdapEnabled,
	setScrollToSettings,
	showPortalSettingsLoader,
}) => {
	const { t, ready } = useTranslation(["Ldap", "Settings", "Common"]);
	const [isSmallWindow, setIsSmallWindow] = useState(false);
	const navigate = useNavigate();

	const onCheckView = () => {
		if (isDesktop && window.innerWidth < 795) {
			setIsSmallWindow(true);
		} else {
			setIsSmallWindow(false);
		}
	};

	const onGoToInvitationSettings = () => {
		if (!isMobile()) setScrollToSettings(true);
		navigate(`/portal-settings/security/access-portal/invitation-settings`);
	};

	useEffect(() => {
		onCheckView();
		if (ready) setDocumentTitle(t("Ldap:LdapSettings"));
		window.addEventListener("resize", onCheckView);

		return () => window.removeEventListener("resize", onCheckView);
	}, [isLdapAvailable, load, t, ready]);

	if ((showPortalSettingsLoader && isLdapAvailable) || !ready)
		return <LdapLoader />;

	const link = `${`${t("Settings:ManagementCategorySecurity")} > ${t("Settings:InvitationSettings")}.`}`;

	return (
		<StyledLdapPage isSmallWindow={isSmallWindow}>
			<Text className="intro-text settings_unavailable">
				<Trans
					t={t}
					i18nKey="LdapIntegrationDescription"
					ns="Ldap"
					values={{
						productName: getBrandName("ProductName"),
						sectionName: t("Common:Contacts"),
						link,
					}}
					components={{
						1: (
							<Link
								fontSize="13px"
								fontWeight="600"
								lineHeight="20px"
								color={currentColorScheme?.main?.accent}
								isHovered
								onClick={onGoToInvitationSettings}
								dataTestId="invitation_settings_link"
							/>
						),
					}}
				/>
			</Text>
			<div className="settings_unavailable-box">
				{ldapSettingsUrl ? (
					<Link
						color={currentColorScheme.main.accent}
						isHovered
						target="_blank"
						href={ldapSettingsUrl}
						dataTestId="ldap_settings_link"
						fontWeight={600}
					>
						{t("Common:LearnMore")}
					</Link>
				) : null}
			</div>

			{isMobileView ? (
				<LdapMobileView
					isLdapEnabled={isLdapEnabled}
					isLDAPAvailable={isLdapAvailable}
				/>
			) : (
				<>
					<ToggleLDAP />

					<SettingsContainerSection />

					<StyledSettingsSeparator />

					<SyncContainerSection />
				</>
			)}
		</StyledLdapPage>
	);
};

export default inject(
	({ ldapStore, settingsStore, currentQuotaStore, clientLoadingStore }) => {
		const { isLdapAvailable } = currentQuotaStore;
		const {
			ldapSettingsUrl,
			currentColorScheme,
			currentDeviceType,
			setScrollToSettings,
		} = settingsStore;
		const { load, isLdapEnabled, isLoaded } = ldapStore;

		const { showPortalSettingsLoader } = clientLoadingStore;

		const isMobileView = currentDeviceType === DeviceType.mobile;

		return {
			ldapSettingsUrl,
			currentColorScheme,
			isLdapAvailable,
			load,
			isMobileView,
			isLdapEnabled,
			isLoaded,
			setScrollToSettings,
			showPortalSettingsLoader,
		};
	},
)(observer(LDAP));
