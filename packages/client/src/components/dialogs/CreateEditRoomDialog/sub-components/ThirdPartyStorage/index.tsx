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

import React, { useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { TFunction } from "i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { ThirdPartyStore } from "SRC_DIR/store/ThirdPartyStore";
import { TRoomStorageLocation } from "@docspace/shared/utils/rooms";
import { TConnectingStorage } from "@docspace/shared/api/files/types";

import { StyledParam } from "SRC_DIR/components/CreateEditDialogParams/StyledParam";
import ToggleParam from "SRC_DIR/components/CreateEditDialogParams/ToggleParam";
import styles from "SRC_DIR/components/dialogs/CreateEditRoomDialog/CreateEditRoomDialog.module.scss";

import ThirdPartyComboBox from "./ThirdPartyComboBox";
import FolderInput from "./FolderInput";

type ThirdPartyStorageProps = {
	t: TFunction;
	roomTitle: string;

	storageLocation: TRoomStorageLocation;
	onChangeStorageLocation: (value: TRoomStorageLocation) => void;

	setIsOauthWindowOpen: (value: boolean) => void;

	createNewFolderIsChecked: boolean;
	onCreateFolderChange: (value: React.ChangeEvent<HTMLInputElement>) => void;

	isDisabled: boolean;
	isRoomAdmin?: boolean;
	isAdmin?: boolean;

	currentColorScheme?: SettingsStore["currentColorScheme"];

	setRoomCreation?: DialogsStore["setRoomCreation"];
	setConnectItem?: DialogsStore["setConnectItem"];
	setConnectDialogVisible?: DialogsStore["setConnectDialogVisible"];
	setSaveThirdpartyResponse?: DialogsStore["setSaveThirdpartyResponse"];
	saveThirdpartyResponse?: DialogsStore["saveThirdpartyResponse"];

	openConnectWindow?: ThirdPartyStore["openConnectWindow"];
	deleteThirdParty?: ThirdPartyStore["deleteThirdParty"];
	fetchConnectingStorages?: ThirdPartyStore["fetchConnectingStorages"];
	connectItems?: ThirdPartyStore["connectingStorages"];
};

const ThirdPartyStorage = ({
	t,

	roomTitle,
	storageLocation,
	onChangeStorageLocation,

	setIsOauthWindowOpen,

	connectItems,
	setConnectDialogVisible,
	setRoomCreation,
	saveThirdpartyResponse,
	setSaveThirdpartyResponse,
	deleteThirdParty,
	openConnectWindow,
	setConnectItem,

	isDisabled,
	currentColorScheme,
	isRoomAdmin,
	isAdmin,
	createNewFolderIsChecked,
	onCreateFolderChange,

	fetchConnectingStorages,
}: ThirdPartyStorageProps) => {
	const channel = useRef(new BroadcastChannel("thirdpartyActivation"));
	channel.current.onmessage = (shouldRender) => {
		shouldRender && fetchConnectingStorages!();
	};

	const onChangeIsThirdparty = () => {
		if (isDisabled) return;

		if (!connectItems?.length) {
			const data = isRoomAdmin ? (
				<Text as="p">
					{t("ThirdPartyStorageRoomAdminNoStorageAlert")}
				</Text>
			) : (
				<Text as="p">
					{t("ThirdPartyStorageNoStorageAlert")}{" "}
					<Link
						href="/portal-settings/integration/third-party-services"
						type={LinkType.page}
						noHover
						color={currentColorScheme?.main?.accent ?? undefined}
					>
						{t("Translations:ThirdPartyTitle")}
					</Link>
				</Text>
			);

			toastr.warning(data, "", 5000, true, false);

			return;
		}

		onChangeStorageLocation({
			...storageLocation,
			isThirdparty: !storageLocation.isThirdparty,
		});
	};

	const onChangeProvider = async (provider: TConnectingStorage) => {
		if (storageLocation.thirdpartyAccount) {
			onChangeStorageLocation({
				...storageLocation,
				provider,
				thirdpartyAccount: null,
			});
			await deleteThirdParty!(
				(storageLocation.thirdpartyAccount as { providerId: string })
					.providerId,
			);
			return;
		}

		onChangeStorageLocation({ ...storageLocation, provider });
	};

	const onChangeStorageFolderId = (storageFolderId: string) =>
		onChangeStorageLocation({
			...storageLocation,
			storageFolderId,
		});

	useEffect(() => {
		fetchConnectingStorages!();
	}, []);

	return (
		<StyledParam className={styles.thirdPartyStorage}>
			<ToggleParam
				id="shared_third-party-storage-toggle"
				title={t("Common:ThirdPartyStorage")}
				description={t("Common:ThirdPartyStorageDescription")}
				isChecked={storageLocation.isThirdparty ?? false}
				onCheckedChange={onChangeIsThirdparty}
			/>

			{storageLocation.isThirdparty ? (
				<ThirdPartyComboBox
					t={t}
					storageLocation={storageLocation}
					onChangeStorageLocation={onChangeStorageLocation}
					onChangeProvider={onChangeProvider}
					connectItems={connectItems!}
					setConnectDialogVisible={setConnectDialogVisible!}
					setRoomCreation={setRoomCreation!}
					saveThirdpartyResponse={saveThirdpartyResponse!}
					setSaveThirdpartyResponse={setSaveThirdpartyResponse!}
					openConnectWindow={openConnectWindow!}
					setConnectItem={setConnectItem!}
					setIsOauthWindowOpen={setIsOauthWindowOpen}
					isDisabled={isDisabled}
					isAdmin={isAdmin!}
				/>
			) : null}

			{storageLocation.isThirdparty && storageLocation.thirdpartyAccount ? (
				<>
					<FolderInput
						t={t}
						roomTitle={roomTitle}
						thirdpartyAccount={
							storageLocation.thirdpartyAccount as Record<string, unknown>
						}
						onChangeStorageFolderId={onChangeStorageFolderId}
						isDisabled={isDisabled}
						createNewFolderIsChecked={createNewFolderIsChecked}
					/>

					<Checkbox
						className="create-new-folder_checkbox"
						label={t("Files:CreateNewFolderInStorage")}
						isChecked={createNewFolderIsChecked}
						onChange={onCreateFolderChange}
					/>
				</>
			) : null}
		</StyledParam>
	);
};

export default inject(
	({ authStore, settingsStore, filesSettingsStore, dialogsStore }: TStore) => {
		const { currentColorScheme } = settingsStore;

		const {
			openConnectWindow,
			deleteThirdParty,
			connectingStorages: connectItems,
			fetchConnectingStorages,
		} = filesSettingsStore.thirdPartyStore;

		const {
			setConnectItem,
			setConnectDialogVisible,
			setRoomCreation,
			setSaveThirdpartyResponse,
			saveThirdpartyResponse,
		} = dialogsStore;

		const { isRoomAdmin, isAdmin } = authStore;

		return {
			connectItems,

			setConnectDialogVisible,
			setRoomCreation,

			deleteThirdParty,

			saveThirdpartyResponse,
			setSaveThirdpartyResponse,

			openConnectWindow,
			setConnectItem,
			currentColorScheme,
			isRoomAdmin,
			isAdmin,
			fetchConnectingStorages,
		};
	},
)(observer(ThirdPartyStorage));
