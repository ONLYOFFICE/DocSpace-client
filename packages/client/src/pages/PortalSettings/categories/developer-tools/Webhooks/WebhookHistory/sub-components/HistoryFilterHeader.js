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

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router";

import FilterReactSvrUrl from "PUBLIC_DIR/images/filter.react.svg?url";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";

import FilterDialog from "./FilterDialog";
import StatusBar from "./StatusBar";

import { HistoryHeaderLoader } from "../../sub-components/Loaders/HistoryHeaderLoader";

import styles from "../WebhookHistory.styled.module.scss";

const HistoryFilterHeader = (props) => {
	const {
		applyFilters,
		historyFilters,
		isGroupMenuVisible,
		fetchConfigName,
		configName,
		clearConfigName,
	} = props;

	const [isFiltersVisible, setIsFiltersVisible] = useState(false);
	const [, startTransition] = useTransition();
	const { id } = useParams();

	const openFiltersModal = () => {
		setIsFiltersVisible(true);
	};

	const closeFiltersModal = () => {
		setIsFiltersVisible(false);
	};

	const handleConfigFetch = async () => {
		await fetchConfigName({
			configId: id,
		});
	};

	useEffect(() => {
		startTransition(handleConfigFetch);
		return clearConfigName;
	}, []);

	return (
		<div>
			<Suspense fallback={<HistoryHeaderLoader />}>
				<header className={styles.listHeader}>
					<Text
						className={styles.listHeading}
						title={configName}
						fontWeight={700}
						fontSize="16px"
					>
						{configName}
					</Text>

					<div
						id="filter-button"
						className={`${styles.filterButton}${isGroupMenuVisible ? ` ${styles.groupMenuVisible}` : ""}`}
						onClick={openFiltersModal}
						data-testid="webhook_filter_button"
					>
						<IconButton iconName={FilterReactSvrUrl} size={16} />
						<span hidden={historyFilters === null} />
					</div>
				</header>
			</Suspense>
			{historyFilters !== null ? (
				<StatusBar applyFilters={applyFilters} />
			) : null}
			<FilterDialog
				visible={isFiltersVisible}
				closeModal={closeFiltersModal}
				applyFilters={applyFilters}
			/>
		</div>
	);
};

export default inject(({ webhooksStore }) => {
	const {
		historyFilters,
		isGroupMenuVisible,
		fetchConfigName,
		configName,
		clearConfigName,
	} = webhooksStore;
	return {
		historyFilters,
		isGroupMenuVisible,
		fetchConfigName,
		configName,
		clearConfigName,
	};
})(observer(HistoryFilterHeader));
