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
    color: #a3a9ae;
  }

  .user-type {
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
`;

const data = [
  {
    key: "docspace-admin",
    label: "DocSpace admin",
  },
  {
    key: "room-admin",
    label: "Room admin",
  },
  {
    key: "power-user",
    label: "Power user",
  },
];

const UsersTypeRowContent = ({ sectionWidth, displayName, email, type }) => {
  const [selectUserType, setSelectUserType] = useState(data[2]);
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
          accessOptions={data}
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
