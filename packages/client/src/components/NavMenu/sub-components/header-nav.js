import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import ProfileActions from "./profile-actions";
import { useTranslation } from "react-i18next";
import {
  mobile,
  tablet,
  getCorrectFourValuesStyle,
} from "@docspace/shared/utils";
import { inject, observer } from "mobx-react";

const StyledNav = styled.nav`
  display: flex;

  padding: ${({ theme }) =>
    getCorrectFourValuesStyle("0 20px 0 16px", theme.interfaceDirection)};

  align-items: center;
  position: absolute;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 0;` : `right: 0;`}
  height: 48px;
  z-index: 180 !important;

  & > div {
    margin: 0 16px;
    padding: 0;
    min-width: 24px;
  }

  @media ${tablet} {
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("0 0px 0 16px", theme.interfaceDirection)};
  }
  .icon-profile-menu {
    cursor: pointer;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`;
const HeaderNav = ({
  user,
  isAuthenticated,
  userIsUpdate,
  setUserIsUpdate,
  getActions,
  hideProfileMenu,
}) => {
  const { t } = useTranslation(["NavMenu", "Common", "About"]);
  const userActions = getActions(t);

  return (
    <StyledNav className="profileMenuIcon hidingHeader">
      {isAuthenticated && user && !hideProfileMenu ? (
        <>
          <ProfileActions
            userActions={userActions}
            user={user}
            userIsUpdate={userIsUpdate}
            setUserIsUpdate={setUserIsUpdate}
          />
        </>
      ) : (
        <></>
      )}
    </StyledNav>
  );
};

HeaderNav.displayName = "HeaderNav";

HeaderNav.propTypes = {
  user: PropTypes.object,
  isAuthenticated: PropTypes.bool,
};

export default inject(({ authStore, profileActionsStore, userStore }) => {
  const { isAuthenticated } = authStore;
  const { user, userIsUpdate, setUserIsUpdate } = userStore;
  const { getActions } = profileActionsStore;

  return {
    user,
    isAuthenticated,
    userIsUpdate,
    setUserIsUpdate,
    getActions,
  };
})(observer(HeaderNav));
