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

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import useResizeObserver from "use-resize-observer";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import { TTranslation } from "@docspace/shared/types";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import Item from "./Item";
import styles from "../TemplateAccessSettingsPanel.module.scss";

const USER_ITEM_HEIGHT = 48;

type ItemsListProps = {
	t: TTranslation;
	setInviteItems: (items: TSelectorItem[]) => void;
	inviteItems: TSelectorItem[];
	scrollAllPanelContent: boolean;
	isDisabled: boolean;
};

type RowData = {
	t: TTranslation;
	inviteItems: TSelectorItem[];
	listItems: TSelectorItem[];
	setInviteItems: (items: TSelectorItem[]) => void;
	isDisabled: boolean;
};

type RowProps = {
	data: RowData;
	index: number;
	style: React.CSSProperties;
};

const Row = memo(({ data, index, style }: RowProps) => {
	const { t, inviteItems, setInviteItems, isDisabled, listItems } = data;

	if (listItems === undefined) return;

	const item = listItems[index];

	return (
		<div
			key={item.id}
			style={style}
			className={`${styles.row} row-item`}
			data-testid={`template_access_settings_row_${index}`}
		>
			<Item
				t={t}
				item={item}
				setInviteItems={setInviteItems}
				inviteItems={inviteItems}
				isDisabled={isDisabled}
				index={index}
			/>
		</div>
	);
});

Row.displayName = "Row";

const ItemsList = ({
	t,
	setInviteItems,
	inviteItems,
	scrollAllPanelContent,
	isDisabled,
}: ItemsListProps) => {
	const [bodyHeight, setBodyHeight] = useState(0);
	const [offsetTop, setOffsetTop] = useState(0);
	const [isTotalListHeight, setIsTotalListHeight] = useState(false);
	const bodyRef = useRef<HTMLDivElement>(null);
	const { height } = useResizeObserver({
		ref: bodyRef as React.RefObject<HTMLDivElement>,
	});
	const { interfaceDirection } = useInterfaceDirection();

	const listItems = [...inviteItems].filter(
		(l) => l.templateAccess !== ShareAccessRights.None,
	);

	const onBodyResize = useCallback(() => {
		const bodyElem = bodyRef?.current?.firstChild as HTMLDivElement;
		const scrollHeight = bodyElem?.scrollHeight;
		const heightList = height ?? bodyRef?.current?.offsetHeight;
		const totalHeightItems = listItems.length * USER_ITEM_HEIGHT;
		const listAreaHeight = heightList ?? 0;

		const calculatedHeight = scrollAllPanelContent
			? Math.max(totalHeightItems, listAreaHeight)
			: heightList;

		const finalHeight = scrollAllPanelContent
			? totalHeightItems
			: calculatedHeight;

		const bodyRefOffsetTop = bodyRef?.current?.offsetTop ?? 0;

		setBodyHeight(finalHeight ?? 0);
		setOffsetTop(bodyRefOffsetTop);

		if (scrollAllPanelContent && totalHeightItems && listAreaHeight)
			setIsTotalListHeight(
				totalHeightItems >= listAreaHeight && totalHeightItems >= scrollHeight,
			);
	}, [height, listItems.length, scrollAllPanelContent]);

	useEffect(() => {
		onBodyResize();
	}, [height, listItems.length, scrollAllPanelContent, onBodyResize]);

	const overflowStyle = scrollAllPanelContent ? "hidden" : "unset";

	return (
		<div
			ref={bodyRef}
			className={styles.scrollList}
			style={{
				height:
					scrollAllPanelContent && isTotalListHeight
						? "auto"
						: offsetTop
							? `calc(100% - ${offsetTop}px)`
							: undefined,
			}}
			data-testid="template_access_settings_scroll_list"
		>
			<List
				style={{ overflow: overflowStyle, willChange: "transform" }}
				direction={interfaceDirection}
				height={bodyHeight}
				width="auto"
				itemCount={listItems.length}
				itemSize={USER_ITEM_HEIGHT}
				itemData={{
					t,
					inviteItems,
					setInviteItems,
					isDisabled,
					listItems,
				}}
				outerElementType={!scrollAllPanelContent ? Scrollbar : undefined}
				data-testid="template_access_settings_list"
			>
				{Row}
			</List>
		</div>
	);
};

export default ItemsList;
