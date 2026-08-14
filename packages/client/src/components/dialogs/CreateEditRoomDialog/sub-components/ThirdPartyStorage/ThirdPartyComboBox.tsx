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

import React, { useEffect, useState } from "react";
import { ReactSVG } from "react-svg";
import { isMobileOnly, isMobile } from "react-device-detect";
import { TFunction } from "i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Text } from "@docspace/ui-kit/components/text";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { TConnectingStorage } from "@docspace/shared/api/files/types";
import { getOAuthToken } from "@docspace/ui-kit/utils/get-oauth-token";

import {
	THIRD_PARTY_SERVICES_URL,
	ThirdPartyServicesUrlName,
} from "@docspace/shared/constants";
import { isDesktop } from "@docspace/shared/utils";
import api from "@docspace/shared/api";
import { TRoomStorageLocation } from "@docspace/shared/utils/rooms";

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { connectedCloudsTypeTitleTranslation as ProviderKeyTranslation } from "SRC_DIR/helpers/filesUtils";
import { ThirdPartyStore } from "SRC_DIR/store/ThirdPartyStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";

import styles from "../../CreateEditRoomDialog.module.scss";

type ThirdPartyComboBoxProps = {
	t: TFunction;

	storageLocation: TRoomStorageLocation;
	onChangeStorageLocation: (value: TRoomStorageLocation) => void;
	onChangeProvider: (value: TConnectingStorage) => void;
	setConnectDialogVisible: (value: boolean) => void;
	setRoomCreation: (value: boolean) => void;

	saveThirdpartyResponse: DialogsStore["saveThirdpartyResponse"];

	setSaveThirdpartyResponse: DialogsStore["setSaveThirdpartyResponse"];
	setConnectItem: DialogsStore["setConnectItem"];

	setIsOauthWindowOpen: (value: boolean) => void;

	openConnectWindow: ThirdPartyStore["openConnectWindow"];
	connectItems: ThirdPartyStore["connectingStorages"];

	isDisabled: boolean;
	isAdmin: boolean;
};

const ThirdPartyComboBox = ({
	t,

	storageLocation,
	onChangeStorageLocation,
	onChangeProvider,

	connectItems,
	setConnectDialogVisible,
	setRoomCreation,

	saveThirdpartyResponse,
	setSaveThirdpartyResponse,
	openConnectWindow,
	setConnectItem,

	setIsOauthWindowOpen,

	isDisabled,
	isAdmin,
}: ThirdPartyComboBoxProps) => {
	const defaultSelectedItem = {
		key: "length",
		label:
			storageLocation?.provider?.title ||
			t("ThirdPartyStorageComboBoxPlaceholder"),
	};

	const [selectedItem, setSelectedItem] = useState(defaultSelectedItem);

	const thirdparties = connectItems.map((item) => ({
		...item,
		title: ProviderKeyTranslation(item.providerKey, t),
	}));

	const setStorageLocaiton = (
		thirparty: TConnectingStorage,
		isConnected?: boolean,
	) => {
		if (!isConnected) {
			window.open(
				`${THIRD_PARTY_SERVICES_URL}${ThirdPartyServicesUrlName[thirparty.id! as keyof typeof ThirdPartyServicesUrlName]}`,
				"_blank",
			);
			return;
		}
		onChangeProvider(thirparty);
	};

	const onShowService = async () => {
		setRoomCreation(true);
		const provider = storageLocation.provider;

		if (storageLocation.provider?.isOauth) {
			setIsOauthWindowOpen(true);
			const authModal = window.open(
				"",
				t("Common:Authorization"),
				"height=600, width=1020",
			);
			openConnectWindow(provider!.providerKey!, authModal).then((modal) =>
				getOAuthToken(modal)
					.then((token) =>
						api.files
							.saveThirdParty(
								provider!.oauthHref!,
								"",
								"",
								token,
								false,
								ProviderKeyTranslation(provider!.providerKey, t),
								provider!.providerKey!,
								"",
								true,
							)
							.then((res: unknown) => setSaveThirdpartyResponse(res)),
					)
					.catch((e) => {
						if (!e) return;
						toastr.error(e);
						console.error(e);
					})
					.finally(() => {
						authModal?.close();
						setIsOauthWindowOpen(false);
					}),
			);
		} else {
			const providerTitle = ProviderKeyTranslation(provider!.providerKey, t);
			setConnectItem({
				title: providerTitle,
				customer_title: providerTitle,
				provider_key: provider!.providerKey,
			});
			setConnectDialogVisible(true);
		}
	};

	useEffect(() => {
		if (!(saveThirdpartyResponse as unknown as { id: string })?.id) return;
		onChangeStorageLocation({
			...storageLocation,
			thirdpartyAccount: saveThirdpartyResponse,
			storageFolderId: (saveThirdpartyResponse as unknown as { id: string }).id,
		});
		setSaveThirdpartyResponse(null);
	}, [saveThirdpartyResponse]);

	const onSelect = (
		event: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
	) => {
		const data = event.currentTarget.dataset;

		const thirdparty = thirdparties.find((elm) => {
			return elm.id === data.thirdPartyId;
		});

		thirdparty && setStorageLocaiton(thirdparty, thirdparty?.isConnected);
		thirdparty?.isConnected
			? setSelectedItem({ key: thirdparty.id!, label: thirdparty.title })
			: setSelectedItem({ ...defaultSelectedItem });
	};

	const getTextTooltip = () => {
		return (
			<Text fontSize="12px" noSelect>
				{t("Common:EnableThirdPartyIntegration")}
			</Text>
		);
	};

	const advancedOptions = thirdparties
		.sort((storage) => {
			return storage.isConnected ? -1 : 1;
		})
		?.map((item) => {
			const disabled = !item.isConnected && !isAdmin;
			const itemLabel =
				item.title +
				(item.isConnected ? "" : ` (${t("Common:ActivationRequired")})`);

			const disabledData = disabled
				? { "data-tooltip-id": "file-links-tooltip", "data-tip": "tooltip" }
				: {};

			return (
				<div
					className={`${styles.comboBoxItem}${disabled ? ` ${styles.isDisabled}` : ""}`}
					key={item.id}
				>
					<DropDownItem
						onClick={onSelect}
						data-third-party-id={item.id}
						disabled={disabled}
						testId={`drop_down_item_${item.id}`}
						{...disabledData}
					>
						<Text className="drop-down-item_text" fontWeight={600}>
							{itemLabel}
						</Text>

						{!disabled && !item.isConnected ? (
							<ReactSVG
								src={ExternalLinkReactSvgUrl}
								className="drop-down-item_icon"
							/>
						) : null}
					</DropDownItem>
					{disabled ? (
						<Tooltip
							float={isDesktop()}
							id="file-links-tooltip"
							getContent={getTextTooltip}
							place="bottom"
						/>
					) : null}
				</div>
			);
		});

	return (
		<div className={styles.storageLocation}>
			<div className="set_room_params-thirdparty">
				<ComboBox
					className="thirdparty-combobox"
					selectedOption={selectedItem}
					options={[]}
					advancedOptions={
						<>
							{advancedOptions}
							<div />
						</>
					}
					scaled
					withBackdrop={isMobile}
					size="content"
					manualWidth="auto"
					isMobileView={isMobileOnly}
					directionY="both"
					displaySelectedOption
					noBorder={false}
					isDefaultMode
					hideMobileView={false}
					forceCloseClickOutside
					scaledOptions
					showDisabledItems
					displayArrow
					dataTestId="create_edit_room_thirdparty_combobox"
				/>
				<Button
					id="shared_third-party-storage_connect"
					isDisabled={
						!storageLocation?.provider ||
						!!storageLocation?.thirdpartyAccount ||
						isDisabled
					}
					className="set_room_params-thirdparty-connect"
					size={ButtonSize.small}
					label={t("Common:Connect")}
					onClick={onShowService}
					testId="create_edit_room_thirdparty_connect"
				/>
			</div>
		</div>
	);
};

export default ThirdPartyComboBox;
