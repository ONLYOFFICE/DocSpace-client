import React from "react";
import PropTypes from "prop-types";
import { ReactSVG } from "react-svg";
import {
  StyledFillingRoleSelector,
  StyledRow,
  StyledNumber,
  StyledAddRoleButton,
  StyledEveryoneRoleIcon,
  StyledRole,
  StyledEveryoneRoleContainer,
  StyledTooltip,
  StyledAssignedRole,
  StyledAvatar,
  StyledUserRow,
} from "./styled-filling-role-selector";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TooltipSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CrossIcon from "PUBLIC_DIR/images/cross.react.svg?url";

const FillingRoleSelector = ({
  roles,
  users,
  onAddUser,
  onRemoveUser,
  onCloseTooltip,
  descriptionEveryone,
  descriptionTooltip,
  titleTooltip,
  listHeader,
  visibleTooltip,
  ...props
}) => {
  //If the roles in the roles array come out of order
  const cloneRoles = JSON.parse(JSON.stringify(roles));
  const sortedInOrderRoles = cloneRoles.sort((a, b) =>
    a.order > b.order ? 1 : -1
  );

  const everyoneRole = roles.find((item) => item.everyone);

  const everyoneRoleNode = (
    <>
      <StyledRow>
        <StyledNumber>{everyoneRole.order}</StyledNumber>
        <StyledEveryoneRoleIcon />
        <StyledEveryoneRoleContainer>
          <div className="title">
            <StyledRole>{everyoneRole.name}</StyledRole>
            <StyledAssignedRole>{everyoneRole.everyone}</StyledAssignedRole>
          </div>
          <div className="role-description">{descriptionEveryone}</div>
        </StyledEveryoneRoleContainer>
      </StyledRow>
    </>
  );

  return (
    <StyledFillingRoleSelector {...props}>
      <StyledTooltip visibleTooltip={visibleTooltip}>
        <div className="title-container">
          <div className="title-tooltip">
            <ReactSVG className="help-icon" src={TooltipSvgUrl} />
            <div className="title">{titleTooltip}</div>
          </div>

          <ReactSVG
            className="cross-icon"
            src={CrossIcon}
            onClick={onCloseTooltip}
          />
        </div>

        <div className="description">{descriptionTooltip}</div>
      </StyledTooltip>

      <div className="list-header">{listHeader}:</div>

      {everyoneRole && everyoneRoleNode}
      {sortedInOrderRoles.map((role, index) => {
        if (role.everyone) return;
        const roleWithUser = users?.find((user) => user.role === role.name);

        return roleWithUser ? (
          <StyledUserRow key={index}>
            <div className="content">
              <StyledNumber>{role.order}</StyledNumber>

              <StyledAvatar src={roleWithUser.avatar} />
              <div className="user-with-role">
                <StyledRole>{roleWithUser.displayName}</StyledRole>
                <StyledAssignedRole>{roleWithUser.role}</StyledAssignedRole>
              </div>
            </div>
            <ReactSVG
              src={RemoveSvgUrl}
              onClick={() => onRemoveUser(roleWithUser.id)}
            />
          </StyledUserRow>
        ) : (
          <StyledRow key={index}>
            <StyledNumber>{role.order}</StyledNumber>
            <StyledAddRoleButton
              onClick={() => {
                onAddUser(role.name);
              }}
              color={role.color}
            />
            <StyledRole>{role.name}</StyledRole>
          </StyledRow>
        );
      })}
    </StyledFillingRoleSelector>
  );
};

FillingRoleSelector.propTypes = {
  /** Accepts class */
  className: PropTypes.string,
  /** Role description text Everyone */
  descriptionEveryone: PropTypes.string,
  /** Tooltip text */
  descriptionTooltip: PropTypes.string,
  /** Tooltip title */
  titleTooltip: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** List Header */
  listHeader: PropTypes.string,
  /** The function of adding a user to a role */
  onAddUser: PropTypes.func,
  /** Function to remove a user from a role */
  onRemoveUser: PropTypes.func,
  /** Function to closes the tooltip */
  onCloseTooltip: PropTypes.func,
  /** Array of roles */
  roles: PropTypes.array,
  /** Accepts CSS style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Array of assigned users per role */
  users: PropTypes.array,
  /** Visible tooltip */
  visibleTooltip: PropTypes.bool,
};

export default FillingRoleSelector;
