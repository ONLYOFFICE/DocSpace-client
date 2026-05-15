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
import { inject, observer } from "mobx-react";
import { FixedSizeList as List } from "react-window";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import useResizeObserver from "use-resize-observer";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";
import classNames from "classnames";
import Item from "./Item";
import styles from "../InvitePanel.module.scss";

const USER_ITEM_HEIGHT = 48;

const VirtualScroll = ({ ref, ...props }) => (
	<Scrollbar
		{...props}
		ref={ref}
		paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
	/>
);

VirtualScroll.displayName = "VirtualScroll";

const Row = memo(({ data, index, style }) => {
	const {
		inviteItems,
		setInviteItems,
		changeInviteItem,
		t,
		setHasErrors,
		roomType,
		isOwner,
		isAdmin,
		inputsRef,
		setIsOpenItemAccess,
		isMobileView,
		standalone,
		allowInvitingGuests,
	} = data;

	if (inviteItems === undefined) return;

	const item = inviteItems[index];

	return (
		<Item
			t={t}
			item={item}
			index={index}
			key={item.id}
			style={style}
			setInviteItems={setInviteItems}
			changeInviteItem={changeInviteItem}
			inviteItems={inviteItems}
			setHasErrors={setHasErrors}
			roomType={roomType}
			isOwner={isOwner}
			isAdmin={isAdmin}
			inputsRef={inputsRef}
			setIsOpenItemAccess={setIsOpenItemAccess}
			isMobileView={isMobileView}
			standalone={standalone}
			allowInvitingGuests={allowInvitingGuests}
		/>
	);
});

Row.displayName = "Row";

const ItemsList = ({
	t,
	setInviteItems,
	inviteItems,
	changeInviteItem,
	setHasErrors,
	roomType,
	isOwner,
	isAdmin,
	externalLinksVisible,
	scrollAllPanelContent,
	inputsRef,
	invitePanelBodyRef,
	isMobileView,
	standalone,
	allowInvitingGuests,
}) => {
	const [bodyHeight, setBodyHeight] = useState(0);
	const [offsetTop, setOffsetTop] = useState(0);
	const [isTotalListHeight, setIsTotalListHeight] = useState(false);
	const [isOpenItemAccess, setIsOpenItemAccess] = useState(false);
	const bodyRef = useRef();
	const { height } = useResizeObserver({ ref: bodyRef });
	const { interfaceDirection } = useInterfaceDirection();

	const onBodyResize = useCallback(() => {
		const scrollHeight = bodyRef?.current?.firstChild.scrollHeight;
		const heightList = height || bodyRef.current.offsetHeight;
		const totalHeightItems = inviteItems.length * USER_ITEM_HEIGHT;
		const listAreaHeight = heightList;
		const heightBody = invitePanelBodyRef?.current?.clientHeight;
		const fullHeightList = heightBody - bodyRef.current.offsetTop;
		const heightWitchOpenItemAccess = Math.max(scrollHeight, fullHeightList);

		const calculatedHeight = scrollAllPanelContent
			? Math.max(
					totalHeightItems,
					listAreaHeight,
					isOpenItemAccess ? heightWitchOpenItemAccess : 0,
				)
			: heightList;

		const finalHeight = scrollAllPanelContent
			? isOpenItemAccess
				? calculatedHeight
				: totalHeightItems
			: calculatedHeight;

		setBodyHeight(finalHeight);
		setOffsetTop(bodyRef.current.offsetTop);

		if (scrollAllPanelContent && totalHeightItems && listAreaHeight)
			setIsTotalListHeight(
				totalHeightItems >= listAreaHeight && totalHeightItems >= scrollHeight,
			);
	}, [
		height,
		bodyRef?.current?.offsetHeight,
		inviteItems.length,
		scrollAllPanelContent,
		isOpenItemAccess,
	]);

	useEffect(() => {
		onBodyResize();
	}, [
		bodyRef.current,
		externalLinksVisible,
		height,
		inviteItems.length,
		scrollAllPanelContent,
		isOpenItemAccess,
	]);

	const overflowStyle = scrollAllPanelContent ? "hidden" : "unset";

	const willChangeStyle =
		isMobileView && isOpenItemAccess ? "auto" : "transform";

	return (
		<div
			className={classNames(styles.scrollList, {
				[styles.isAutoHeight]: scrollAllPanelContent && isTotalListHeight,
				[styles.withOffset]: !!offsetTop,
			})}
			offsetTop={offsetTop}
			ref={bodyRef}
			data-testid="invite_panel_items_scroll_list"
			style={{ "--offset-top": `${offsetTop}px` }}
		>
			<List
				style={{ overflow: overflowStyle, willChange: willChangeStyle }}
				direction={interfaceDirection}
				height={bodyHeight}
				width="auto"
				itemCount={inviteItems.length}
				itemSize={USER_ITEM_HEIGHT}
				itemData={{
					inviteItems,
					setInviteItems,
					changeInviteItem,
					setHasErrors,
					roomType,
					isOwner,
					isAdmin,
					inputsRef,
					setIsOpenItemAccess,
					isMobileView,
					t,
					standalone,
					allowInvitingGuests,
				}}
				outerElementType={!scrollAllPanelContent ? VirtualScroll : null}
				data-testid="invite_panel_items_list"
			>
				{Row}
			</List>
		</div>
	);
};

export default inject(({ userStore, dialogsStore, settingsStore }) => {
	const { setInviteItems, inviteItems, changeInviteItem } = dialogsStore;
	const { isOwner, isAdmin } = userStore.user;
	const { standalone, allowInvitingGuests } = settingsStore;

	return {
		setInviteItems,
		inviteItems,
		changeInviteItem,
		isOwner,
		isAdmin,
		standalone,
		allowInvitingGuests,
	};
})(observer(ItemsList));
