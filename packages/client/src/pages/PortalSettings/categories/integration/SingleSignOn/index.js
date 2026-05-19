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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";

import classnames from "classnames";

import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import { DeviceType } from "@docspace/shared/enums";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import HideButton from "./sub-components/HideButton";
import { SPSettingsSection } from "./SPSettings";
import { ProviderMetadataSection } from "./ProviderMetadata";
import ssoPageStyles from "./styled-containers/StyledSsoPageContainer.module.scss";
import ToggleSSO from "./sub-components/ToggleSSO";
import SSOLoader from "./sub-components/ssoLoader";

import MobileView from "./MobileView";

const SERVICE_PROVIDER_SETTINGS = "serviceProviderSettings";
const SP_METADATA = "spMetadata";

const SingleSignOn = (props) => {
	const {
		serviceProviderSettings,
		spMetadata,
		isSSOAvailable,
		currentDeviceType,
		logoText,
		showPortalSettingsLoader,
		singleSignOnUrl,
		currentColorScheme,
	} = props;
	const { t, ready } = useTranslation(["SingleSignOn", "Settings"]);
	const isMobileView = currentDeviceType === DeviceType.mobile;

	useEffect(() => {
		if (ready) setDocumentTitle(t("Settings:SingleSignOn"));
	}, [ready]);

	if ((showPortalSettingsLoader && !isMobileView && isSSOAvailable) || !ready)
		return <SSOLoader />;

	return (
		<div
			className={classnames(ssoPageStyles.styledSsoPage, {
				[ssoPageStyles.withoutExternalLink]: !singleSignOnUrl,
			})}
			style={{
				"--service-provider-display": serviceProviderSettings ? "block" : "none",
				"--sp-metadata-display": spMetadata ? "block" : "none",
			}}
		>
			<Text className="intro-text settings_unavailable">{t("SsoIntro")}</Text>

			{singleSignOnUrl ? (
				<Link
					className="link-learn-more"
					color={currentColorScheme.main?.accent}
					target="_blank"
					isHovered
					href={singleSignOnUrl}
					fontWeight={600}
				>
					{t("Common:LearnMore")}
				</Link>
			) : null}

			{isMobileView ? (
				<MobileView isSSOAvailable={isSSOAvailable} logoText={logoText} />
			) : (
				<>
					<ToggleSSO />

					<HideButton
						id="sp-settings-hide-button"
						text={t("ServiceProviderSettings", {
							organizationName: logoText,
						})}
						label={SERVICE_PROVIDER_SETTINGS}
						value={serviceProviderSettings}
						dataTestId="sp_settings_hide_button"
						// isDisabled={!isSSOAvailable}
					/>

					<SPSettingsSection />
					<StyledSettingsSeparator />

					<HideButton
						id="sp-metadata-hide-button"
						text={t("SpMetadata", {
							organizationName: logoText,
						})}
						label={SP_METADATA}
						value={spMetadata}
						dataTestId="sp_metadata_hide_button"
						// isDisabled={!isSSOAvailable}
					/>

					<div className="sp-metadata">
						<ProviderMetadataSection />
					</div>
				</>
			)}
		</div>
	);
};

export default inject(
	({ settingsStore, ssoStore, currentQuotaStore, clientLoadingStore }) => {
		const { isSSOAvailable } = currentQuotaStore;
		const { currentDeviceType, logoText, singleSignOnUrl, currentColorScheme } =
			settingsStore;

		const { serviceProviderSettings, spMetadata } = ssoStore;

		const { showPortalSettingsLoader } = clientLoadingStore;

		return {
			serviceProviderSettings,
			spMetadata,
			isSSOAvailable,
			currentDeviceType,
			logoText,
			showPortalSettingsLoader,
			singleSignOnUrl,
			currentColorScheme,
		};
	},
)(observer(SingleSignOn));
