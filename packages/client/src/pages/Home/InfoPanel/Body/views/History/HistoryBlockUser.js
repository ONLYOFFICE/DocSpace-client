import React from "react";
import { useNavigate } from "react-router-dom";
import { decode } from "he";

import { Link } from "@docspace/shared/components";
import { StyledUserNameLink } from "../../styles/history";
import { Text } from "@docspace/shared/components";
const HistoryBlockUser = ({
  user,
  withComma,
  openUser,
  isVisitor,
  isCollaborator,
}) => {
  const username = user.displayName;
  const navigate = useNavigate();

  const onUserClick = () => {
    openUser(user, navigate);
  };

  return (
    <StyledUserNameLink key={user.id} className="user">
      {isVisitor || isCollaborator ? (
        <Text as="span" fontWeight={600}>
          {decode(username)}
        </Text>
      ) : (
        <Link className="username link" onClick={onUserClick}>
          {decode(username)}
        </Link>
      )}
      {withComma ? "," : ""}
      {withComma && <div className="space"></div>}
    </StyledUserNameLink>
  );
};

export default HistoryBlockUser;
