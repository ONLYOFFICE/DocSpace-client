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

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";

import {
	LogoutSessionDialog,
	LogoutAllSessionDialog,
} from "SRC_DIR/components/dialogs";
import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";

import SessionsTable from "./SessionsTable";
import styles from "./active-sessions.module.scss";

const ActiveSessions = ({
	t,
	getAllSessions,
	removeAllSessions,
	removeSession,
	logoutDialogVisible,
	setLogoutDialogVisible,
	logoutAllDialogVisible,
	setLogoutAllDialogVisible,
	removeAllExecptThis,
	sessions,
	viewAs,
	setViewAs,
	currentDeviceType,
	setSessions,
	platformModalData,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	useViewEffect({
		view: viewAs,
		setView: setViewAs,
		currentDeviceType,
	});

	const onClickRemoveAllSessions = async () => {
		try {
			setIsLoading(true);
			await removeAllSessions().then((res) => window.location.replace(res));
		} catch (error) {
			toastr.error(error);
		} finally {
			setIsLoading(false);
			setLogoutAllDialogVisible(false);
		}
	};

	const onClickRemoveAllExceptThis = async () => {
		try {
			setIsLoading(true);
			await removeAllExecptThis().then(() =>
				getAllSessions().then((res) => setSessions(res.items)),
			);
		} catch (error) {
			toastr.error(error);
		} finally {
			setIsLoading(false);
			setLogoutAllDialogVisible(false);
		}
	};

	const onClickRemoveSession = async (id) => {
		const foundSession = sessions.find((s) => s.id === id);
		try {
			setIsLoading(true);
			await removeSession(foundSession.id).then(() =>
				getAllSessions().then((res) => setSessions(res.items)),
			);
			toastr.success(
				t("Profile:SuccessLogout", {
					platform: foundSession.platform,
					browser: foundSession.browser,
				}),
			);
		} catch (error) {
			toastr.error(error);
		} finally {
			setIsLoading(false);
			setLogoutDialogVisible(false);
		}
	};

	const tooltipContent = (
		<Text fontSize="12px">
			{t("Profile:LogoutAllActiveSessionsDescription")}
		</Text>
	);

	return (
		<div>
			<Text fontSize="16px" fontWeight={700} lineHeight="22px">
				{t("Profile:ActiveSessions")}
			</Text>

			{/* TODO: Uncomment after fix on backend */}
			{/* <Text className={styles.autoDeleteTitle}>{t("Profile:AutoDeleteTitle")}</Text> */}

			<div className={styles.terminateSessionContainer}>
				<Link
					className={styles.terminateAllSessions}
					type="action"
					isHovered
					onClick={() => setLogoutAllDialogVisible(true)}
					dataTestId="terminate_all_sessions_link"
				>
					{t("Profile:TerminateAllSessions")}
				</Link>
				<HelpButton
					offsetRight={0}
					iconName={InfoReactSvgUrl}
					tooltipContent={tooltipContent}
					dataTestId="terminate_all_sessions_help_button"
				/>
			</div>

			<SessionsTable t={t} sessionsData={sessions} viewAs={viewAs} />

			{logoutDialogVisible ? (
				<LogoutSessionDialog
					t={t}
					visible={logoutDialogVisible}
					data={platformModalData}
					isLoading={isLoading}
					onClose={() => setLogoutDialogVisible(false)}
					onRemoveSession={onClickRemoveSession}
				/>
			) : null}

			{logoutAllDialogVisible ? (
				<LogoutAllSessionDialog
					t={t}
					visible={logoutAllDialogVisible}
					isLoading={isLoading}
					onClose={() => setLogoutAllDialogVisible(false)}
					onRemoveAllSessions={onClickRemoveAllSessions}
					onRemoveAllExceptThis={onClickRemoveAllExceptThis}
				/>
			) : null}
		</div>
	);
};

export default inject(({ settingsStore, setup }) => {
	const { currentDeviceType } = settingsStore;

	const {
		getAllSessions,
		removeAllSessions,
		removeSession,
		logoutDialogVisible,
		setLogoutDialogVisible,
		logoutAllDialogVisible,
		setLogoutAllDialogVisible,
		removeAllExecptThis,
		sessions,
		viewAs,
		setViewAs,
		setSessions,
		platformModalData,
	} = setup;
	return {
		getAllSessions,
		removeAllSessions,
		removeSession,
		logoutDialogVisible,
		setLogoutDialogVisible,
		logoutAllDialogVisible,
		setLogoutAllDialogVisible,
		removeAllExecptThis,
		sessions,
		viewAs,
		setViewAs,
		setSessions,
		currentDeviceType,
		platformModalData,
	};
})(observer(withTranslation(["Profile", "Common"])(ActiveSessions)));
