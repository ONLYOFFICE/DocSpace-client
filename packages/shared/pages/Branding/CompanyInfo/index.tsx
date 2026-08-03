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

import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";

import { Link } from "@docspace/ui-kit/components/link";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
	TextInput,
	InputType,
	InputSize,
} from "@docspace/ui-kit/components/text-input";

import { Checkbox } from "@docspace/ui-kit/components/checkbox";

import { SaveCancelButtons } from "../../../components/save-cancel-buttons";
import { AboutDialog } from "../../../components/about-dialog";

import { ICompanyInfo } from "./CompanyInfo.types";
import { useCompanySettings } from "./useCompanySettings";
import styles from "./CompanyInfo.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const CompanyInfo = ({
	isSettingPaid,
	companySettings,
	onSave,
	onRestore,
	isLoading,
	companyInfoSettingsIsDefault,
	displayAbout,
	isBrandingAvailable,
	buildVersionInfo,
	standalone,
	licenseAgreementsUrl,
	isEnterprise,
	logoText,
}: ICompanyInfo) => {
	const { t } = useTranslation("Common");
	const [isAboutDialogVisible, setIsAboutDialogVisible] = useState(false);

	const {
		address,
		companyName,
		email,
		phone,
		site,
		displayAbout: showAbout,
		companySettingsError,
		hasChanges,
		onChangeAddress,
		onChangeCompanyName,
		onChangeEmail,
		onChangePhone,
		onChangeSite,
		onChangeDisplayAbout,
		reset,
	} = useCompanySettings({
		companySettings,
		displayAbout,
	});

	const onSaveAction = () => {
		onSave(address, companyName, email, phone, site, !showAbout);
	};

	const onRestoreAction = () => {
		reset();
		onRestore();
	};

	const {
		address: hasErrorAddress,
		companyName: hasErrorCompanyName,
		email: hasErrorEmail,
		phone: hasErrorPhone,
		site: hasErrorSite,
	} = companySettingsError;

	const isDisabled =
		hasErrorAddress ||
		hasErrorCompanyName ||
		hasErrorEmail ||
		hasErrorPhone ||
		hasErrorSite;

	const link = t("Common:AboutCompanyTitle");

	const showExample = () => {
		if (!isSettingPaid) return;
		setIsAboutDialogVisible(true);
	};

	return (
		<>
			<AboutDialog
				visible={isAboutDialogVisible}
				onClose={() => setIsAboutDialogVisible(false)}
				buildVersionInfo={buildVersionInfo}
				previewData={companySettings}
				companyInfoSettingsData={companySettings}
				standalone={standalone}
				licenseAgreementsUrl={licenseAgreementsUrl}
				isEnterprise={isEnterprise}
				logoText={logoText}
			/>
			<div
				className={classNames(styles.companyInfo, {
					[styles.isSettingPaid]: isSettingPaid,
					["isEnableBranding"]: !isSettingPaid,
					["settings_unavailable"]: !isSettingPaid,
				})}
			>
				<div
					className={classNames(
						styles.sectionDescription,
						"section-description",
					)}
				>
					{t("BrandingSectionDescription", {
						productName: getBrandName("ProductName"),
					})}
				</div>
				<div className={classNames(styles.header, "header")}>
					{t("CompanyInfoSettings")}
				</div>
				<div className={classNames(styles.description, "description")}>
					{isSettingPaid ? (
						<Trans
							t={t}
							i18nKey="CompanyInfoSettingsDescription"
							ns="Common"
							values={{ link }}
							components={{
								1: (
									<Link
										key="component_key"
										className={classNames(styles.link, "link")}
										onClick={showExample}
										noHover
										dataTestId="company_info_settings_link"
									/>
								),
							}}
						/>
					) : (
						<Trans
							t={t}
							i18nKey="CompanyInfoSettingsDescription"
							ns="Common"
							values={{ link }}
							components={{
								1: (
									<span
										key="component_key"
										className={classNames(styles.link, "link")}
									/>
								),
							}}
						/>
					)}
				</div>
				<div className={classNames(styles.settingsBlock, "settings-block")}>
					<FieldContainer>
						<Checkbox
							isDisabled={!isBrandingAvailable || !isSettingPaid}
							isChecked={showAbout}
							onChange={onChangeDisplayAbout}
							dataTestId="show-about-window-checkbox"
							label={t("Common:ShowAboutWindow")}
						/>
					</FieldContainer>

					<FieldContainer
						id="fieldContainerCompanyName"
						className="field-container-width"
						labelText={t("Common:CompanyName")}
						isVertical
					>
						<TextInput
							id="textInputContainerCompanyName"
							name="company_name"
							testId="company_info_settings_company_name_input"
							className={classNames(styles.textInput, "text-input")}
							isDisabled={!isSettingPaid}
							scale
							value={companyName}
							hasError={hasErrorCompanyName}
							onChange={onChangeCompanyName}
							type={InputType.text}
							size={InputSize.base}
						/>
					</FieldContainer>
					<FieldContainer
						id="fieldContainerEmail"
						className="field-container-width"
						labelText={t("Common:Email")}
						isVertical
					>
						<TextInput
							id="textInputContainerEmail"
							name="company_email"
							testId="company_info_settings_email_input"
							className={classNames(styles.textInput, "text-input")}
							isDisabled={!isSettingPaid}
							scale
							value={email}
							hasError={hasErrorEmail}
							onChange={onChangeEmail}
							type={InputType.text}
							size={InputSize.base}
						/>
					</FieldContainer>
					<FieldContainer
						id="fieldContainerPhone"
						className="field-container-width"
						labelText={t("Common:Phone")}
						isVertical
					>
						<TextInput
							id="textInputContainerPhone"
							name="company_phone"
							testId="company_info_settings_phone_input"
							className={classNames(styles.textInput, "text-input")}
							isDisabled={!isSettingPaid}
							scale
							value={phone}
							hasError={hasErrorPhone}
							onChange={onChangePhone}
							type={InputType.text}
							size={InputSize.base}
						/>
					</FieldContainer>
					<FieldContainer
						id="fieldContainerWebsite"
						className="field-container-width"
						labelText={t("Common:Website")}
						isVertical
					>
						<TextInput
							id="textInputContainerWebsite"
							name="company_website"
							testId="company_info_settings_site_input"
							className={classNames(styles.textInput, "text-input")}
							isDisabled={!isSettingPaid}
							scale
							value={site}
							hasError={hasErrorSite}
							onChange={onChangeSite}
							type={InputType.text}
							size={InputSize.base}
						/>
					</FieldContainer>
					<FieldContainer
						id="fieldContainerAddress"
						className="field-container-width"
						labelText={t("Common:Address")}
						isVertical
					>
						<TextInput
							id="textInputContainerAddress"
							name="company_address"
							testId="company_info_settings_address_input"
							className={classNames(styles.textInput, "text-input")}
							isDisabled={!isSettingPaid}
							scale
							value={address}
							hasError={hasErrorAddress}
							onChange={onChangeAddress}
							type={InputType.text}
							size={InputSize.base}
						/>
					</FieldContainer>
				</div>
				<SaveCancelButtons
					className={classNames(
						styles.saveCancelButtons,
						"save-cancel-buttons",
					)}
					onSaveClick={onSaveAction}
					onCancelClick={onRestoreAction}
					saveButtonLabel={t("Common:SaveButton")}
					cancelButtonLabel={t("Common:Restore")}
					reminderText={t("Common:YouHaveUnsavedChanges")}
					displaySettings
					saveButtonDisabled={isDisabled}
					hasScroll
					hideBorder
					showReminder={(isSettingPaid && hasChanges) || isLoading}
					disableRestoreToDefault={companyInfoSettingsIsDefault || isLoading}
					additionalClassSaveButton="company-info-save"
					additionalClassCancelButton="company-info-cancel"
					saveButtonDataTestId="company_info_settings_save_button"
					cancelButtonDataTestId="company_info_settings_cancel_button"
				/>
			</div>
		</>
	);
};
