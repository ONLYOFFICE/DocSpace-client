import { StyledOwnerInfo } from "../../../ChangePortalOwnerDialog/StyledDialog";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { Avatar } from "@docspace/shared/components/avatar";

import CatalogSpamIcon from "PUBLIC_DIR/images/catalog.spam.react.svg";
import { commonIconsStyles } from "@docspace/shared/utils";
import { firstLetterToUppercase } from "@docspace/shared/utils/common";

const StyledCatalogSpamIcon = styled(CatalogSpamIcon)`
  ${commonIconsStyles}
  path {
    fill: #f21c0e;
  }
  padding-left: 8px;
`;

const AccountInfo = ({ user }) => {
  const StatusNode = (
    <Text className="status" noSelect>
      {firstLetterToUppercase(user.statusType)}
    </Text>
  );

  return (
    <StyledOwnerInfo>
      <Avatar
        className="avatar"
        role="user"
        source={user.avatar}
        size={"big"}
        hideRoleIcon={true}
      />
      <div className="info">
        <div className="avatar-name">
          <Text className="display-name" noSelect title={user.displayName}>
            {user.displayName}
          </Text>
          {user.statusType === "disabled" && (
            <StyledCatalogSpamIcon size="small" />
          )}
        </div>

        {StatusNode}
      </div>
    </StyledOwnerInfo>
  );
};

export default AccountInfo;
