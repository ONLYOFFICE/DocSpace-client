import styled from "styled-components";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";

const StyledRowContent = styled(RowContent)`
  .row-main-container-wrapper {
    flex-direction: column;
  }

  .mainIcons {
    align-self: flex-start;
  }

  .import-accounts-name {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .import-account-duplicate {
    color: #2db482;
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .user-email {
    margin-right: 5px;
  }
`;

const UsersRowContent = ({ t, sectionWidth, displayName, email, isDuplicate }) => {
  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <div className="import-accounts-name">
        {displayName}
        {isDuplicate && (
          <span className="import-account-duplicate">&nbsp;({t("Settings:ExistingAccount")})</span>
        )}
      </div>
      <Text fontSize="12px" color="#a3a9ae" className="user-email">
        {email}
      </Text>
    </StyledRowContent>
  );
};

export default UsersRowContent;
