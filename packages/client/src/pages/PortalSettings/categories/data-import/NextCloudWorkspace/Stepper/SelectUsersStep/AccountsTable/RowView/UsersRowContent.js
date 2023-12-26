import styled, { css } from "styled-components";
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 5px;
          `
        : css`
            margin-right: 5px;
          `}
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-existing {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.existingTextColor};
  }
`;

const UsersRowContent = ({
  t,
  data,
  sectionWidth,
  displayName,
  email,
  isDuplicate,
}) => {
  const contentData = [
    <div key={data.key}>
      <Box displayProp="flex">
        <Text className="username">{displayName}</Text>
        {isDuplicate && (
          <Text className="user-existing">
            ({t("Settings:ExistingAccount")})
          </Text>
        )}
      </Box>

      <Text className="user-email">{email}</Text>
    </div>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default UsersRowContent;
