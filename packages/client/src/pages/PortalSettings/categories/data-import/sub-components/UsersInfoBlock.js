import styled from "styled-components";
import { tablet } from "@docspace/components/utils/device";

import HelpButton from "@docspace/components/help-button";
import Text from "@docspace/components/text";

const Wrapper = styled.div`
  margin: 16px 0;

  .license-limit-warning {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${(props) =>
      props.theme.client.settings.migration.exceededTextColor};
  }
`;

const UsersInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: ${(props) =>
    props.theme.client.settings.migration.infoBlockBackground};
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  @media ${tablet} {
    max-width: 100%;
  }

  .selected-users-count {
    margin-right: 24px;
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;
  }

  .selected-admins-count {
    margin-right: 8px;
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;

    span {
      font-weight: 700;
      font-size: 14px;
      margin-left: 4px;
      color: ${(props) =>
        props.selectedUsers > props.totalLicenceLimit
          ? props.theme.client.settings.migration.exceededTextColor
          : props.theme.client.settings.migration.infoBlockTextColor};
    }
  }
`;

const UsersInfoBlock = ({
  t,
  selectedUsers,
  totalUsers,
  totalLicenceLimit,
}) => {
  return (
    <Wrapper>
      {selectedUsers > totalLicenceLimit && (
        <Text className="license-limit-warning">
          {t("Settings:UserLimitExceeded")}
        </Text>
      )}

      <UsersInfoWrapper
        selectedUsers={selectedUsers}
        totalLicenceLimit={totalLicenceLimit}
      >
        <Text className="selected-users-count">
          {t("Settings:SelectedUsersCounter", { selectedUsers, totalUsers })}
        </Text>
        <div className="selected-admins-count">
          {t("Settings:LicenseLimitCounter")}
          <Text as="span">
            {selectedUsers}/{totalLicenceLimit}
          </Text>
        </div>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">{t("Settings:LicenseLimitDescription")}</Text>
          }
        />
      </UsersInfoWrapper>
    </Wrapper>
  );
};

export default UsersInfoBlock;
