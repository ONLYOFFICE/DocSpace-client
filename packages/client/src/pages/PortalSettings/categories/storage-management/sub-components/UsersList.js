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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { TABLE_PEOPLE_COLUMNS } from "SRC_DIR/helpers/constants";

import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import Filter from "@docspace/shared/api/people/filter";
import { removeUserFilter } from "@docspace/shared/utils/userFilterUtils";
import { FILTER_PEOPLE } from "@docspace/shared/utils/filterConstants";

import { Row } from "@docspace/ui-kit/components/rows";

import styles from "../StyledComponent.module.scss";

const StatisticsComponent = (props) => {
  const {
    accounts,
    iconElement,
    textElement,
    quotaElement,
    buttonProps,
    peopleListLength,
    userFilterData,
    currentUserId,
  } = props;
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const onClickUsers = () => {
    const defaultFilter = Filter.getDefault();
    userFilterData.pageCount = defaultFilter.pageCount;

    const urlFilter = userFilterData.toUrlParams();

    const peopleColumnsKey = `${TABLE_PEOPLE_COLUMNS}=${currentUserId}`;
    const currentColumns = localStorage.getItem(peopleColumnsKey);

    if (currentColumns && !currentColumns.includes("Storage")) {
      const updatedColumns = `${currentColumns},Storage`;
      localStorage.setItem(peopleColumnsKey, updatedColumns);
    }

    if (currentUserId) removeUserFilter(`${FILTER_PEOPLE}=${currentUserId}`);
    navigate(`/accounts/people/filter?${urlFilter}`);
  };

  const usersList = accounts.map((item, index) => {
    const { fileExst, avatar, id, displayName, isRoom, defaultRoomIcon } = item;

    if (index === 5) return;

    return (
      <Row key={id} className={styles.simpleFilesRow}>
        {iconElement(
          id,
          avatar,
          fileExst,
          isRoom,
          defaultRoomIcon,
          "user-icon",
          displayName,
        )}
        {textElement(displayName)}
        {quotaElement(item, "user")}
      </Row>
    );
  });

  return (
    <div className={styles.statistics}>
      <div className="statistics-container">
        <Text fontWeight={600} className="item-statistic">
          {t("Top5Users")}
        </Text>
        {usersList}

        {peopleListLength > 5 ? (
          <Button
            {...buttonProps}
            label={t("Common:ShowMore")}
            onClick={onClickUsers}
            testId="show_more_users_button"
          />
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ userStore, storageManagement }) => {
  const { accounts, userFilterData } = storageManagement;
  const peopleListLength = accounts.length;
  const { user } = userStore;

  return {
    currentUserId: user?.id,
    accounts,
    peopleListLength,
    userFilterData,
  };
})(observer(StatisticsComponent));
