import React, { useState } from "react";
import styled from "styled-components";
import Text from "@docspace/components/text";
import RowContent from "@docspace/components/row-content";

import AccessRightSelect from "@docspace/components/access-right-select";

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

const UsersRowContent = ({ t, sectionWidth, displayName, email, roleSelectorRef }) => {
  const data = [
    {
      key: "role-DocSpace-admin",
      label: t("Settings:DocSpaceAdmin"),
    },
    {
      key: "role-Room-admin",
      label: t("Settings:RoomAdmin"),
    },
    {
      key: "role-Power-user",
      label: t("Settings:PowerUser"),
    },
  ];
  const [selectedType, setSelectedType] = useState(data[2]);

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
      <div ref={roleSelectorRef}>
        <AccessRightSelect
          accessOptions={data}
          selectedOption={selectedType}
          scaledOptions={false}
          scaled={false}
          manualWidth="fit-content"
          className="role-type-selector"
          onSelect={setSelectedType}
        />
      </div>
    </StyledRowContent>
  );
};

export default UsersRowContent;
