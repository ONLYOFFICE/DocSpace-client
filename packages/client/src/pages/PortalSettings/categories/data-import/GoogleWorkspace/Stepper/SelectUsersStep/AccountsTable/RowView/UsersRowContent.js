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

  .user-existing {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.existingTextColor};
  }
`;

const UsersRowContent = ({ sectionWidth, displayName, email, dublicate }) => {
  const isExistingUser = dublicate !== "—";

  const contentData = [
    <>
      <Text className="username">{displayName}</Text>
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
