import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/shared/utils/device";
import styled, { css } from "styled-components";

import UsersTypeRow from "./UsersTypeRow";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { TableGroupMenu } from "@docspace/shared/components/table";
import { RowContainer } from "@docspace/shared/components/row-container";
import { Row } from "@docspace/shared/components/row";
import { Text } from "@docspace/shared/components/text";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;

  .table-group-menu {
    height: 61px;
    position: absolute;
    z-index: 201;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -16px;
          `
        : css`
            left: -16px;
          `}
    width: 100%;

    margin-top: -35.5px;

    .table-container_group-menu {
      padding: 0px 16px;
      border-image-slice: 0;
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
    }

    .table-container_group-menu-checkbox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

  .header-container-text {
    font-size: 12px;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .table-container_header {
    position: absolute;
  }

  .clear-icon {
    margin-right: 8px;
  }

  .ec-desc {
    max-width: 348px;
  }
`;

const StyledRow = styled(Row)`
  box-sizing: border-box;
  min-height: 40px;

  .row-header-title {
    color: ${(props) => props.theme.client.settings.migration.tableHeaderText};
    font-weight: 600;
    font-size: 12px;
  }

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const checkedAccountType = "result";

const RowView = ({
  t,
  sectionWidth,
  accountsData,
  typeOptions,
  users,
  checkedUsers,
  toggleAccount,
  toggleAllAccounts,
  isAccountChecked,
  setSearchValue,
}) => {
  const isIndeterminate =
    checkedUsers.result.length > 0 &&
    checkedUsers.result.length !== users.result.length;

  const isChecked = checkedUsers.result.length === users.result.length;

  const toggleAll = (isChecked) =>
    toggleAllAccounts(isChecked, users.result, checkedAccountType);

  const onClearFilter = () => {
    setSearchValue("");
  };

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
      onClick: () => {},
    },
  ];

  return (
    <StyledRowContainer useReactWindow={false}>
      {checkedUsers.result.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={isChecked}
            onChange={toggleAll}
          />
        </div>
      )}
      {accountsData.length > 0 ? (
        <>
          <StyledRow key="Name" sectionWidth={sectionWidth} onClick={toggleAll}>
            <Text className="row-header-title">{t("Common:Name")}</Text>
          </StyledRow>

          {accountsData.map((data) => (
            <UsersTypeRow
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
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("Common:NotFoundUsers")}
          descriptionText={t("Common:NotFoundUsersDescription")}
          buttons={
            <Box displayProp="flex" alignItems="center">
              <IconButton
                className="clear-icon"
                isFill
                size="12"
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link
                type="action"
                isHovered={true}
                fontWeight="600"
                onClick={onClearFilter}
              >
                {t("Common:ClearFilter")}
              </Link>
            </Box>
          }
        />
      )}
    </StyledRowContainer>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(RowView));
