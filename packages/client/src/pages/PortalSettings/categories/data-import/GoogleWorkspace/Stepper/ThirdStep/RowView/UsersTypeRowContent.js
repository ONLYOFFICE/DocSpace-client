import styled from "styled-components";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";

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
    font-size: 13px;
    font-weight: 600;
    color: #a3a9ae;
  }
`;

const UsersTypeRowContent = ({ sectionWidth, displayName, email, type }) => {
  const contentData = [
    <Box displayProp="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Text fontWeight={600} fontSize="14px">
          {displayName}
        </Text>
        <Text className="user-email">{email}</Text>
      </Box>
      <Box>
        <Text className="user-type">{type}</Text>
      </Box>
    </Box>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default UsersTypeRowContent;
