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
import Scrollbar from "@docspace/components/scrollbar";

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
  const capitalize = (str) => {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  };

  const cloneRoles = JSON.parse(JSON.stringify(roles));
  const capitalizedRoles = cloneRoles.map((item) => {
    const title = capitalize(item.title);
    return { ...item, title };
  });

  const everyoneRoleNode = (
    <>
      <StyledRow className="row">
        <StyledNumber>1</StyledNumber>
        <StyledEveryoneRoleIcon />
        <StyledEveryoneRoleContainer>
          <div className="title">
            <StyledRole>{capitalizedRoles[0].title}</StyledRole>
          </div>
          <div className="role-description truncate">{descriptionEveryone}</div>
        </StyledEveryoneRoleContainer>
      </StyledRow>
    </>
  );

  return (
    <StyledFillingRoleSelector {...props}>
      <StyledTooltip className="tooltip" visibleTooltip={visibleTooltip}>
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

      <div className="list-header truncate">{listHeader}:</div>

      <Scrollbar stype="mediumBlack">
        {everyoneRoleNode}
        {capitalizedRoles.map((role, index) => {
          if (index === 0) return;
          const roleWithUser = users?.find((user) => user.role === role.title);

          return roleWithUser ? (
            <StyledUserRow className="row" key={index}>
              <div className="content">
                <StyledNumber>{index + 1}</StyledNumber>

                <StyledAvatar src={roleWithUser.avatar} />
                <div className="user-with-role">
                  <StyledRole className="user truncate">
                    {roleWithUser.displayName}
                  </StyledRole>
                  <StyledAssignedRole className="truncate">
                    {roleWithUser.role}
                  </StyledAssignedRole>
                </div>
              </div>
              <ReactSVG
                className="remove-image"
                src={RemoveSvgUrl}
                onClick={() => onRemoveUser(roleWithUser.id)}
              />
            </StyledUserRow>
          ) : (
            <StyledRow className="row" key={index}>
              <StyledNumber>{index + 1}</StyledNumber>
              <StyledAddRoleButton
                onClick={() => {
                  onAddUser(role);
                }}
                color={`#` + role.color}
              />
              <StyledRole className="truncate">{role.title}</StyledRole>
            </StyledRow>
          );
        })}
      </Scrollbar>
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
