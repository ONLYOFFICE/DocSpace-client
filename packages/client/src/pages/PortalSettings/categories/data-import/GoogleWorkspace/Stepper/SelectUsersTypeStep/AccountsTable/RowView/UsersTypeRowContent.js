import { inject, observer } from "mobx-react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import RowContent from "@docspace/components/row-content";
import ComboBox from "@docspace/components/combobox";

const StyledRowContent = styled(RowContent)`
  display: flex;
  align-items: center;

  .import-accounts-name {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    flex-direction: column;
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .row-main-container-wrapper {
    margin: 0;
  }

  .mainIcons {
    height: auto;
  }

  .role-type-selector {
    .combo-button {
      border: none;
      padding: 0;
      justify-content: flex-end;
      background-color: transparent;
    }

    .combo-button-label {
      color: #a3a9ae;
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: #a3a9ae;
      }
    }
  }
`;

const UsersTypeRowContent = ({
  id,
  sectionWidth,
  displayName,
  email,
  typeOptions,
  userTypeRef,
  type,
  changeUserType,
}) => {
  const onSelectUser = (e) => {
    changeUserType(id, e.key);
  };

  const selectedOption = typeOptions.find((option) => option.key === type) || {};

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <div className="import-accounts-name">
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
          {email}
        </Text>
      </div>
      <div ref={userTypeRef}>
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
    </StyledRowContent>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersTypeRowContent));
