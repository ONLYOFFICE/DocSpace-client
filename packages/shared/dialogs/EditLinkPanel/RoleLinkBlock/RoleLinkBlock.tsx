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

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg?url";

import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";
import { Text } from "@docspace/ui-kit/components/text";
import { isMobile } from "../../../utils";
import { DeviceType } from "../../../enums";
import type { TOption } from "@docspace/ui-kit/components/combobox";

import styles from "./RoleLinkBlock.module.scss";
import type { RoleLinkBlockProps } from "./RoleLinkBlock.types";

const RoleLinkBlock = ({
	t,
	onSelect,
	selectedOption,
	accessOptions = [],
	currentDeviceType,
}: RoleLinkBlockProps) => {
	const isMobileView = isMobile() || currentDeviceType === DeviceType.mobile;

	const directionX = isMobileView ? undefined : "right";

	const handleSelect = (option: TOption) => {
		onSelect?.(option);
	};

	return (
		<div className={styles.roleLinkBlockWrapper}>
			<Text fontSize="16px" fontWeight={700}>
				{t("Common:RoleForLink")}
			</Text>
			<AccessRightSelect
				fillIcon
				scaledOptions
				fixedDirection
				directionY="both"
				manualWidth="auto"
				type="descriptive"
				onSelect={handleSelect}
				directionX={directionX}
				isDefaultMode={isMobileView}
				isMobileView={isMobileView}
				withBlur={isMobileView}
				isAside={isMobileView}
				withBackground={!isMobileView}
				selectedOption={selectedOption}
				accessOptions={accessOptions}
				comboIcon={ArrowIcon}
				dataTestId="edit_link_panel_role_access_select"
			/>
		</div>
	);
};

export default RoleLinkBlock;
