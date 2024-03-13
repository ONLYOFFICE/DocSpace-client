import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { RowContent } from "@docspace/shared/components/row-content";
import { ComboBox } from "@docspace/shared/components/combobox";

const StyledRowContent = styled(RowContent)`
  display: flex;

  .row-main-container-wrapper {
    width: 100%;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 0px;
          `
        : css`
            margin-right: 0px;
          `}
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .username {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    margin-right: 5px;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-type {
    .combo-button {
      border: none;
      padding: 4px 8px;
      justify-content: flex-end;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.tableRowTextColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-right: 0px;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.tableRowTextColor};
      }
    }
  }
`;

const UsersRowContent = ({
  id,
  sectionWidth,
  displayName,
  email,
  typeOptions,
  roleSelectorRef,
  type,
  changeUserType,
}) => {
  const onSelectUser = (e) => {
    changeUserType(id, e.key);
  };

  const selectedOption =
    typeOptions.find((option) => option.key === type) || {};

  const contentData = [
    <Box
      key={id}
      displayProp="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Text className="username">{displayName}</Text>
        <Text className="user-email">{email}</Text>
      </Box>

      <div ref={roleSelectorRef}>
        <ComboBox
          className="user-type"
          selectedOption={selectedOption}
          options={typeOptions}
          onSelect={onSelectUser}
          scaled
          size="content"
          displaySelectedOption
          modernView
          manualWidth="fit-content"
        />
      </div>
    </Box>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersRowContent));
