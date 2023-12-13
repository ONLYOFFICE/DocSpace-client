import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import EmptyScreenContainer from "@docspace/components/empty-screen-container";
import IconButton from "@docspace/components/icon-button";
import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import RowContainer from "@docspace/components/row-container";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";
import UsersRow from "./UsersRow";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;

  .clear-icon {
    margin-right: 8px;
  }

  .ec-desc {
    max-width: 348px;
  }
`;

const StyledRow = styled(Row)`
  box-sizing: border-box;
  height: 40px;
  min-height: 40px;

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const checkedAccountType = "withEmail";

const RowView = (props) => {
  const {
    t,
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,

    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    currentDeviceType,
  } = props;

  const toggleAll = (isChecked) =>
    toggleAllAccounts(isChecked, withEmailUsers, checkedAccountType);

  const handleToggle = (user) => toggleAccount(user, checkedAccountType);

  const onClearFilter = () => setSearchValue("");

  const isIndeterminate =
    checkedUsers.withEmail.length > 0 &&
    checkedUsers.withEmail.length !== withEmailUsers.length;

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <StyledRowContainer useReactWindow={false}>
      {accountsData.length > 0 ? (
        <>
          <StyledRow
            sectionWidth={sectionWidth}
            checked={checkedUsers.withEmail.length === withEmailUsers.length}
            onSelect={toggleAll}
            indeterminate={isIndeterminate}
          >
            <Text color="#a3a9ae" fontWeight={600} fontSize="12px">
              {t("Common:Name")}
            </Text>
          </StyledRow>

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
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("People:NotFoundUsers")}
          descriptionText={t("People:NotFoundUsersDescription")}
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

export default inject(({ setup, auth, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { currentDeviceType } = auth.settingsStore;
  const {
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    viewAs,
    setViewAs,

    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    currentDeviceType,
  };
})(observer(RowView));
