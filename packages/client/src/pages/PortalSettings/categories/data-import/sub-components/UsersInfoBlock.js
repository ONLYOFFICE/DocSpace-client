import styled from "styled-components";
import { tablet } from "@docspace/components/utils/device";

import HelpButton from "@docspace/components/help-button";
import Text from "@docspace/components/text";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  @media ${tablet} {
    max-width: 100%;
  }

  .selected-users-count {
    margin-right: 24px;
    color: #555f65;
    font-weight: 700;
    font-size: 14px;
  }

  .selected-admins-count {
    margin-right: 8px;
    color: #555f65;
    font-weight: 700;
    font-size: 14px;
  }
`;

const UsersInfoBlock = ({
  t,
  selectedUsers,
  totalUsers,
  licencelimit,
  totalLicenceLimit,
}) => {
  return (
    <Wrapper>
      <Text className="selected-users-count">
        {t("Settings:SelectedUsersCounter", { selectedUsers, totalUsers })}
      </Text>
      <Text className="selected-admins-count">
        {t("Settings:LicenseLimitCounter", {
          licencelimit,
          totalLicenceLimit,
        })}
      </Text>
      <HelpButton
        place="right"
        offsetRight={0}
        tooltipContent={
          <Text fontSize="12px">{t("Settings:LicenseLimitDescription")}</Text>
        }
      />
    </Wrapper>
  );
};

export default UsersInfoBlock;
