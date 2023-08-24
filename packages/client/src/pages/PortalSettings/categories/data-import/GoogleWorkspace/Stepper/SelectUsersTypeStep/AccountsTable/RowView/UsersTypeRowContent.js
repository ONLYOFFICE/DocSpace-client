import { useState, useRef } from "react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";
import AccessRightSelect from "@docspace/components/access-right-select";

const StyledRowContent = styled(RowContent)`
  display: flex;

  .row-main-container-wrapper {
    width: 100%;
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
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
      padding: 0;
      justify-content: flex-end;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.tableRowTextColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.tableRowTextColor};
      }
    }
  }
`;

const UsersTypeRowContent = ({
  sectionWidth,
  displayName,
  email,
  typeOptions,
}) => {
  const [selectUserType, setSelectUserType] = useState(typeOptions[2]);
  const userTypeRef = useRef();

  const contentData = [
    <Box displayProp="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text className="user-email">{email}</Text>
      </Box>

      <div ref={userTypeRef}>
        <AccessRightSelect
          accessOptions={typeOptions}
          selectedOption={selectUserType}
          scaledOptions={false}
          scaled={false}
          manualWidth="fit-content"
          className="user-type"
          onSelect={setSelectUserType}
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

export default UsersTypeRowContent;
