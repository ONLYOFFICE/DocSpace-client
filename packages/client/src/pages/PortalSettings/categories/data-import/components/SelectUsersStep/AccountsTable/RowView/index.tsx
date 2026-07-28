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

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

import { inject, observer } from "mobx-react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { RowContainer, Row } from "@docspace/ui-kit/components/rows";
import { TEnhancedMigrationUser } from "@docspace/shared/api/settings/types";

import UsersRow from "./UsersRow";
import { InjectedRowViewProps, RowViewProps } from "../../../../types";
import styles from "../../../../StyledDataImport.module.scss";

const checkedAccountType = "withEmail";

const RowView = (props: RowViewProps) => {
  const {
    t,
    sectionWidth,
    accountsData,
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = props as InjectedRowViewProps;
  const theme = useTheme();

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    toggleAllAccounts(e.target.checked, withEmailUsers, checkedAccountType);

  const handleToggle = (user: TEnhancedMigrationUser) =>
    toggleAccount(user, checkedAccountType);

  const onClearFilter = () => setSearchValue("");

  const isIndeterminate =
    checkedUsers.withEmail.length > 0 &&
    checkedUsers.withEmail.length !== withEmailUsers.length;

  const isChecked = checkedUsers.withEmail.length === withEmailUsers.length;

  return (
    <RowContainer className={styles.styledRowContainer} useReactWindow={false}>
      {accountsData.length > 0 ? (
        <>
          <Row className={styles.styledRow}>
            <div className="row-header-item">
              {checkedUsers.withEmail.length > 0 ? (
                <Checkbox
                  isIndeterminate={isIndeterminate}
                  isChecked={isChecked}
                  onChange={toggleAll}
                  label={t("Common:Name")}
                />
              ) : null}
            </div>
          </Row>

          {accountsData.map((data) => (
            <UsersRow
              t={t}
              key={data.key}
              data={data}
              sectionWidth={sectionWidth}
              isChecked={isAccountChecked(data.key, checkedAccountType)}
              toggleAccount={() => handleToggle(data)}
            />
          ))}
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={
            theme.isBase ? EmptyScreenPersonSvgUrl : EmptyScreenPersonSvgDarkUrl
          }
          imageAlt={t("Common:NotFoundUsers")}
          headerText={t("Common:NotFoundUsers")}
          descriptionText={t("Common:NotFoundUsersDescription")}
          buttons={
            <div className="buttons-box">
              <IconButton
                className="clear-icon"
                isFill
                size={12}
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link
                type={LinkType.action}
                isHovered
                fontWeight="600"
                onClick={onClearFilter}
              >
                {t("Common:ClearFilter")}
              </Link>
            </div>
          }
        />
      )}
      <div />
    </RowContainer>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const {
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(RowView));
