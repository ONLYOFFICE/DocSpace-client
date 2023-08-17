import styled from "styled-components";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";

const StyledRowContent = styled(RowContent)`
  display: flex;

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

  .user-existing {
    font-size: 12px;
    font-weight: 600;
    color: #2db482;
  }
`;

const UsersRowContent = ({ sectionWidth, displayName, email, dublicate }) => {
  const isExistingUser = dublicate !== "—";

  const contentData = [
    <>
      <Text fontWeight={600} fontSize="14px">
        {displayName}
      </Text>
      <Box displayProp="flex">
        <Text className="user-email">{email}</Text>
        {isExistingUser && <Text className="user-existing">{dublicate}</Text>}
      </Box>
    </>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default UsersRowContent;
