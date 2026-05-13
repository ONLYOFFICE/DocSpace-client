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

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";

import { inject, observer } from "mobx-react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import {
  TableGroupMenu,
  TGroupMenuItem,
} from "@docspace/ui-kit/components/table";
import { RowContainer, Row } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";

import UsersRow from "./UsersRow";
import {
  InjectedTypeSelectRowViewProps,
  TypeSelectRowViewProps,
} from "../../../../types";
import styles from "../../../../StyledDataImport.module.scss";

const checkedAccountType = "result";

const RowView = (props: TypeSelectRowViewProps) => {
  const {
    t,
    sectionWidth,
    accountsData,
    typeOptions,

    filteredUsers,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = props as InjectedTypeSelectRowViewProps;
  const theme = useTheme();

  const isIndeterminate =
    checkedUsers.result.length > 0 &&
    checkedUsers.result.length !== filteredUsers.length;

  const toggleAll = (isChecked: boolean) =>
    toggleAllAccounts(isChecked, filteredUsers, checkedAccountType);

  const onClearFilter = () => setSearchValue("");

  const headerMenu = [
    {
      id: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
      onClick: () => {},
      title: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
    },
  ] as TGroupMenuItem[];

  return (
    <RowContainer className={styles.styledRowContainerType} useReactWindow={false}>
      {checkedUsers.result.length > 0 ? (
        <div className="table-group-menu">
          <TableGroupMenu
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.result.length === filteredUsers.length}
            onChange={toggleAll}
          />
        </div>
      ) : null}
      {accountsData.length > 0 ? (
        <>
          <Row className={styles.styledRowType} key="Name">
            <Text className="row-header-title">{t("Common:Name")}</Text>
          </Row>

          {accountsData.map((data) => (
            <UsersRow
              key={data.key}
              data={data}
              sectionWidth={sectionWidth}
              typeOptions={typeOptions}
              isChecked={isAccountChecked(data.key, checkedAccountType)}
              toggleAccount={() => toggleAccount(data, checkedAccountType)}
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
    </RowContainer>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const {
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    filteredUsers,
  } = importAccountsStore;

  return {
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    filteredUsers,
  };
})(observer(RowView));
