// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
