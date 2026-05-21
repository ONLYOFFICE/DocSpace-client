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

"use client";

import Image from "next/image";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import ArrowRightSvrUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";
import DefaultLogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import { TPortal } from "@/types";
import { getRedirectURL } from "@/utils";

type ItemProps = {
	portal: TPortal;
	baseDomain: string;
};

const Item = ({ portal, baseDomain }: ItemProps) => {
	const name = portal.portalName.includes(baseDomain)
		? portal.portalName
		: `${portal.portalName}.${baseDomain}`;

	const onClick = () => {
		const redirectUrl = getRedirectURL()?.replace(window.location.origin, name);

		sessionStorage.removeItem("tenant-list");

		window.open(`${portal.portalLink}&referenceUrl=${redirectUrl}`, "_self");
	};

	return (
		<div className="item" onClick={onClick} data-testid={portal}>
			<div className="info">
				<Image
					className="favicon"
					alt="Portal favicon"
					src={DefaultLogoUrl}
					width={32}
					height={32}
				/>
				<Text
					fontWeight={600}
					fontSize="14px"
					lineHeight="16px"
					truncate
					dataTestId="portal_name_text"
				>
					{name.replace("http://", "").replace("https://", "")}
				</Text>
			</div>
			<IconButton
				iconName={ArrowRightSvrUrl}
				size={16}
				className="icon-button"
				dataTestId="open_portal_icon_button"
			/>
		</div>
	);
};

export default Item;
