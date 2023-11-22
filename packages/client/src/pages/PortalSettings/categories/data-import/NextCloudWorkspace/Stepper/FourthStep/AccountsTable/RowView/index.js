import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import UsersRow from "./UsersRow";

import EmptyScreenContainer from "@docspace/components/empty-screen-container";
import IconButton from "@docspace/components/icon-button";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import RowContainer from "@docspace/components/row-container";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

// import { mockData } from "../../mockData";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;

  .table-group-menu {
    height: 60px;
    position: relative;
    z-index: 201;
    left: -20px;
    top: 25px;
    width: 100%;

    .table-container_group-menu {
      padding: 0px 20px;
      border-image-slice: 0;
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
    }

    .table-container_group-menu-checkbox {
      margin-left: 7px;
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

const RowView = (props) => {
  const {
    t,
    users,
    sectionWidth,
    viewAs,
    setViewAs,
    accountsData,
    typeOptions,
    checkedAccounts,
    toggleAccount,
    isAccountChecked,
    onCheckAccounts,
    setSearchValue,
  } = props;
  const rowRef = useRef(null);

  const toggleAll = (checked) => {
    onCheckAccounts(checked, users);
  };

  const onClearFilter = () => {
    setSearchValue("");
  };

  const isIndeterminate =
    checkedAccounts.length > 0 && checkedAccounts.length !== users.length;

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  const headerMenu = [
    {
      id: "change-type",
      key: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      withDropDown: true,
      options: typeOptions,
      iconUrl: ChangeTypeReactSvgUrl,
    },
  ];

  return (
    <StyledRowContainer forwardedRef={rowRef} useReactWindow={false}>
      {checkedAccounts.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={checkedAccounts.length === users.length}
            onChange={toggleAll}
          />
        </div>
      )}
      {accountsData.length > 0 ? (
        <>
          <StyledRow key="Name" sectionWidth={sectionWidth} onClick={toggleAll}>
            <Text className="row-header-title">{t("Common:Name")}</Text>
          </StyledRow>

          {users.map((data) => (
            <UsersRow
              key={data.key}
              data={data}
              sectionWidth={sectionWidth}
              typeOptions={typeOptions}
              isChecked={isAccountChecked(data.key)}
              toggleAccount={() => toggleAccount(data)}
            />
          ))}
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("People:NotFoundUsers")}
          descriptionText={t("People:NotFoundUsersDesc")}
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

export default inject(({ setup, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const {
    users,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    onCheckAccounts,
    setSearchValue,
  } = importAccountsStore;

  return {
    users,
    viewAs,
    setViewAs,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    onCheckAccounts,
    setSearchValue,
  };
})(observer(RowView));
