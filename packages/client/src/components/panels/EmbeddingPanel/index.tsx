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

import { useState, useEffect, useCallback, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import copy from "copy-to-clipboard";
import isEqual from "lodash/isEqual";
import { objectToGetParams } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import pkg from "PACKAGE_FILE";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFunction } from "i18next";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";
import { type TData } from "@docspace/ui-kit/components/toast";
import type { TFileLink } from "@docspace/shared/api/files/types";
import type { LinkParamsType, TTranslation } from "@docspace/shared/types";
import { TColorScheme, TTheme } from "@docspace/ui-kit/providers/theme/themes";
import {
	ModalDialog,
	ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { getExternalLinks } from "@docspace/shared/api/files";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import HeaderUrl from "PUBLIC_DIR/images/sdk-presets_header.react.svg?url";
import HeaderDarkUrl from "PUBLIC_DIR/images/sdk-presets_header_dark.png";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import styles from "./EmbeddingPanel.module.scss";

import { DisplayBlock } from "./sub-components/DisplayBlock";
import { CheckboxElement } from "./sub-components/CheckboxElement";
import { getBrandName } from "@docspace/shared/constants/brands";

type LinkParamsLinkShareToType = {
	denyDownload: boolean;
	id: string;
	internal: boolean;
	isExpired: boolean;
	linkType: number;
	primary: boolean;
	requestToken: string;
	shareLink: string;
	title: string;
	password?: string;
};

type LinkParamsLinkType = {
	access: number;
	canEditAccess: boolean;
	isLocked: boolean;
	isOwner: boolean;
	sharedTo?: LinkParamsLinkShareToType;
	subjectType: number;
};

type EmbeddingPanelProps = {
	t: TTranslation;
	theme: TTheme;
	requestToken: string;
	visible: boolean;
	setEmbeddingPanelData: (value: {
		visible: boolean;
		itemId?: string | number;
	}) => void;
	setEditLinkPanelIsVisible: (value: boolean) => void;
	currentColorScheme: TColorScheme;
	linkParams: LinkParamsType;
	setLinkParams: (linkParams: LinkParamsType) => void;
	fetchExternalLinks: (id: string | number) => Promise<LinkParamsLinkType[]>;
	isAdmin: boolean;
	itemId?: string | number;
	isRoom: boolean;
};

type TOptionType = TOption & {
	sharedTo: LinkParamsLinkShareToType;
};

const EmbeddingPanelComponent = (props: EmbeddingPanelProps) => {
	const {
		t,
		theme,
		visible,
		setEmbeddingPanelData,
		setEditLinkPanelIsVisible,
		currentColorScheme,
		linkParams,
		setLinkParams,
		fetchExternalLinks,
		isAdmin,
		itemId,
		isRoom,
	} = props;

	const { link } = linkParams;

	const [sharedLinksOptions, setSharedLinksOptions] = useState<TOptionType[]>(
		[],
	);
	const [selectedLink, setSelectedLink] = useState<TOptionType>();
	const [barIsVisible, setBarIsVisible] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	const dataDimensions = [
		{ key: "percent", label: "%", default: true },
		{ key: "pixel", label: "px" },
	];

	const [widthValue, setWidthValue] = useState("100");
	const [widthDimension, setWidthDimension] = useState<TOption>(
		dataDimensions[0],
	);
	const [heightValue, setHeightValue] = useState("820");
	const [heightDimension, setHeightDimension] = useState<TOption>(
		dataDimensions[1],
	);

	const fileConfig = {
		src: window.location.origin,
		frameId: "ds-frame",
		mode: "editor",
		id: itemId,
		width: `${widthValue}${dataDimensions[0].label}`,
		height: `${heightValue}${dataDimensions[1].label}`,
		init: true,
		showTitle: false,
		showFilter: false,
		requestToken: link?.sharedTo?.requestToken,
	};

	const roomConfig = {
		src: window.location.origin,
		frameId: "ds-frame",
		mode: "public-room",
		id: linkParams.item.id,
		width: `${widthValue}${dataDimensions[0].label}`,
		height: `${heightValue}${dataDimensions[1].label}`,
		showHeader: true,
		showTitle: true,
		showMenu: false,
		showFilter: true,
		requestToken: link?.sharedTo?.requestToken,
		init: true,
	};

	const isFile = itemId && !isRoom;

	const [embeddingConfig, setEmbeddingConfig] = useState(
		isFile ? fileConfig : roomConfig,
	);

	const params = objectToGetParams(embeddingConfig);
	const codeBlock = `<div id="${embeddingConfig.frameId}">Fallback text</div>\n<script src="${SDK_SCRIPT_URL}${params}"></script>`;

	const currentLink = selectedLink ?? link;

	const linkTitle = currentLink?.sharedTo?.title;
	const withPassword = currentLink?.sharedTo?.password;
	const denyDownload = currentLink?.sharedTo?.denyDownload;

	const contentRestrictedTitle = t("EmbeddingPanel:ContentRestricted");
	const withPasswordTitle = t("EmbeddingPanel:LinkProtectedWithPassword");

	let barSubTitle = "";

	if (withPassword) {
		barSubTitle = withPasswordTitle;

		if (denyDownload) {
			barSubTitle += ` ${contentRestrictedTitle}`;
		}
	} else {
		barSubTitle = contentRestrictedTitle;
	}

	const showLinkBar =
		currentLink?.sharedTo?.password || currentLink?.sharedTo?.denyDownload;

	const onClose = () => {
		setEmbeddingPanelData({ visible: false });
	};

	const onChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWidthValue(e.target.value);
		setEmbeddingConfig((config) => {
			return { ...config, width: `${e.target.value}${widthDimension.label}` };
		});
	};

	const onChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
		setHeightValue(e.target.value);
		setEmbeddingConfig((config) => {
			return { ...config, height: `${e.target.value}${heightDimension.label}` };
		});
	};

	const onChangeWidthDimension = (option: TOption) => {
		setWidthDimension(option);
		setEmbeddingConfig((config) => {
			return { ...config, width: `${widthValue}${option.label}` };
		});
	};

	const onChangeHeightDimension = (option: TOption) => {
		setHeightDimension(option);
		setEmbeddingConfig((config) => {
			return { ...config, height: `${heightValue}${option.label}` };
		});
	};

	const onCopyLink = () => {
		copy(codeBlock);
		toastr.success(t("EmbeddingPanel:CodeSuccessfullyCopied"));
	};

	const onHeaderChange = () => {
		setEmbeddingConfig((config) => {
			return { ...config, showTitle: !config.showTitle };
		});
	};

	const onTitleChange = () => {
		setEmbeddingConfig((config) => {
			return { ...config, showFilter: !config.showFilter };
		});
	};

	const onCopyAndClose = () => {
		onCopyLink();
		onClose();
	};

	const onEditLink = () => {
		setLinkParams({
			...linkParams,
			link: selectedLink ?? link,
		} as LinkParamsType);
		setEditLinkPanelIsVisible(true);
	};

	const onChangeSharedLink = (option: TOption) => {
		setSelectedLink(option as TOptionType);
		setEmbeddingConfig((config) => {
			return {
				...config,
				requestToken: (option as TOptionType)?.sharedTo?.requestToken,
			};
		});
	};

	const onCloseBar = () => {
		setBarIsVisible(false);
	};

	const onOpenDevTools = () => {
		const url = combineUrl(
			window.location.origin,
			window.ClientConfig?.proxy?.url,
			pkg.homepage,
			"/developer-tools/javascript-sdk",
		);

		window.open(url, "_blank");
	};

	const onKeyPress = (e: KeyboardEvent) => {
		if (e.key === "Esc" || e.key === "Escape") {
			onClose();
		}
	};

	useEffect(() => {
		document.addEventListener("keyup", onKeyPress);
		return () => document.removeEventListener("keyup", onKeyPress);
	});

	const getLinks = useCallback(async () => {
		try {
			setIsLoading(true);

			const links = isFile
				? (await getExternalLinks(linkParams.item.id)).items
				: await fetchExternalLinks(linkParams.item.id);

			if (links && links.length) {
				const linksOptions = links.map((l: LinkParamsLinkType) => {
					return {
						key: l.sharedTo?.id,
						label: l.sharedTo?.title,
						sharedTo: l.sharedTo,
					} as TOptionType;
				});

				setSelectedLink(linksOptions[0]);
				setSharedLinksOptions(linksOptions);

				onChangeSharedLink(linksOptions[0]);
			}
		} catch (error) {
			toastr.error(error as TData);
		} finally {
			setIsLoading(false);
		}
	}, [linkParams.item.id, fetchExternalLinks, isFile]);

	useEffect(() => {
		if (itemId && !link) {
			getLinks();
		}
	}, [itemId, getLinks, link]);

	const usePrevious = (value: TFileLink | null) => {
		const ref = useRef<TFileLink | null>(undefined);
		useEffect(() => {
			ref.current = value;
		});
		return ref.current;
	};

	const prevLink = usePrevious(link ?? null);

	useEffect(() => {
		if (sharedLinksOptions?.length && prevLink && !isEqual(prevLink, link)) {
			const newSharedLinks = [...sharedLinksOptions];
			const newLinkIndex = newSharedLinks.findIndex(
				(l) => l.sharedTo.id === link.sharedTo?.id,
			);

			if (newLinkIndex > -1)
				newSharedLinks[newLinkIndex] = {
					key: link.sharedTo?.id,
					label: link.sharedTo?.title,
					sharedTo: link.sharedTo,
				} as TOptionType;

			setSharedLinksOptions(newSharedLinks);
			setSelectedLink({
				key: link.sharedTo?.id,
				label: link.sharedTo?.title,
				sharedTo: link.sharedTo,
			} as TOptionType);
		}
	}, [link, prevLink, sharedLinksOptions]);

	const barTitle = (
		<div className={styles.embeddingPanelBarHeader}>
			<Link
				isHovered
				type={LinkType.action}
				fontSize="13px"
				fontWeight={600}
				color={currentColorScheme?.main?.accent ?? undefined}
				onClick={onEditLink}
				isTextOverflow
			>
				{linkTitle}
			</Link>
			<Text fontSize="12px" fontWeight={600}>
				{t("Files:Protected")}
			</Text>
		</div>
	);

	return (
		<ModalDialog
			visible={visible}
			onClose={onClose}
			withBodyScroll
			displayType={ModalDialogType.aside}
			withoutPadding
			dataTestId="embedding_panel_modal"
		>
			<ModalDialog.Header>{t("Files:EmbeddingSettings")}</ModalDialog.Header>
			<ModalDialog.Body>
				<div className={styles.embeddingPanelBody}>
					{barIsVisible ? (
						<div className={styles.embeddingPanelBanner}>
							<Text fontSize="12px" fontWeight={400}>
								{isAdmin ? (
									<Trans
										t={t as TFunction}
										ns="EmbeddingPanel"
										i18nKey="EmbeddingBarAllowList"
										components={{
											1: (
												<Link
													onClick={onOpenDevTools}
													color={currentColorScheme?.main?.accent ?? undefined}
													isHovered
													dataTestId="embedding_panel_dev_tools_link"
												/>
											),
										}}
									>
										{`"Add the website URL for embedding to the <1>allow list</1>."`}
									</Trans>
								) : (
									t("EmbeddingPanel:EmbeddingBarDescription", {
										productName: getBrandName("ProductName"),
									})
								)}
							</Text>
							<IconButton
								className={styles.embeddingPanelBannerCloseIcon}
								size={12}
								iconName={CrossReactSvg}
								onClick={onCloseBar}
								dataTestId="embedding_panel_banner_close"
							/>
						</div>
					) : null}
					<div>
						{sharedLinksOptions && sharedLinksOptions.length > 1 ? (
							<>
								<Text
									className={styles.embeddingPanelHeaderLink}
									fontSize="15px"
									fontWeight={600}
								>
									{t("EmbeddingPanel:Link")}
								</Text>
								<ComboBox
									className={styles.embeddingPanelComboBox}
									scaled
									onSelect={onChangeSharedLink}
									options={sharedLinksOptions}
									selectedOption={selectedLink as TOption}
									displaySelectedOption
									directionY="bottom"
									withLabel={false}
									dataTestId="embedding_panel_link_selector"
								/>
							</>
						) : null}

						{showLinkBar ? (
							<PublicRoomBar
								className={styles.embeddingPanelBar}
								headerText={barTitle}
								bodyText={barSubTitle}
								iconName={TabletLinkReactSvgUrl}
								barIsVisible={barIsVisible}
							/>
						) : null}

						<Text
							className={styles.embeddingPanelHeaderText}
							fontSize="15px"
							fontWeight={600}
						>
							{t("EmbeddingPanel:DisplaySettings")}
						</Text>

						<div className={styles.embeddingPanelInputsContainer}>
							<DisplayBlock
								label={t("EmbeddingPanel:Width")}
								name="embed_width"
								inputValue={widthValue}
								onInputChange={onChangeWidth}
								selectedOption={widthDimension}
								onSelectDimension={onChangeWidthDimension}
							/>
							<DisplayBlock
								label={t("EmbeddingPanel:Height")}
								name="embed_height"
								inputValue={heightValue}
								onInputChange={onChangeHeight}
								selectedOption={heightDimension}
								onSelectDimension={onChangeHeightDimension}
							/>
						</div>

						{!isFile ? (
							<>
								<Text
									className={styles.embeddingPanelHeaderText}
									fontSize="15px"
									fontWeight={600}
								>
									{t("JavascriptSdk:InterfaceElements")}
								</Text>

								<div className={styles.embeddingPanelCheckboxContainer}>
									<CheckboxElement
										label={t("Common:Title")}
										onChange={onHeaderChange}
										isChecked={embeddingConfig.showTitle}
										img={theme.isBase ? HeaderUrl : HeaderDarkUrl}
										title={t("JavascriptSdk:Header")}
										description={t("JavascriptSdk:HeaderDescription", {
											productName: getBrandName("ProductName"),
										})}
										dataTestId="show_title"
									/>
									<CheckboxElement
										label={t("JavascriptSdk:SearchFilterAndSort")}
										onChange={onTitleChange}
										isChecked={embeddingConfig.showFilter}
										img={theme.isBase ? SearchUrl : SearchDarkUrl}
										title={t("JavascriptSdk:SearchBlock")}
										dataTestId="show_filter"
										description={t(
											"JavascriptSdk:ManagerSearchBlockDescription",
										)}
									/>
								</div>
							</>
						) : null}

						<div className={styles.embeddingPanelCodeContainer}>
							<Text
								className={styles.embeddingPanelHeaderText}
								fontSize="15px"
								fontWeight={600}
							>
								{t("JavascriptSdk:Code")}
							</Text>
							<IconButton
								className={styles.embeddingPanelCopyIcon}
								size={16}
								iconName={CopyReactSvgUrl}
								onClick={onCopyLink}
								dataTestId="embedding_panel_copy_code"
							/>
							<Textarea
								isReadOnly
								value={codeBlock}
								heightTextArea="150px"
								dataTestId="embedding_panel_code_textarea"
							/>
						</div>
					</div>
				</div>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					className="send-invitation"
					scale
					size={ButtonSize.normal}
					primary
					onClick={onCopyAndClose}
					label={t("Common:Copy")}
					isLoading={isLoading}
					testId="embedding_panel_copy_button"
				/>
				<Button
					className="cancel-button"
					scale
					size={ButtonSize.normal}
					onClick={onClose}
					label={t("Common:CancelButton")}
					isLoading={isLoading}
					testId="embedding_panel_cancel_button"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject<TStore>(
	({ dialogsStore, settingsStore, userStore, publicRoomStore }) => {
		const {
			embeddingPanelData,
			setEmbeddingPanelData,
			linkParams,
			setEditLinkPanelIsVisible,
			setLinkParams,
		} = dialogsStore;
		const { theme, currentColorScheme } = settingsStore;
		const { user } = userStore;
		const { fetchExternalLinks } = publicRoomStore;

		return {
			theme,
			currentColorScheme,
			visible: embeddingPanelData.visible,
			itemId: (embeddingPanelData.item as unknown as TRoom)?.id,
			isRoom: (embeddingPanelData.item as unknown as TRoom)?.isRoom,
			setEmbeddingPanelData,
			setEditLinkPanelIsVisible,
			linkParams,
			setLinkParams,
			fetchExternalLinks,
			isAdmin: user?.isAdmin || user?.isOwner,
		};
	},
)(
	withTranslation(["Files", "EmbeddingPanel", "JavascriptSdk"])(
		observer(EmbeddingPanelComponent),
	),
);
